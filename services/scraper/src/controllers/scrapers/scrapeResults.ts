import { ScraperConfig } from "$types/configs";
import { ScrapedMatch } from "$types/scraper";
import { closeBanners, loadFullTable } from "../utils";
import { Page } from "puppeteer";

export async function scrapeResults(
    config: ScraperConfig,
    page: Page,
    baseUrl: string,
    path: string,
) {
    await page.goto(baseUrl + path + config.staticPaths.results, {
        waitUntil: "networkidle2",
    });

    await closeBanners(page);

    await loadFullTable(page);

    let scrapedMatches = await page.evaluate(() => {
        let container = document.querySelector(
            "#live-table > div.event.event--results > div > div",
        ) as HTMLDivElement;

        let scrapedMatches: ScrapedMatch[] = [];

        if (container) {
            let currentMatchday = 1;

            for (let i = 0; i < container.childNodes.length; i++) {
                const element = container.childNodes[i] as HTMLElement;

                if (element.classList.contains("event__round")) {
                    currentMatchday = parseInt(element.innerText.split(" ")[1]);
                } else if (element.classList.contains("event__match")) {
                    let timeStr = (
                        element.querySelector(".event__time") as HTMLElement
                    )?.innerText;

                    let homeTeamName = (
                        element.querySelector(
                            ".event__participant--home",
                        ) as HTMLElement
                    )?.innerText;
                    let awayTeamName = (
                        element.querySelector(
                            ".event__participant--away",
                        ) as HTMLElement
                    )?.innerText;

                    let homeScoreFullStr = (
                        element.querySelector(
                            ".event__score--home",
                        ) as HTMLElement
                    )?.innerText;
                    let awayScoreFullStr = (
                        element.querySelector(
                            ".event__score--away",
                        ) as HTMLElement
                    )?.innerText;

                    let homeScoreHalfStr = (
                        element.querySelector(
                            ".event__part--home",
                        ) as HTMLElement
                    )?.innerText;
                    let awayScoreHalfStr = (
                        element.querySelector(
                            ".event__part--away",
                        ) as HTMLElement
                    )?.innerText;

                    scrapedMatches.push({
                        timeStr,
                        homeTeamName,
                        awayTeamName,
                        homeScoreFullStr,
                        awayScoreFullStr,
                        homeScoreHalfStr,
                        awayScoreHalfStr,
                        currentMatchday,
                    });
                }
            }
        }

        return scrapedMatches;
    });

    return scrapedMatches;
}
