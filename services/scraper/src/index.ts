import dotenv from 'dotenv';
import { ScraperConfig } from '../../types/configs';
import { Competition, Match, Team } from '../../types/data';
import { getCompetition, getTeam, insertOrUpdateCompetition, insertOrUpdateMatch, insertOrUpdateTeam } from '../../db';

// Load dotenv before importing anything else
dotenv.config();

import { readFileSync } from 'fs';
import puppeteer from 'puppeteer';
import { parseScrapedMatches, parseScrapedTeams } from './controllers/parsers';
import { scrapeCompetitionInfo, scrapeLive, scrapeResults, scrapeTeams } from './controllers/scrapers';
import { getTeamsByCompetition } from '../../db/get-teams';

(async function () {
    const config = JSON.parse(readFileSync(__dirname + "/config.json", 'utf8')) as ScraperConfig;
    const baseUrl = process.env.SCRAPING_URL;
    const headless = !config.debug;

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

    try {
        let promises = config.leagues.map((path) => {
            return processPage(browser, config, baseUrl, path);
        });

        await Promise.all(promises);
    } catch (error) {
        console.error(error);
    } finally {
        const pages = await browser.pages();
        await Promise.all(pages.map((page) => page.close()));
        await browser.close();
    }
})();

async function processPage(browser: puppeteer.Browser, config: ScraperConfig, baseUrl: string, path: string) {
    const page = await browser.newPage();
    await page.goto(baseUrl + path, { waitUntil: 'networkidle2' });

    let competition: Competition;
    let teams: Team[];
    let matches: Match[] = [];

    // Scrape competition info
    if (config.updateCompetitions) {
        competition = await scrapeCompetitionInfo(page, path);

        competition.id = await insertOrUpdateCompetition(competition);
    } else {
        let res = await getCompetition({ code: path });

        if (!res) {
            throw new Error("Competition with code '" + path + "' not found. You may need to enable config.updateCompetitions.");
        }

        competition = res?.data;
        competition.id = res.id;
    }

    // Scrape teams in the competition
    if (config.updateTeams) {
        let scrapedTeams = await scrapeTeams(config, page, baseUrl, path);
        teams = parseScrapedTeams(scrapedTeams);

        competition.teams = [];
        for (let i = 0; i < teams.length; i++) {
            const team = teams[i];
            team.id = await insertOrUpdateTeam(team);
            competition.teams.push(team.id);
        }

        competition.lastUpdated = new Date().toUTCString();
        await insertOrUpdateCompetition(competition);
    } else {
        teams = await getTeamsByCompetition(competition.id);

        if (teams.length === 0) {
            throw new Error("No teams found for competition with id '" + competition.id + "'. You may need to enable config.updateTeams.");
        }
    }

    if (config.updateResults) {
        let scrapedMatches = await scrapeResults(config, page, baseUrl, path);
        competition.currentSeason.currentMatchday = scrapedMatches.reduce((max, match) => { return Math.max(max, match.currentMatchday); }, 0);

        matches = [...matches, ...parseScrapedMatches(scrapedMatches, competition, teams)];
    }

    let liveScrapedMatches = await scrapeLive(config, page, baseUrl, path);
    matches = [...matches, ...parseScrapedMatches(liveScrapedMatches, competition, teams, 'IN_PLAY')];

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        match.id = await insertOrUpdateMatch(match);
    }

    await page.close();
}


