import { ScraperConfig } from "$types/configs";
import { parseScrapedMatches } from "../parsers";

import puppeteer from "puppeteer";
import { prisma } from "$prisma";
import { Match } from "@prisma/client";
import { upsertMatch } from "../db";
import { EventsController } from "../../events/events-controller";
import { scrapeMatch } from "./scrapeMatch";
import { scrapeLive } from "./scrapeLive";
import { scrapePath } from "./scrapePath";
import { kill } from "process";

export async function scrapeData(config: ScraperConfig) {
    const baseUrl = process.env.SCRAPING_URL;

    let startTime = new Date();

    if (!baseUrl) {
        throw new Error("Missing environment variable 'SCRAPING_URL'");
    }

    const browser = await puppeteer.launch({
        headless: !config.debug,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: process.env.CHROME_BIN,
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    });

    if (config.debug) {
        browser;
    }

    let matches: Match[] = [];
    try {
        if (!config.debug) {
            let promises = config.leagues.map((path) => {
                return scrapePath(browser, config, baseUrl, path);
            });

            let data = await Promise.all(promises);
            for (let i = 0; i < data.length; i++) {
                const m = data[i];
                matches = [...matches, ...m];
            }
        } else {
            // Scrape one competition at a time in Debug Mode
            for (let i = 0; i < config.leagues.length; i++) {
                const path = config.leagues[i];

                let m = await scrapePath(browser, config, baseUrl, path);

                matches = [...matches, ...m];
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        console.log(
            "Closing browser instance: " +
                browser.process()?.pid +
                ` (scrapeData())`,
        );

        const pages = await browser.pages();
        await Promise.all(pages.map((page) => page.close()));
        await browser.close();

        console.log("Browser closed.");
    }

    console.log(
        "Finished scraping in " +
            (new Date().getTime() - startTime.getTime()) +
            "ms",
    );
    return matches;
}

export async function scrapeLiveData(eventsController: EventsController) {
    console.log("Live scraping started...");
    let start = new Date().getTime();

    // Setup
    const baseUrl = process.env.SCRAPING_URL as string;
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.CHROME_BIN,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        timeout: 0,
    });
    const page = await browser.newPage();

    let matches: Match[] = [];
    for (let i = 0; i < eventsController.liveCompetitions.length; i++) {
        const id = eventsController.liveCompetitions[i];

        try {
            // Get competition
            let competition = await prisma.competition.findUnique({
                where: { id },
                include: { currentSeason: true, teams: true },
            });
            if (!competition) {
                throw new Error("Competition with id '" + id + "' not found.");
            }

            let teams = competition.teams;

            let tempMatches: Match[] = [];
            // Scrape live matches
            let scrapedMatches = await scrapeLive(
                page,
                baseUrl,
                competition.code,
            );
            tempMatches = parseScrapedMatches(
                scrapedMatches,
                competition,
                teams,
                "IN_PLAY",
            );

            // Update matches
            for (let i = 0; i < tempMatches.length; i++) {
                console.log(
                    `Updating match (${tempMatches[i].homeTeamId} vs ${tempMatches[i].awayTeamId}, seasonId: ${competition.currentSeason.id})`,
                );
                tempMatches[i] = await upsertMatch(
                    tempMatches[i],
                    competition.currentSeason.id,
                    eventsController,
                );
            }

            matches = [...matches, ...tempMatches];
        } catch (error) {
            console.error(
                `Error scraping live matches for competition with code '${id}':`,
            );
            console.error(error);
        }
    }

    // Check for started matches
    for (let i = 0; i < eventsController.liveMatches.length; i++) {
        const obj = eventsController.liveMatches[i];
        let match = matches.find((match) => match.id === obj.matchId);

        if (match) {
            eventsController.startedMatches.push(obj);
        }
    }

    try {
        // Check for finished matches
        for (let i = 0; i < eventsController.startedMatches.length; i++) {
            const obj = eventsController.startedMatches[i];

            // If the match is not in the list of live matches, it is finished
            if (!matches.find((match) => match.id === obj.matchId)) {
                let matchIncludesTeams = await prisma.match.findUnique({
                    where: { id: obj.matchId },
                    include: { homeTeam: true, awayTeam: true },
                });

                if (matchIncludesTeams && matchIncludesTeams != null) {
                    let scrapedMatch = await scrapeMatch(
                        matchIncludesTeams,
                        page,
                        baseUrl,
                        obj.code,
                    );

                    if (scrapedMatch) {
                        eventsController.matchEnd(obj, scrapedMatch);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error checking for finished matches:", error);
    }

    try {
        let pid = browser.process()?.pid;

        console.log(
            `Closing browser instance: ${
                browser.process()?.pid
            } (scrapeLiveData())`,
        );

        // Close browser
        const pages = await browser.pages();
        await Promise.all(pages.map((page) => page.close()));
        await browser.close();

        try {
            if (pid) kill(pid);
        } catch (error) {}

        console.log("Browser closed");
    } catch (error) {
        console.error("Error closing browser", error);
    }

    console.log(
        "Live scraping finished in " + (new Date().getTime() - start) + "ms",
    );

    if (eventsController.liveCompetitions.length > 0) {
        setTimeout(() => {
            scrapeLiveData(eventsController);
        }, 1000 * 30);
    }
}
