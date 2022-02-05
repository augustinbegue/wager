import { ScraperConfig } from '../../../types/configs';
import { Competition, Season } from '../../../types/data';
import { ScrapedMatch, ScrapedTeam } from '../../../types/scraper';
import puppeteer from 'puppeteer';
import { closeBanners, loadFullTable } from './utils';

export async function scrapeFixtures(config: ScraperConfig, page: puppeteer.Page, baseUrl: string, path: string) {
    await page.goto(baseUrl + path + config.staticPaths.fixtures, { waitUntil: 'networkidle2' });

    await closeBanners(page);

    await loadFullTable(page);

    let scrapedMatches = await page.evaluate(() => {
        let container = document.querySelector("#live-table > div.event.event--fixtures > div > div") as HTMLDivElement;

        let scrapedMatches: ScrapedMatch[] = [];

        if (container) {
            let currentMatchday = 1;

            for (let i = 0; i < container.childNodes.length; i++) {
                const element = container.childNodes[i] as HTMLElement;

                if (element.classList.contains("event__round")) {
                    currentMatchday = parseInt(element.innerText.split(" ")[1]);
                } else if (element.classList.contains("event__match")) {
                    let timeStr = (element.querySelector(".event__time") as HTMLElement)?.innerText;

                    let homeTeamName = (element.querySelector(".event__participant--home") as HTMLElement)?.innerText;
                    let awayTeamName = (element.querySelector(".event__participant--away") as HTMLElement)?.innerText;

                    scrapedMatches.push({ timeStr, homeTeamName, awayTeamName, currentMatchday });
                }
            }
        }

        return scrapedMatches;
    });

    return scrapedMatches;
}

export async function scrapeLive(config: ScraperConfig, page: puppeteer.Page, baseUrl: string, path: string) {
    await page.goto(baseUrl + path, { waitUntil: 'networkidle2' });

    let scrapedMatches = await page.evaluate(() => {
        let scrapedMatches = [];
        let liveMatches = document.querySelectorAll('.event__match.event__match--live');

        for (let i = 0; i < liveMatches.length; i++) {
            const element = liveMatches[i] as HTMLDivElement;

            let elapsedMinutes = (element.querySelector('.event__stage--block') as HTMLDivElement).innerText;

            let homeTeamName = (element.querySelector(".event__participant--home") as HTMLElement)?.innerText;
            let awayTeamName = (element.querySelector(".event__participant--away") as HTMLElement)?.innerText;

            let homeScoreFullStr = (element.querySelector(".event__score--home") as HTMLElement)?.innerText;
            let awayScoreFullStr = (element.querySelector(".event__score--away") as HTMLElement)?.innerText;

            let homeScoreHalfStr = (element.querySelector(".event__part--home") as HTMLElement)?.innerText;
            let awayScoreHalfStr = (element.querySelector(".event__part--away") as HTMLElement)?.innerText;

            scrapedMatches.push({ elapsedMinutes, homeTeamName, awayTeamName, homeScoreFullStr, awayScoreFullStr, homeScoreHalfStr, awayScoreHalfStr, currentMatchday: -1 });
        }

        return scrapedMatches;
    });

    return scrapedMatches;
}

export async function scrapeResults(config: ScraperConfig, page: puppeteer.Page, baseUrl: string, path: string) {
    await page.goto(baseUrl + path + config.staticPaths.results, { waitUntil: 'networkidle2' });

    await closeBanners(page);

    await loadFullTable(page);

    let scrapedMatches = await page.evaluate(() => {
        let container = document.querySelector("#live-table > div.event.event--results > div > div") as HTMLDivElement;

        let scrapedMatches: ScrapedMatch[] = [];

        if (container) {
            let currentMatchday = 1;

            for (let i = 0; i < container.childNodes.length; i++) {
                const element = container.childNodes[i] as HTMLElement;

                if (element.classList.contains("event__round")) {
                    currentMatchday = parseInt(element.innerText.split(" ")[1]);
                } else if (element.classList.contains("event__match")) {
                    let timeStr = (element.querySelector(".event__time") as HTMLElement)?.innerText;

                    let homeTeamName = (element.querySelector(".event__participant--home") as HTMLElement)?.innerText;
                    let awayTeamName = (element.querySelector(".event__participant--away") as HTMLElement)?.innerText;

                    let homeScoreFullStr = (element.querySelector(".event__score--home") as HTMLElement)?.innerText;
                    let awayScoreFullStr = (element.querySelector(".event__score--away") as HTMLElement)?.innerText;

                    let homeScoreHalfStr = (element.querySelector(".event__part--home") as HTMLElement)?.innerText;
                    let awayScoreHalfStr = (element.querySelector(".event__part--away") as HTMLElement)?.innerText;

                    scrapedMatches.push({ timeStr, homeTeamName, awayTeamName, homeScoreFullStr, awayScoreFullStr, homeScoreHalfStr, awayScoreHalfStr, currentMatchday });
                }
            }
        }

        return scrapedMatches;
    });

    return scrapedMatches;
}

export async function scrapeTeams(config: ScraperConfig, page: puppeteer.Page, baseUrl: string, path: string) {
    await page.goto(baseUrl + path + config.staticPaths.standings, { waitUntil: 'networkidle2' });

    await closeBanners(page);

    let scrapedTeams: ScrapedTeam[] = await page.evaluate(() => {
        let container = document.querySelector("#tournament-table-tabs-and-content > div:nth-child(3) > div:nth-child(1) > div > div > div.ui-table__body") as HTMLDivElement;

        let promises = [];
        for (let i = 0; i < container.childNodes.length; i++) {
            const element = container.childNodes[i] as HTMLDivElement;

            let teamEl = element.querySelector('.table__cell--participant') as HTMLDivElement;

            let teamName = (teamEl.querySelector('.tableCellParticipant__name') as HTMLDivElement).innerText;
            let teamCrestUrl = (teamEl.querySelector('.tableCellParticipant__image') as HTMLImageElement).src;

            promises.push(new Promise<ScrapedTeam>((resolve) => {
                fetch(teamCrestUrl).then((response) => {
                    response.blob().then((blob) => {

                        let fr = new FileReader();
                        fr.onload = () => {
                            let data = fr.result as string;

                            resolve({
                                name: teamName,
                                crestUrl: data,
                            });
                        };

                        fr.readAsDataURL(blob);
                    });
                });
            }));
        }

        return Promise.all(promises);
    });

    return scrapedTeams;
}

export async function scrapeCompetitionInfo(page: puppeteer.Page, path: string) {
    const emblemUrl = (await page.evaluate(() => {
        return new Promise((resolve, reject) => {
            let crestContainer = document.querySelector("#mc > div.container__livetable > div.container__heading > div.heading > div.heading__logo.heading__logo--1") as HTMLDivElement;

            if (crestContainer) {
                let crestUrl = crestContainer.style.backgroundImage.slice(4, -1).replace(/"/g, "");

                fetch(crestUrl).then((response) => {
                    response.blob().then((blob) => {

                        let fr = new FileReader();
                        fr.onload = () => {
                            let data = fr.result as string;

                            resolve(data);
                        };

                        fr.readAsDataURL(blob);
                    });
                });
            } else {
                resolve("");
            }
        });
    })) as string;

    const name = await page.evaluate(() => {
        let nameContainer = document.querySelector("#mc > div.container__livetable > div.container__heading > div.heading > div.heading__title > div.heading__name") as HTMLDivElement;

        if (nameContainer) {
            return nameContainer.innerText;
        } else {
            return "";
        }
    });

    const season = await page.evaluate(() => {
        let yearContainer = document.querySelector("#mc > div.container__livetable > div.container__heading > div.heading > div.heading__info") as HTMLDivElement;

        let season: Season = {
            id: -1,
            currentMatchday: -1,
            startDate: "",
            endDate: "",
            winner: null,
        };

        if (yearContainer) {
            let years = yearContainer.innerText;
            let startYear = years.split("/")[0];
            let endYear = years.split("/")[1];

            season.startDate = startYear + "-08-01";
            season.endDate = endYear + "-07-31";
        }

        return season;
    });

    let competition: Competition = {
        id: -1,
        name: name,
        emblemUrl: emblemUrl,
        code: path,
        currentSeason: season,
        numberOfAvailableSeasons: 1,
        lastUpdated: new Date().toUTCString(),
        teams: [],
    };
    return competition;
}


