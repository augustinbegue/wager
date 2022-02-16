import { prisma } from '../../../../prisma';
import { Request, Response } from 'express';
import { parseMatches } from '../../services/parsers/matches';
import { parseMatchesParams } from '../../services/parsers/parameters';
import { AuthenticatedRequest, OptionalAuthenticatedRequest } from '../../../../types/api';

export async function matchesController(req: Request, res: Response) {
    try {
        let params = parseMatchesParams(req.query);

        let teamFilter = params.team ? {
            OR: [
                {
                    homeTeam: {
                        id: params.team
                    },
                    awayTeam: {
                        id: params.team
                    }
                }
            ]
        } : {};

        let authReq = req as unknown as OptionalAuthenticatedRequest;

        let matches = await prisma.match.findMany({
            where: {
                date: {
                    gte: params.startDate,
                    lte: params.endDate
                },
                ...teamFilter,
                homeTeamId: params.homeTeam,
                awayTeamId: params.awayTeam,
                competitionId: params.competition,
                status: params.status,
                matchday: params.matchday
            },
            orderBy: {
                date: 'asc',
            },
            skip: params.offset,
            take: params.limit,
            include: {
                homeTeam: true,
                awayTeam: true,
                competition: true,
                betInfo: {
                    include: {
                        bets: {
                            where: {
                                userId: authReq.user?.id
                            }
                        }
                    }
                },
            }
        });

        res.json({
            start: params.offset,
            end: params.offset + matches.length,
            total: matches.length,
            matches: parseMatches(matches),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: (error as Error).message
        });
    }
}
