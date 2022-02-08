import { Match, PrismaClient } from '@prisma/client';
import { MatchIncludesTeams } from '../types/db';

export const prisma = new PrismaClient();

export async function upsertMatch(match: Match) {
    let matchEntry = await prisma.match.findFirst({
        where: {
            homeTeamId: match.homeTeamId,
            awayTeamId: match.awayTeamId,
            matchday: match.matchday,
        }
    })

    if (matchEntry) {
        return await prisma.match.update({
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