import { ScraperConfig } from "$types/configs";
import { ScrapedMatch } from "$types/scraper";
import { closeBanners, loadFullTable } from "../utils";
import { Page } from "puppeteer";

export async function scrapeFixtures(
    config: ScraperConfig,
    page: Page,
    baseUrl: string,
    path: string,
) {
    await page.goto(baseUrl + path + config.staticPaths.fixtures, {
        waitUntil: "networkidle2",
    });

    await closeBanners(page);

    await loadFullTable(page);

    let scrapedMatches = await page.evaluate(() => {
        let container = document.querySelector(
            "#live-table > div.event.event--fixtures > div > div",
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

                    scrapedMatches.push({
                        timeStr,
                        homeTeamName,
                        awayTeamName,
                        currentMatchday,
                    });
                }
            }
        }

        return scrapedMatches;
    });

    return scrapedMatches;
}
