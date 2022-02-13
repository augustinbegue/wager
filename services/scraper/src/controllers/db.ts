import { prisma } from "../../../prisma"
import { Match } from "@prisma/client"
import { updateStandingsForMatch } from "./standings"

export async function upsertMatch(match: Match, seasonId: number) {
    let matchEntry = await prisma.match.findFirst({
        where: {
            homeTeamId: match.homeTeamId,
            awayTeamId: match.awayTeamId,
            competition: {
                currentSeasonId: seasonId
            },
        }
    })

    if (matchEntry) {
        let updated = await prisma.match.update({
            where: {
                id: matchEntry.id
            },
            data: {
                winner: match.winner,
                homeTeamScore: match.homeTeamScore,
                awayTeamScore: match.awayTeamScore,
                duration: match.duration,
                status: match.status,
                betInfo: {
                    upsert: {
                        create: {
                            opened: match.status === "SCHEDULED",
                            finished: match.status === "FINISHED",
                            resultHomeTeamOdd: 0,
                            resultDrawOdd: 0,
                            resultAwayTeamOdd: 0,
                            resultHomeTeamOrDrawOdd: 0,
                            resultAwayTeamOrDrawOdd: 0,
                            goalsHomeTeamOdds: [],
                            goalsAwayTeamOdds: [],
                        },
                        update: {
                            opened: match.status === "SCHEDULED",
                            finished: match.status === "FINISHED",
                        }
                    }
                }
            }
        })

        // Match started
        if (matchEntry.status === "SCHEDULED" && match.status === "IN_PLAY") {
            // TODO: Close bets

            // TODO: Send notifications
        }

        // Match finished
        if (matchEntry.status === "IN_PLAY" && match.status === "FINISHED") {
            console.log(`Updated finished match: ${matchEntry.id}`);
            // Update standings
            updateStandingsForMatch(match);

            // TODO: Compute bets results

            // TODO: Send notifications
        }

        return updated;
    } else {
        // Create match
        match = await prisma.match.create({
            data: {
                date: match.date,
                homeTeamId: match.homeTeamId,
                awayTeamId: match.awayTeamId,
                status: match.status,
                matchday: match.matchday,
                winner: match.winner,
                homeTeamScore: match.homeTeamScore,
                awayTeamScore: match.awayTeamScore,
                duration: match.duration,
                competitionId: match.competitionId,
            }
        });

        // Create bet info
        await prisma.betInfo.create({
            data: {
                matchId: match.id,
                opened: false,
                finished: false,
                resultHomeTeamOdd: 0,
                resultDrawOdd: 0,
                resultAwayTeamOdd: 0,
                resultHomeTeamOrDrawOdd: 0,
                resultAwayTeamOrDrawOdd: 0,
                goalsHomeTeamOdds: [],
                goalsAwayTeamOdds: [],
            }
        });

        return match;
    }
}