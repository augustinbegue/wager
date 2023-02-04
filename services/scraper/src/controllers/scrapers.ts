import { ScraperConfig } from "../../../types/configs";
import { ScrapedMatch, ScrapedTeam } from "../../../types/scraper";
import { closeBanners, downloadImage, loadFullTable } from "./utils";
import { parseScrapedMatches, parseScrapedTeams } from "./parsers";

import puppeteer, { Browser, Page } from "puppeteer";
import { prisma } from "../../../prisma";
import { Competition, Match, Season, Team } from "@prisma/client";
import {
    CompetitionIncludesSeason,
    MatchIncludesTeams,
} from "../../../types/db";
import { upsertMatch } from "./db";
import { EventsController } from "../events/events-controller";
import e from "cors";

export async function scrapeData(config: ScraperConfig) {
    const baseUrl = process.env.SCRAPING_URL;

    let startTime = new Date();

    if (!baseUrl) {
        throw new Error("Missing environment variable 'SCRAPING_URL'");
    }

    const browser = await puppeteer.launch({
        headless: !config.debug,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    });

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

    try {
        console.log(
            `Closing browser instance: ${
                browser.process()?.pid
            } (scrapeLiveData())`,
        );

        // Close browser
        const pages = await browser.pages();
        await Promise.all(pages.map((page) => page.close()));
        await browser.close();

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

export async function scrapePath(
    browser: Browser,
    config: ScraperConfig,
    baseUrl: string,
    path: string,
) {
    const page = await browser.newPage();

    let competition: CompetitionIncludesSeason;
    let teams: Team[];
    let matches: Match[] = [];

    // Scrape competition info
    if (config.updateCompetitions) {
        let scrapedCompetition = await scrapeCompetition(page, baseUrl, path);

        let res = await prisma.competition.upsert({
            where: {
                code: scrapedCompetition.code,
            },
            create: {
                name: scrapedCompetition.name,
                code: scrapedCompetition.code,
                emblemUrl: scrapedCompetition.emblemUrl,
                currentSeason: {
                    create: {
                        startDate: scrapedCompetition.currentSeason.startDate,
                        endDate: scrapedCompetition.currentSeason.endDate,
                    },
                },
            },
            update: {
                name: scrapedCompetition.name,
                emblemUrl: scrapedCompetition.emblemUrl,
                currentSeason: {
                    update: {
                        startDate: scrapedCompetition.currentSeason.startDate,
                        endDate: scrapedCompetition.currentSeason.endDate,
                    },
                },
            },
            include: {
                currentSeason: true,
            },
        });

        if (!res.currentSeason) {
            let currentSeason = await prisma.season.findFirst({
                where: {
                    competition: {
                        id: res.id,
                    },
                    startDate: scrapedCompetition.currentSeason.startDate,
                    endDate: scrapedCompetition.currentSeason.endDate,
                },
            });

            if (!currentSeason) {
                throw new Error(
                    "Could not find current season for competition with id '" +
                        res.id +
                        "'.",
                );
            }

            competition = {
                ...res,
                currentSeason,
            };
        } else {
            competition = res as CompetitionIncludesSeason;
        }
    } else {
        let res = await prisma.competition.findFirst({
            where: {
                code: path,
            },
            include: {
                currentSeason: true,
            },
        });

        if (!res) {
            throw new Error(
                "Competition with code '" +
                    path +
                    "' not found. You may need to enable config.updateCompetitions.",
            );
        }

        if (!res.currentSeason) {
            throw new Error(
                "Could not find current season for competition with id '" +
                    res.id +
                    "'.",
            );
        }

        competition = res as CompetitionIncludesSeason;
    }

    if (!competition.currentSeason) {
        throw new Error(
            "Competition with code '" + path + "' has no current season.",
        );
    }

    // Update season and matchday
    let latestMatch = await prisma.match.findFirst({
        where: {
            competition: {
                currentSeasonId: competition.currentSeason.id,
            },
            OR: [
                {
                    status: "FINISHED",
                },
                {
                    status: "IN_PLAY",
                },
            ],
        },
        orderBy: {
            matchday: "desc",
        },
        select: {
            matchday: true,
        },
    });

    if (!latestMatch) {
        console.error(
            `No matches found for competition with code '${competition.code}', matchday is defaulted to 1`,
        );
    }
    competition.currentSeason = await prisma.season.update({
        where: {
            id: competition.currentSeason.id,
        },
        data: {
            currentMatchday: latestMatch ? latestMatch.matchday : 1,
        },
    });
    console.log(
        `Updated competition with code '${competition.code}' to matchday ${competition.currentSeason.currentMatchday}`,
    );

    // Scrape teams in the competition
    if (config.updateTeams) {
        let scrapedTeams = await scrapeTeams(config, page, baseUrl, path);
        teams = parseScrapedTeams(scrapedTeams);

        competition.teamIds = [];
        for (let i = 0; i < teams.length; i++) {
            teams[i] = await prisma.team.upsert({
                where: {
                    name: teams[i].name,
                },
                create: {
                    name: teams[i].name,
                    crestUrl: teams[i].crestUrl,
                    competitions: {
                        connect: {
                            id: competition.id,
                        },
                    },
                },
                update: {
                    name: teams[i].name,
                    crestUrl: teams[i].crestUrl,
                    competitions: {
                        connect: {
                            id: competition.id,
                        },
                    },
                },
            });
        }
    } else {
        let res = await prisma.competition.findFirst({
            where: {
                id: competition.id,
            },
            include: {
                teams: true,
            },
        });

        if (!res || res.teams.length == 0) {
            throw new Error(
                "No teams found for competition with id '" +
                    competition.id +
                    "'. You may need to enable config.updateTeams.",
            );
        }

        teams = res.teams;
    }

    // Scrape Live Matches
    let liveScrapedMatches = await scrapeLive(page, baseUrl, path);
    matches = [
        ...matches,
        ...parseScrapedMatches(
            liveScrapedMatches,
            competition,
            teams,
            "IN_PLAY",
        ),
    ];

    // Scrape Finished Matches
    if (config.updateResults) {
        let scrapedMatches = await scrapeResults(config, page, baseUrl, path);
        competition.currentSeason.currentMatchday = scrapedMatches.reduce(
            (max, match) => {
                return Math.max(max, match.currentMatchday);
            },
            0,
        );

        matches = [
            ...matches,
            ...parseScrapedMatches(
                scrapedMatches,
                competition,
                teams,
                "FINISHED",
            ),
        ];
    }

    // Scrape Scheduled Matches
    if (config.updateFixtures) {
        let scrapedMatches = await scrapeFixtures(config, page, baseUrl, path);

        matches = [
            ...matches,
            ...parseScrapedMatches(
                scrapedMatches,
                competition,
                teams,
                "SCHEDULED",
            ),
        ];
    }

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        matches[i] = await upsertMatch(match, competition.currentSeason.id);
    }

    await page.close();

    return matches;
}

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

            if (groupStageLink) {
                groupStageLink.click();
            }
        }
    });

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

    return scrapedTeams;
}

export async function scrapeCompetition(
    page: Page,
    baseUrl: string,
    path: string,
) {
    await page.goto(baseUrl + path, { waitUntil: "networkidle2" });

    const emblemUrl = await page.evaluate(() => {
        let image = document.querySelector(
            "#mc > div.container__livetable > div.container__heading > div.heading > img",
        ) as HTMLImageElement;

        if (image) {
            return image.src;
        } else {
            return "";
        }
    });

    const name = await page.evaluate(() => {
        let nameContainer = document.querySelector(
            "#mc > div.container__livetable > div.container__heading > div.heading > div.heading__title > div.heading__name",
        ) as HTMLDivElement;

        if (nameContainer) {
            return nameContainer.innerText;
        } else {
            return "";
        }
    });

    const season = await page.evaluate(() => {
        let yearContainer = document.querySelector(
            "#mc > div.container__livetable > div.container__heading > div.heading > div.heading__info",
        ) as HTMLDivElement;

        let season = {
            currentMatchday: 0,
            startDate: "2021-08-01",
            endDate: "2022-07-31",
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

    let competition = {
        id: 0,
        name: name,
        emblemUrl: await downloadImage(
            emblemUrl,
            "competitions/",
            name.replace(/\s/g, "").toLowerCase() + ".png",
        ),
        code: path,
        currentSeason: {
            startDate: new Date(season.startDate),
            endDate: new Date(season.endDate),
            currentMatchday: season.currentMatchday,
        },
        numberOfAvailableSeasons: 1,
        teams: [],
    };
    return competition;
}
