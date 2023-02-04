import { ScraperConfig } from "$types/configs";
import { Page } from "puppeteer";

export async function scrapeCup(
    config: ScraperConfig,
    page: Page,
    baseUrl: string,
    path: string,
) {
    await page.goto(baseUrl + path + config.staticPaths.standings, {
        waitUntil: "networkidle2",
    });

    await page.evaluate(() => {
        let container = document.querySelector(
            "#tournament-table-tabs-and-content > div:nth-child(3) > div:nth-child(1) > div > div > div.ui-table__body",
        ) as HTMLDivElement;

        if (!container) {
            // Tournament Based Competition
            let groupStageLink = document.querySelector(
                "#tournament-table > div.tournamentStages > a:nth-child(3)",
            ) as HTMLAnchorElement;
            let playOffsLink = document.querySelector(
                "#tournament-table > div.tournamentStages > a:nth-child(4)",
            ) as HTMLAnchorElement;

            if (playOffsLink) {
                playOffsLink.id = "SCRAPED-PLAYOFFS-LINK";
            }
        }
    });

    await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2" }),
        page.click("#SCRAPED-PLAYOFFS-LINK"),
        new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);

    let scrapedStages: {
        team1Name: string;
        team2Name: string;
    }[][] = await page.evaluate(() => {
        let nodes: HTMLDivElement[][] = [];

        let containers = document.querySelectorAll(".draw__brackets");

        containers.forEach((c) => {
            nodes.push(Array.from(c.childNodes) as HTMLDivElement[]);
        });

        let stages = [];

        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            let currentStage: { team1Name: string; team2Name: string }[] = [];

            for (let j = 0; j < n.length; j++) {
                const node = n[j];

                let team1Name =
                    node.querySelector(".bracket__participant--home")
                        ?.firstChild?.textContent ?? "";
                let team2Name =
                    node.querySelector(".bracket__participant--away")
                        ?.firstChild?.textContent ?? "";

                currentStage.push({
                    team1Name,
                    team2Name,
                });
            }

            stages.push(currentStage);
        }

        return stages;
    });

    return scrapedStages;
}
