import { ScrapedMatch } from "$types/scraper";
import { closeBanners } from "../utils";
import { Page } from "puppeteer";
import { Match, Team } from "@prisma/client";

export async function scrapeMatch(
    match: Match & { homeTeam: Team; awayTeam: Team },
    page: Page,
    baseUrl: string,
    path: string,
) {
    if (!match) throw new Error("Match is undefined");

    await page.goto(baseUrl + path, { waitUntil: "networkidle2" });

    await closeBanners(page);

    const scrapedMatch: ScrapedMatch | undefined = await page.evaluate(
        (searchmatch) => {
            let elements = document.querySelectorAll(".event__match");

            if (!searchmatch)
                throw new Error(
                    "Match is undefined for scraping match details " +
                        baseUrl +
                        path,
                );

            let matchElement: HTMLDivElement | null = null;
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i] as HTMLDivElement;

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

                if (
                    homeTeamName === searchmatch.homeTeam.name &&
                    awayTeamName === searchmatch.awayTeam.name
                ) {
                    console.log(
                        `Found finished match ${searchmatch.homeTeam.name} vs ${searchmatch.awayTeam.name}.`,
                    );
                    matchElement = element;
                    break;
                }
            }

            if (!matchElement) {
                return;
            }

            let homeScoreFullStr = (
                matchElement.querySelector(".event__score--home") as HTMLElement
            )?.innerText;
            let awayScoreFullStr = (
                matchElement.querySelector(".event__score--away") as HTMLElement
            )?.innerText;

            let homeScoreHalfStr = (
                matchElement.querySelector(".event__part--home") as HTMLElement
            )?.innerText;
            let awayScoreHalfStr = (
                matchElement.querySelector(".event__part--away") as HTMLElement
            )?.innerText;

            const result = {
                homeScoreFullStr,
                awayScoreFullStr,
                homeScoreHalfStr,
                awayScoreHalfStr,
                homeTeamName: searchmatch.homeTeam.name,
                awayTeamName: searchmatch.awayTeam.name,
                currentMatchday: -1,
                elapsedMinutes: "90",
            };

            return result;
        },
        match as any,
    );

    return scrapedMatch;
}
