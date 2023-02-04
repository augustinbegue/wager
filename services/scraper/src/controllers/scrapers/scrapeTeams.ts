import { ScraperConfig } from "$types/configs";
import { closeBanners, downloadImage } from "../utils";
import { Page } from "puppeteer";
import { competitionType } from "@prisma/client";

export async function scrapeTeams(
    config: ScraperConfig,
    page: Page,
    baseUrl: string,
    path: string,
) {
    await page.goto(baseUrl + path + config.staticPaths.standings, {
        waitUntil: "networkidle2",
    });

    await closeBanners(page);

    // Preparation for scraping
    let competitionType: competitionType = (await page.evaluate(() => {
        let type = "LEAGUE";

        let container = document.querySelector(
            "#tournament-table-tabs-and-content > div:nth-child(3) > div:nth-child(1) > div > div > div.ui-table__body",
        ) as HTMLDivElement;

        if (!container) {
            type = "CUP";

            // Tournament Based Competition
            let groupStageLink = document.querySelector(
                "#tournament-table > div.tournamentStages > a:nth-child(3)",
            ) as HTMLAnchorElement;
            let playOffsLink = document.querySelector(
                "#tournament-table > div.tournamentStages > a:nth-child(4)",
            ) as HTMLAnchorElement;

            if (groupStageLink) {
                groupStageLink.id = "SCRAPED-GROUP-STAGE-LINK";
            }
        }

        return type;
    })) as competitionType;

    console.log("Competition Type: " + competitionType);

    if (competitionType === "CUP") {
        await Promise.all([
            page.waitForNavigation({ waitUntil: "networkidle2" }),
            page.click("#SCRAPED-GROUP-STAGE-LINK"),
            new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);
    }

    let scrapedTeams: { name: string; crestUrl: string }[] =
        await page.evaluate(() => {
            let containers = document.querySelectorAll(
                "div.ui-table__body",
            ) as NodeListOf<HTMLDivElement>;

            // Standings Based Competition
            let teams = [];
            for (let ci = 0; ci < containers.length; ci++) {
                const container = containers[ci];
                for (let i = 0; i < container.childNodes.length; i++) {
                    const element = container.childNodes[i] as HTMLDivElement;

                    let teamEl = element.querySelector(
                        ".tableCellParticipant",
                    ) as HTMLDivElement;

                    let teamName = (
                        teamEl.querySelector(
                            ".tableCellParticipant__name",
                        ) as HTMLDivElement
                    ).innerText;
                    let teamCrestUrl = (
                        (
                            teamEl.querySelector(
                                ".tableCellParticipant__image",
                            ) as HTMLAnchorElement
                        ).childNodes[0] as HTMLImageElement
                    ).src;

                    teams.push({ name: teamName, crestUrl: teamCrestUrl });
                }
            }

            return teams;
        });

    console.log(`Scraped ${scrapedTeams.length} teams.`);

    for (let i = 0; i < scrapedTeams.length; i++) {
        const team = scrapedTeams[i];

        if (team.crestUrl) {
            let staticAssetUrl = await downloadImage(
                team.crestUrl,
                "teams/",
                team.name.replace(/\s/g, "").toLowerCase() +
                    "." +
                    team.crestUrl.split(".").pop(),
            );
            team.crestUrl = staticAssetUrl;
        }
    }

    return { scrapedTeams, competitionType };
}
