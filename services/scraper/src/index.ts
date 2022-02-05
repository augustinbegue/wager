import dotenv from 'dotenv';
import { ScraperConfig } from '../../types/configs';
import { Competition, Match, Team } from '../../types/data';
import { insertOrUpdateCompetition, insertOrUpdateTeam } from '../../db';

// Load dotenv before importing anything else
dotenv.config();

import { readFileSync } from 'fs';
import puppeteer from 'puppeteer';
import { parseScrapedMatches, parseScrapedTeams } from './controllers/parsers';
import { scrapeCompetitionInfo, scrapeResults, scrapeTeams } from './controllers/scrapers';

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
    let matches: Match[];

    // Scrape competition info
    if (config.updateCompetitions || true) {
        competition = await scrapeCompetitionInfo(page, path);

        competition.id = await insertOrUpdateCompetition(competition);
    } /* else {
        // TODO: Get competition from db
    } */

    // Scrape teams in the competition
    if (config.updateTeams) {
        let scrapedTeams = await scrapeTeams(config, page, baseUrl, path);
        teams = parseScrapedTeams(scrapedTeams);

        for (let team of teams) {
            team.id = await insertOrUpdateTeam(team);
        }
    } else {
        // TODO: Get teams from db
    }

    if (config.updateResults) {
        let scrapedMatches = await scrapeResults(config, page, baseUrl, path);
        matches = parseScrapedMatches(scrapedMatches, competition);
    } else {
        // TODO: Get matches from db
    }

    await page.close();
}


