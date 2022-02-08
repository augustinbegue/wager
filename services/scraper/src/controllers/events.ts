import { prisma, upsertMatch } from '../../../prisma'
import { Competition, Match, Team } from '@prisma/client';

import { ScraperConfig } from "../../../types/configs";
import puppeteer from 'puppeteer';
import { scrapeLive, scrapeMatch, scrapePath } from "./scrapers";
import { ScrapedMatch } from "../../../types/scraper";
import { parseScrapedMatches } from "./parsers";
import { CompetitionIncludesSeason } from '../../../types/db';

export async function update(config: ScraperConfig) {
    console.log('Update started...');
    const baseUrl = process.env.SCRAPING_URL;
    const headless = !config.debug;

    let startTime = new Date();

    if (!baseUrl) {
        throw new Error("Missing environment variable 'SCRAPING_URL'");
    }

    const browser = await puppeteer.launch({
        headless: headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: {
            width: 1920,
            height: 1080
        }
    });

    let matches: Match[] = [];
    try {
        let promises = config.leagues.map((path) => {
            return scrapePath(browser, config, baseUrl, path);
        });

        let data = await Promise.all(promises);
        for (let i = 0; i < data.length; i++) {
            const m = data[i];
            matches = [...matches, ...m];
        }

    } catch (error) {
        console.error(error);
    } finally {
        const pages = await browser.pages();
        await Promise.all(pages.map((page) => page.close()));
        await browser.close();
    }

    console.log("Finished scraping in " + (new Date().getTime() - startTime.getTime()) + "ms");

    // Get all matches in the next 12 hours
    let now = new Date().getTime();
    let cutoff = now + (1000 * 60 * 60 * 12);

    let next12HMatches = matches.filter((match) => {
        let date = match.date.getTime();

        return match.status === 'SCHEDULED' && date < cutoff || match.status === 'IN_PLAY';
    })

    console.log("Found " + next12HMatches.length + " matches in the next 12 hours:");
    next12HMatches.forEach(match => {
        console.log(`${match.homeTeamId} vs ${match.awayTeamId} - ${match.date.toLocaleString()}`);
        setTimeout(matchStart, match.date.getTime() - now, match);
    });
}

let liveCompetitions: number[] = [];
let liveMatches: { matchId: number, code: string }[] = [];
let startedMatches: { matchId: number, code: string }[] = [];

export async function matchStart(match: Match) {
    console.log('Match started: ' + match.homeTeamId + ' vs ' + match.homeTeamId);

    let competition = await prisma.competition.findUnique({ where: { id: match.competitionId } });
    if (!competition) {
        throw new Error('Competition with id ' + match.competitionId + ' not found');
    }

    liveMatches.push({
        matchId: match.id,
        code: competition.code
    });

    if (liveCompetitions.indexOf(competition.id) === -1) {
        liveCompetitions.push(competition.id);
        console.log(`${competition.name} is live`);

        if (liveCompetitions.length === 1) {
            liveScrape();
        }
    }
}

export async function liveScrape() {
    console.log('Live scraping started...');
    let start = new Date().getTime();

    // Setup
    const baseUrl = process.env.SCRAPING_URL as string;
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    let matches: Match[] = [];
    for (let i = 0; i < liveCompetitions.length; i++) {
        const id = liveCompetitions[i];

        try {
            // Get competition
            let competition: CompetitionIncludesSeason;
            let findUnique = await prisma.competition.findUnique({ where: { id }, include: { currentSeason: true } });
            if (!findUnique) {
                throw new Error("Competition with id '" + id + "' not found.");
            }

            competition = findUnique;

            // Get Teams
            let findTeams = await prisma.competition.findUnique({ where: { id }, select: { teams: true } });
            if (findTeams?.teams.length === 0) {
                throw new Error("No teams found for competition with id '" + competition.id + "'.");
            }
            let teams = findTeams?.teams as Team[];

            // Scrape live matches
            let scrapedMatches = await scrapeLive(page, baseUrl, competition.code);
            matches = [...matches, ...parseScrapedMatches(scrapedMatches, competition, teams, 'IN_PLAY')];

            // Update matches
            for (let i = 0; i < matches.length; i++) {
                console.log(`Updating match ${matches[i].id} (${matches[i].homeTeamId} vs ${matches[i].awayTeamId})`);
                matches[i] = await upsertMatch(matches[i]);
            }
        } catch (error) {
            console.error(`Error scraping live matches for competition with code '${id}':`);
            console.error(error);
        }
    }

    // Check for started matches
    for (let i = 0; i < liveMatches.length; i++) {
        const obj = liveMatches[i];
        let match = matches.find(match => match.id === obj.matchId);

        if (match) {
            startedMatches.push(obj);
        }
    }

    // Check for finished matches
    for (let i = 0; i < startedMatches.length; i++) {
        const obj = startedMatches[i];
        let match: Match | undefined | null = matches.find(match => match.id === obj.matchId);

        if (!match) {
            let matchIncludesTeams = await prisma.match.findUnique({ where: { id: obj.matchId }, include: { homeTeam: true, awayTeam: true } });

            if (matchIncludesTeams != null) {
                let scrapedMatch = await scrapeMatch(matchIncludesTeams, page, baseUrl, obj.code);

                if (scrapedMatch) {
                    matchEnd(obj, scrapedMatch);
                }
            }
        }
    }

    // Close browser
    const pages = await browser.pages();
    await Promise.all(pages.map((page) => page.close()));
    await browser.close();

    console.log('Live scraping finished in ' + (new Date().getTime() - start) + 'ms');
    console.log(liveCompetitions);

    setTimeout(liveScrape, 1000 * 30);
}

export async function matchEnd(obj: { matchId: number, code: string }, scrapedMatch: ScrapedMatch) {
    console.log('Match ended: ' + obj.matchId);


    let competition = await prisma.competition.findUnique({ where: { code: obj.code }, include: { currentSeason: true, teams: true } });
    if (!competition) {
        console.error('Competition with code ' + obj.code + ' not found.');
        return;
    }

    let teams = competition.teams;
    if (teams.length === 0) {
        console.error('No teams found for competition with id ' + competition.id + '.');
        return;
    }

    let match = parseScrapedMatches([scrapedMatch], competition, teams, 'FINISHED')[0];
    match = await upsertMatch(match);

    liveMatches.splice(liveMatches.indexOf(obj), 1);
    startedMatches.splice(liveMatches.indexOf(obj), 1);
    if (liveMatches.filter(o => o.code === obj.code).length === 0) {
        liveCompetitions.splice(liveCompetitions.indexOf(competition.id), 1);
    }
}