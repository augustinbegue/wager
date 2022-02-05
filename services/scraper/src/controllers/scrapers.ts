import { ScraperConfig } from '../../../types/configs';
import { Competition, Season } from '../../../types/data';
import { ScrapedMatch } from '../../../types/scraper';
import puppeteer from 'puppeteer';
import { closeBanners } from './utils';

export async function scrapeResults(config: ScraperConfig, page: puppeteer.Page, path: string) {
    await page.goto(page.url() + config.staticPaths.results, { waitUntil: 'networkidle2' });

    await closeBanners(page);

    // Load the whole table
    try {
        let anchor = await page.$("#live-table > div.event.event--results > div > div > a");
        while (anchor) {
            await anchor.click();

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                page.evaluate(() => history.pushState(null, "", null)),
            ]);

            anchor = await page.$("#live-table > div.event.event--results > div > div > a");
        }
    } catch (error) {
        console.log(error);
    }

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
            id: 1,
            currentMatchday: 1,
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
        id: 1,
        name: name,
        emblemUrl: emblemUrl,
        code: path,
        currentSeason: season,
        numberOfAvailableSeasons: 1,
        lastUpdated: new Date().toUTCString(),
    };
    return competition;
}


