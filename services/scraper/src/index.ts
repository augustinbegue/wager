import dotenv from 'dotenv';
import { ScraperConfig } from '../../types/configs';
import { Competition, duration, Match, winner } from '../../types/data';

// Load dotenv before importing anything else
dotenv.config();

import { readFileSync } from 'fs';
import puppeteer from 'puppeteer';
import { scrapedMatchesToMatches } from './controllers/parsers';
import { scrapeCompetitionInfo, scrapeResults } from './controllers/scrapers';

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
    let matches: Match[];

    if (true) {
        competition = await scrapeCompetitionInfo(page, path);
    }

    if (true) {
        let scrapedMatches = await scrapeResults(config, page, path);
        matches = scrapedMatchesToMatches(scrapedMatches, competition);
    }

    await page.close();
}


