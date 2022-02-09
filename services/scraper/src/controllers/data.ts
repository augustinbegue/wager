import { prisma } from "../../../prisma"
import { Match } from "@prisma/client"
import { updateStandingsForMatch } from "./standings"

export async function upsertMatch(match: Match) {
    let matchEntry = await prisma.match.findFirst({
        where: {
            homeTeamId: match.homeTeamId,
            awayTeamId: match.awayTeamId,
            matchday: match.matchday,
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
            }
        })

        // Match started
        if (matchEntry.status === "SCHEDULED" && match.status === "IN_PLAY") {
            // TODO: Close bets

            // TODO: Send notifications
        }

        // Match finished
        if (matchEntry.status === "IN_PLAY" && match.status === "FINISHED") {
            // Update standings
            updateStandingsForMatch(match);

            // TODO: Compute bets results

            // TODO: Send notifications
        }

        return updated;
    } else {
        return await prisma.match.create({
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
        })
    }
}