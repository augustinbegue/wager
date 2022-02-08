import { ScraperConfig } from '../../../types/configs';
import { ScrapedMatch, ScrapedTeam } from '../../../types/scraper';
import { closeBanners, downloadImage, loadFullTable } from './utils';
import { parseScrapedMatches, parseScrapedTeams } from './parsers';

import puppeteer from 'puppeteer';
import { prisma, upsertMatch } from '../../../prisma';
import { Competition, Match, Season, Team } from '@prisma/client';
import { CompetitionIncludesSeason, MatchIncludesTeams } from '../../../types/db';

export async function scrapeData(config: ScraperConfig) {
    const baseUrl = process.env.SCRAPING_URL;
    const headless = !config.debug;

    let startTime = new Date();

    if (!baseUrl) {
        throw new Error("Missing environment variable 'SCRAPING_URL'");
    }

    const browser = await puppeteer.launch({
        headless: headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: {
            width: 1920,
            height: 1080
        }
    });

    let matches: Match[] = [];
    try {
        let promises = config.leagues.map((path) => {
            return scrapePath(browser, config, baseUrl, path);
        });

        let data = await Promise.all(promises);
        for (let i = 0; i < data.length; i++) {
            const m = data[i];
            matches = [...matches, ...m];
        }

    } catch (error) {
        console.error(error);
    } finally {
        const pages = await browser.pages();
        await Promise.all(pages.map((page) => page.close()));
        await browser.close();
    }

    console.log("Finished scraping in " + (new Date().getTime() - startTime.getTime()) + "ms");
    return matches;
}


export async function scrapePath(browser: puppeteer.Browser, config: ScraperConfig, baseUrl: string, path: string) {
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
                    }
                },
            },
            update: {
                name: scrapedCompetition.name,
                emblemUrl: scrapedCompetition.emblemUrl,
                currentSeason: {
                    update: {
                        startDate: scrapedCompetition.currentSeason.startDate,
                        endDate: scrapedCompetition.currentSeason.endDate,
                    }
                },
            },
            include: {
                currentSeason: true,
            }
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
            })

            if (!currentSeason) {
                throw new Error("Could not find current season for competition with id '" + res.id + "'.");
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
            }
        });

        if (!res) {
            throw new Error("Competition with code '" + path + "' not found. You may need to enable config.updateCompetitions.");
        }

        if (!res.currentSeason) {
            throw new Error("Could not find current season for competition with id '" + res.id + "'.");
        }

        competition = res as CompetitionIncludesSeason;
    }

    if (!competition.currentSeason) {
        throw new Error("Competition with code '" + path + "' has no current season.");
    }

    // Update season and matchday
    let latestMatch = await prisma.match.findFirst({
        where: {
            competition: {
                currentSeasonId: competition.currentSeason.id,
            }
        },
        orderBy: {
            date: 'desc',
        },
        select: {
            matchday: true,
        }
    })

    if (!latestMatch) {
        console.error(`No matches found for competition with code '${competition.code}', matchday is defaulted to 1`);
    }
    competition.currentSeason = await prisma.season.update({
        where: {
            id: competition.currentSeason.id,
        },
        data: {
            currentMatchday: latestMatch ? latestMatch.matchday : 1,
        }
    })

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
                        }
                    }
                },
                update: {
                    name: teams[i].name,
                    crestUrl: teams[i].crestUrl,
                    competitions: {
                        connect: {
                            id: competition.id,
                        }
                    }
                }
            })
        }
    } else {
        let res = await prisma.competition.findFirst({
            where: {
                id: competition.id,
            },
            include: {
                teams: true,
            }
        })

        if (!res || res.teams.length == 0) {
            throw new Error("No teams found for competition with id '" + competition.id + "'. You may need to enable config.updateTeams.");
        }

        teams = res.teams;
    }

    // Scrape Live Matches
    let liveScrapedMatches = await scrapeLive(page, baseUrl, path);
    matches = [...matches, ...parseScrapedMatches(liveScrapedMatches, competition, teams, 'IN_PLAY')];

    // Scrape Finished Matches
    if (config.updateResults) {
        let scrapedMatches = await scrapeResults(config, page, baseUrl, path);
        competition.currentSeason.currentMatchday = scrapedMatches.reduce((max, match) => { return Math.max(max, match.currentMatchday); }, 0);

        matches = [...matches, ...parseScrapedMatches(scrapedMatches, competition, teams, 'FINISHED')];
    }

    // Scrape Scheduled Matches
    if (config.updateFixtures) {
        let scrapedMatches = await scrapeFixtures(config, page, baseUrl, path);

        matches = [...matches, ...parseScrapedMatches(scrapedMatches, competition, teams, 'SCHEDULED')];
    }

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        let res = upsertMatch(match);

    }

    await page.close();

    return matches;
}

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

export async function scrapeLive(page: puppeteer.Page, baseUrl: string, path: string) {
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

export async function scrapeMatch(match: Match & { homeTeam: Team, awayTeam: Team }, page: puppeteer.Page, baseUrl: string, path: string) {
    await page.goto(baseUrl + path, { waitUntil: 'networkidle2' });

    await closeBanners(page);

    return await page.evaluate(() => {
        let elements = document.querySelectorAll('.event__match');

        let matchElement: HTMLDivElement | null = null;
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i] as HTMLDivElement;

            let homeTeamName = (element.querySelector(".event__participant--home") as HTMLElement)?.innerText;
            let awayTeamName = (element.querySelector(".event__participant--away") as HTMLElement)?.innerText;

            if (homeTeamName === match.homeTeam.name && awayTeamName === match.awayTeam.name) {
                matchElement = element;
                break;
            }
        }

        if (!matchElement) {
            return;
        }

        let homeScoreFullStr = (matchElement.querySelector(".event__score--home") as HTMLElement)?.innerText;
        let awayScoreFullStr = (matchElement.querySelector(".event__score--away") as HTMLElement)?.innerText;

        let homeScoreHalfStr = (matchElement.querySelector(".event__part--home") as HTMLElement)?.innerText;
        let awayScoreHalfStr = (matchElement.querySelector(".event__part--away") as HTMLElement)?.innerText;

        return {
            homeScoreFullStr,
            awayScoreFullStr,
            homeScoreHalfStr,
            awayScoreHalfStr,
            currentMatchday: -1,
            elapsedMinutes: "90",
        }
    }) as ScrapedMatch | undefined
}

export async function scrapeTeams(config: ScraperConfig, page: puppeteer.Page, baseUrl: string, path: string) {
    await page.goto(baseUrl + path + config.staticPaths.standings, { waitUntil: 'networkidle2' });

    await closeBanners(page);

    let scrapedTeams: ScrapedTeam[] = await page.evaluate(() => {
        let container = document.querySelector("#tournament-table-tabs-and-content > div:nth-child(3) > div:nth-child(1) > div > div > div.ui-table__body") as HTMLDivElement;

        let teams = [];
        for (let i = 0; i < container.childNodes.length; i++) {
            const element = container.childNodes[i] as HTMLDivElement;

            let teamEl = element.querySelector('.table__cell--participant') as HTMLDivElement;

            let teamName = (teamEl.querySelector('.tableCellParticipant__name') as HTMLDivElement).innerText;
            let teamCrestUrl = ((teamEl.querySelector('.tableCellParticipant__image') as HTMLAnchorElement).childNodes[0] as HTMLImageElement).src;

            teams.push({ name: teamName, crestUrl: teamCrestUrl });
        }

        return teams;
    });

    for (let i = 0; i < scrapedTeams.length; i++) {
        const team = scrapedTeams[i];

        if (team.crestUrl) {
            let staticAssetUrl = await downloadImage(team.crestUrl, 'teams/', team.name.replace(/\s/g, '').toLowerCase() + '.' + team.crestUrl.split('.').pop());
            team.crestUrl = staticAssetUrl;
        }
    }

    return scrapedTeams;
}

export async function scrapeCompetition(page: puppeteer.Page, baseUrl: string, path: string) {
    await page.goto(baseUrl + path, { waitUntil: 'networkidle2' });

    const emblemUrl = (await page.evaluate(() => {
        let crestContainer = document.querySelector("#mc > div.container__livetable > div.container__heading > div.heading > div.heading__logo.heading__logo--1") as HTMLDivElement;

        if (crestContainer) {
            return 'https://' + window.location.host + crestContainer.style.backgroundImage.slice(4, -1).replace(/"/g, "");
        } else {
            return "";
        }
    }));

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
        emblemUrl: await downloadImage(emblemUrl, 'competitions/', name.replace(/\s/g, '').toLowerCase() + '.png'),
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