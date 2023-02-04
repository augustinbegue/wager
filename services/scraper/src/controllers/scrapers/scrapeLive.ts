import { Page } from "puppeteer";

export async function scrapeLive(page: Page, baseUrl: string, path: string) {
    await page.goto(baseUrl + path, { waitUntil: "networkidle2" });

    let scrapedMatches = await page.evaluate(() => {
        let scrapedMatches = [];
        let liveMatches = document.querySelectorAll(
            ".event__match.event__match--live",
        );

        for (let i = 0; i < liveMatches.length; i++) {
            const element = liveMatches[i] as HTMLDivElement;

            let elapsedMinutes = (
                element.querySelector(".event__stage--block") as HTMLDivElement
            ).innerText;

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
                element.querySelector(".event__score--home") as HTMLElement
            )?.innerText;
            let awayScoreFullStr = (
                element.querySelector(".event__score--away") as HTMLElement
            )?.innerText;

            let homeScoreHalfStr = (
                element.querySelector(".event__part--home") as HTMLElement
            )?.innerText;
            let awayScoreHalfStr = (
                element.querySelector(".event__part--away") as HTMLElement
            )?.innerText;

            scrapedMatches.push({
                elapsedMinutes,
                homeTeamName,
                awayTeamName,
                homeScoreFullStr,
                awayScoreFullStr,
                homeScoreHalfStr,
                awayScoreHalfStr,
                currentMatchday: -1,
            });
        }

        return scrapedMatches;
    });

    return scrapedMatches;
}
