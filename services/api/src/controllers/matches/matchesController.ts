import { prisma } from '../../../../prisma';
import { Request, Response } from 'express';
import { parseMatches } from '../../services/parseMatches';
import { parseMatchesParams } from '../../services/parsers/parameters';

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

        let matches = await prisma.match.findMany({
            where: {
                date: {
                    gte: params.startDate,
                    lte: params.endDate
                },
                ...teamFilter,
                homeTeam: {
                    id: params.homeTeam
                },
                awayTeam: {
                    id: params.awayTeam
                },
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
                competition: true
            }
        });

        res.json({
            start: params.offset,
            end: params.offset + matches.length,
            total: matches.length,
            matches: parseMatches(matches),
        });
    } catch (error) {
        res.status(500).json({
            message: error
        });
    }
}
