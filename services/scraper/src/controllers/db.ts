import { prisma } from "../../../prisma"
import { Match } from "@prisma/client"
import { updateStandingsForMatch } from "./standings"
import { EventsController } from "../events/events-controller"

export async function upsertMatch(match: Match, seasonId: number, eventsController?: EventsController) {
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
                            resultHomeTeamOdd: 2.0,
                            resultDrawOdd: 2.0,
                            resultAwayTeamOdd: 2.0,
                            resultHomeTeamOrDrawOdd: 1.5,
                            resultAwayTeamOrDrawOdd: 1.5,
                            goalsHomeTeamOdds: [3.0, 5.0, 7.0, 9.0, 11.0, 13.0, 15.0, 17.0, 19.0, 21.0],
                            goalsAwayTeamOdds: [3.0, 5.0, 7.0, 9.0, 11.0, 13.0, 15.0, 17.0, 19.0, 21.0],
                            awayTeamAmount: 0,
                            homeTeamAmount: 0,
                            drawAmount: 0,
                        },
                        update: {
                            opened: match.status === "SCHEDULED",
                            finished: match.status === "FINISHED",
                        }
                    }
                }
            }
        })

        // Check for match data changes
        if (match.status === "IN_PLAY") {
            if (match.homeTeamScore !== matchEntry.homeTeamScore) {
                // Home team score changed
                eventsController?.emitter.emit("match-update", matchEntry.id, "home-team-score", match.homeTeamScore as number);

                // TODO: Send notifications
            }

            if (match.awayTeamScore !== matchEntry.awayTeamScore) {
                // Away team score changed
                eventsController?.emitter.emit("match-update", matchEntry.id, "away-team-score", match.awayTeamScore as number);

                // TODO: Send notifications
            }
        }

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
                opened: match.status === "SCHEDULED",
                finished: match.status === "FINISHED",
                resultHomeTeamOdd: 2.0,
                resultDrawOdd: 2.0,
                resultAwayTeamOdd: 2.0,
                resultHomeTeamOrDrawOdd: 1.5,
                resultAwayTeamOrDrawOdd: 1.5,
                goalsHomeTeamOdds: [3.0, 5.0, 7.0, 9.0, 11.0, 13.0, 15.0, 17.0, 19.0, 21.0],
                goalsAwayTeamOdds: [3.0, 5.0, 7.0, 9.0, 11.0, 13.0, 15.0, 17.0, 19.0, 21.0],
                awayTeamAmount: 0,
                homeTeamAmount: 0,
                drawAmount: 0,
            }
        });

        return match;
    }
}