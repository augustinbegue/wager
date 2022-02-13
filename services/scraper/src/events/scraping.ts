import puppeteer from 'puppeteer';

import { prisma } from '../../../prisma'
import { Competition, Match, Team } from '@prisma/client';

import { CompetitionFull, CompetitionIncludesSeason } from '../../../types/db';
import { ScrapedMatch } from "../../../types/scraper";

import { scrapeLive, scrapeMatch } from "../controllers/scrapers";
import { parseScrapedMatches } from "../controllers/parsers";
import { upsertMatch } from "../controllers/db";

let liveCompetitions: number[] = [];
let liveMatches: { matchId: number, code: string }[] = [];
let startedMatches: { matchId: number, code: string }[] = [];

export async function scrapedMatchStart(match: Match) {
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
            let competition
                = await prisma.competition.findUnique({ where: { id }, include: { currentSeason: true, teams: true } });
            if (!competition) {
                throw new Error("Competition with id '" + id + "' not found.");
            }

            let teams = competition.teams;

            let tempMatches: Match[] = [];
            // Scrape live matches
            let scrapedMatches = await scrapeLive(page, baseUrl, competition.code);
            tempMatches = parseScrapedMatches(scrapedMatches, competition, teams, 'IN_PLAY');

            // Update matches
            for (let i = 0; i < tempMatches.length; i++) {
                console.log(`Updating match (${tempMatches[i].homeTeamId} vs ${tempMatches[i].awayTeamId}, seasonId: ${competition.currentSeason.id})`);
                tempMatches[i] = await upsertMatch(tempMatches[i], competition.currentSeason.id);
            }

            matches = [...matches, ...tempMatches];
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
                    scrapedMatchEnd(obj, scrapedMatch);
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

export async function scrapedMatchEnd(obj: { matchId: number, code: string }, scrapedMatch: ScrapedMatch) {
    console.log('Match ended: ' + obj.matchId);

    // Retreive the required data
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

    // Update match
    let match = parseScrapedMatches([scrapedMatch], competition, teams, 'FINISHED')[0];
    match = await upsertMatch(match, competition.currentSeason.id);

    // Remove from live matches
    liveMatches.splice(liveMatches.indexOf(obj), 1);
    startedMatches.splice(liveMatches.indexOf(obj), 1);
    if (liveMatches.filter(o => o.code === obj.code).length === 0) {
        liveCompetitions.splice(liveCompetitions.indexOf(competition.id), 1);
    }
}