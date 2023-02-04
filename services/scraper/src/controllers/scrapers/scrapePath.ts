import { ScraperConfig } from "$types/configs";
import {
    parseScrapedMatches,
    parseScrapedStages,
    parseScrapedTeams,
} from "../parsers";
import { Browser } from "puppeteer";
import { prisma } from "$prisma";
import { Match, Team } from "@prisma/client";
import { CompetitionIncludesSeason } from "$types/db";
import { upsertMatch } from "../db";
import { scrapeCompetition } from "./scrapeCompetition";
import { scrapeTeams } from "./scrapeTeams";
import { scrapeResults } from "./scrapeResults";
import { scrapeLive } from "./scrapeLive";
import { scrapeFixtures } from "./scrapeFixtures";
import { scrapeCup } from "./scrapeCup";

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
        let { scrapedTeams, competitionType } = await scrapeTeams(
            config,
            page,
            baseUrl,
            path,
        );
        teams = parseScrapedTeams(scrapedTeams);

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

        await prisma.competition.update({
            where: {
                id: competition.id,
            },
            data: {
                type: competitionType,
            },
        });
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

    // If competition is a cup, we need to parse & build the cup tree
    if (competition.type === "CUP" && config.updateCompetitions) {
        let scrapedStages = await scrapeCup(config, page, baseUrl, path);

        await prisma.cupStage.deleteMany({
            where: {
                AND: [
                    { competitionId: competition.id },
                    { seasonId: competition.currentSeason.id },
                ],
            },
        });

        await parseScrapedStages(competition, scrapedStages);
    }

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        matches[i] = await upsertMatch(match, competition.currentSeason.id);
    }

    await page.close();

    return matches;
}
