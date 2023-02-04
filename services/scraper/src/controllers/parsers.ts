import moment from "moment";
import { ScrapedMatch, ScrapedStage, ScrapedTeam } from "$types/scraper";
import { CompetitionIncludesSeason } from "$types/db";
import {
    Team,
    status,
    scoreType,
    Match,
    winner,
    CupStage,
    Competition,
    CupRound,
} from "@prisma/client";
import { prisma } from "$prisma";

const scoreStatuses: status[] = ["LIVE", "IN_PLAY", "FINISHED", "PAUSED"];
const matchDayStatuses: status[] = ["FINISHED", "SCHEDULED"];

export function parseScrapedMatches(
    scrapedMatches: ScrapedMatch[],
    competition: CompetitionIncludesSeason,
    teams: Team[],
    status: status = "FINISHED",
): Match[] {
    const matches: Match[] = [];

    for (let i = 0; i < scrapedMatches.length; i++) {
        const scrapedMatch = scrapedMatches[i];
        try {
            let fullTime = {
                homeTeam: scrapedMatch.homeScoreFullStr
                    ? parseInt(scrapedMatch.homeScoreFullStr)
                    : null,
                awayTeam: scrapedMatch.awayScoreFullStr
                    ? parseInt(scrapedMatch.awayScoreFullStr)
                    : null,
            };
            let duration: scoreType = scoreType.FULL_TIME;

            let date = new Date();

            // Parse date
            if (scrapedMatch.elapsedMinutes) {
                if (scrapedMatch.elapsedMinutes.startsWith("Half Time")) {
                    status = "PAUSED";
                    scrapedMatch.elapsedMinutes = "45";
                } else if (isNaN(parseInt(scrapedMatch.elapsedMinutes))) {
                    scrapedMatch.elapsedMinutes = "90";
                }
                date = new Date(
                    date.getTime() -
                        parseInt(scrapedMatch.elapsedMinutes) * 60000,
                );
                date.setSeconds(0, 0);
            } else if (scrapedMatch.timeStr) {
                let [day, month] = scrapedMatch.timeStr
                    .split(" ")[0]
                    .split(".");

                let year =
                    month > "12"
                        ? moment(competition.currentSeason.startDate).year()
                        : moment(competition.currentSeason.endDate).year();

                date.setFullYear(year, parseInt(month) - 1, parseInt(day));
                let [hours, minutes] = scrapedMatch.timeStr
                    .split(" ")[1]
                    .split(":");
                date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            }

            // Parse Winner
            let matchWinner: winner | null =
                fullTime.homeTeam != null && fullTime.awayTeam != null
                    ? fullTime.homeTeam > fullTime.awayTeam
                        ? "HOME_TEAM"
                        : fullTime.homeTeam === fullTime.awayTeam
                        ? "DRAW"
                        : "AWAY_TEAM"
                    : null;

            let homeTeam = teams.find(
                (team) => team.name === scrapedMatch.homeTeamName,
            );
            let awayTeam = teams.find(
                (team) => team.name === scrapedMatch.awayTeamName,
            );

            if (!homeTeam || !awayTeam) {
                throw new Error(
                    "team not found: " + scrapedMatch.homeTeamName ||
                        scrapedMatch.awayTeamName,
                );
            }

            matches.push({
                id: 0,
                date: date,
                homeTeamId: homeTeam.id,
                awayTeamId: awayTeam.id,
                status: status,
                matchday:
                    (matchDayStatuses.includes(status)
                        ? scrapedMatch.currentMatchday
                        : competition.currentSeason.currentMatchday) || 1,
                winner: matchWinner,
                homeTeamScore: fullTime.homeTeam,
                awayTeamScore: fullTime.awayTeam,
                duration: duration,
                minutes: scrapedMatch.elapsedMinutes
                    ? parseInt(scrapedMatch.elapsedMinutes)
                    : null,
                competitionId: competition.id,
                cupRoundId: null,
            });
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
                console.log("Scraped Match: " + JSON.stringify(scrapedMatch));
                continue;
            } else {
                throw error;
            }
        }
    }

    return matches;
}

export function parseScrapedTeams(scrapedTeams: ScrapedTeam[]): Team[] {
    return scrapedTeams.map((scrapedTeam) => {
        return {
            id: 0,
            name: scrapedTeam.name,
            shortName: scrapedTeam.name,
            crestUrl: scrapedTeam.crestUrl,
        };
    });
}

export async function parseScrapedStages(
    competition: CompetitionIncludesSeason,
    scrapedStages: ScrapedStage[],
) {
    if (!scrapedStages || scrapedStages.length === 0) {
        console.log(`No stages found for competition ${competition.code}`);
        return;
    }

    // Check if all stages have the correct number of rounds, and add them if not
    let currRoundCount = scrapedStages[0].length / 2;
    let r = 1;
    while (currRoundCount >= 1) {
        if (!scrapedStages[r]) {
            scrapedStages.push([]);
        }

        if (scrapedStages[r].length !== currRoundCount) {
            console.log(
                `Stage ${r} has ${
                    scrapedStages[r].length
                } rounds, but should have ${currRoundCount} rounds. Adding ${
                    currRoundCount - scrapedStages[r].length
                } missing rounds...`,
            );

            let addCount = currRoundCount - scrapedStages[r].length;

            for (let i = 0; i < addCount; i++) {
                scrapedStages[r].push({
                    team1Name: "TBD",
                    team2Name: "TBD",
                });
            }
        }

        currRoundCount /= 2;
        r++;
    }

    // Reverse order of stages from first to last: we need to know the next stage before inserting
    scrapedStages.reverse();

    let nextStage:
        | (CupStage & {
              rounds: CupRound[];
          })
        | null = null;

    let nextRoundIndex = 0;
    let nextRoundUsage = 0;

    for (let i = 0; i < scrapedStages.length; i++) {
        const scrapedStage = scrapedStages[i];

        let stage: CupStage & {
            rounds: CupRound[];
        } = await prisma.cupStage.create({
            data: {
                competitionId: competition.id,
                seasonId: competition.currentSeason.id,
                nextId: nextStage?.id,
                order: i,
            },
            include: {
                rounds: true,
            },
        });

        for (let j = 0; j < scrapedStage.length; j++) {
            const scrapedRound = scrapedStage[j];

            if (nextRoundUsage === 2) {
                nextRoundIndex++;
                nextRoundUsage = 0;
            }

            let connect = [];

            if (scrapedRound.team1Name !== "TBD") {
                connect.push({
                    name: scrapedRound.team1Name,
                });
            }
            if (scrapedRound.team2Name !== "TBD") {
                connect.push({
                    name: scrapedRound.team2Name,
                });
            }

            let round = await prisma.cupRound.create({
                data: {
                    stageId: stage.id,
                    nextId: nextStage?.rounds[nextRoundIndex]?.id,
                    ...(connect.length > 0
                        ? {
                              teams: {
                                  connect,
                              },
                          }
                        : {}),
                    order: j,
                },
            });

            nextRoundUsage++;

            stage.rounds.push(round);
        }

        nextRoundIndex = 0;
        nextRoundUsage = 0;

        nextStage = stage;
    }
}
