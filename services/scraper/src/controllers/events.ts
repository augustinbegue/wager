import { ScraperConfig } from "../../../types/configs";
import puppeteer from 'puppeteer';
import { scrapeLive, scrapeMatch, scrapePath } from "./scrapers";
import { Competition, Match } from "../../../types/data";
import { ScrapedMatch } from "../../../types/scraper";
import { getCompetition, updateCurrentMatchday, getTeamsByCompetition, insertOrUpdateMatch, getMatch } from "../../../db";
import { parseScrapedMatches } from "./parsers";

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
        let date = new Date(match.utcDate).getTime();

        return match.status === 'SCHEDULED' && date < cutoff || match.status === 'IN_PLAY';
    })

    console.log("Found " + next12HMatches.length + " matches in the next 12 hours:");
    next12HMatches.forEach(match => {
        console.log(`${match.homeTeam.name} vs ${match.awayTeam.name} - ${new Date(match.utcDate).toLocaleString()}`);
        setTimeout(matchStart, new Date(match.utcDate).getTime() - now, match);
    });
}

let liveCompetitions: string[] = [];
let liveMatches: { matchId: string, code: string }[] = [];
let startedMatches: { matchId: string, code: string }[] = [];

export async function matchStart(match: Match) {
    console.log('Match started: ' + match.homeTeam.name + ' vs ' + match.awayTeam.name);

    let competition = await getCompetition({ name: match.competition.name })
    if (!competition) {
        return;
    }

    liveMatches.push({
        matchId: match.id,
        code: competition.data.code
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
            let competition: Competition;
            let res = await getCompetition({ id: id });
            if (!res) {
                throw new Error("Competition with id '" + id + "' not found.");
            }
            competition = res?.data;
            competition.currentSeason.currentMatchday = await updateCurrentMatchday(competition.currentSeason);

            // Get Teams
            let teams = await getTeamsByCompetition(competition.id);
            if (teams.length === 0) {
                throw new Error("No teams found for competition with id '" + competition.id + "'.");
            }

            // Scrape live matches
            let scrapedMatches = await scrapeLive(page, baseUrl, competition.code);
            matches = [...matches, ...parseScrapedMatches(scrapedMatches, competition, teams, 'IN_PLAY')];

            // Update matches
            for (let i = 0; i < matches.length; i++) {
                console.log(`Updating match ${matches[i].id} (${matches[i].homeTeam.name} vs ${matches[i].awayTeam.name})`);
                matches[i].id = await insertOrUpdateMatch(matches[i]);
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
        let match = matches.find(match => match.id === obj.matchId);

        if (!match) {
            match = await getMatch(obj.matchId);

            if (match) {
                let scrapedMatch = await scrapeMatch(match, page, baseUrl, obj.code);

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

export async function matchEnd(obj: { matchId: string, code: string }, scrapedMatch: ScrapedMatch) {
    console.log('Match ended: ' + obj.matchId);


    let competition = await getCompetition({ code: obj.code });
    if (!competition) {
        console.error('Competition with code ' + obj.code + ' not found.');
        return;
    }

    let teams = await getTeamsByCompetition(competition.id);
    if (teams.length === 0) {
        console.error('No teams found for competition with id ' + competition.id + '.');
        return;
    }

    let match = parseScrapedMatches([scrapedMatch], competition.data, teams, 'FINISHED')[0];
    match.id = await insertOrUpdateMatch(match);

    liveMatches.splice(liveMatches.indexOf(obj), 1);
    startedMatches.splice(liveMatches.indexOf(obj), 1);
    if (liveMatches.filter(o => o.code === obj.code).length === 0) {
        liveCompetitions.splice(liveCompetitions.indexOf(obj.code), 1);
    }
}