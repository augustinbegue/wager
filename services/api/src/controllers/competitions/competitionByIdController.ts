import { Request, Response } from "express";
import { prisma } from "../../../../prisma";
import { parseMatchesParams } from "../../services/parsers/parameters";


export async function competitionByIdController(req: Request, res: Response) {
    try {
        let retMatches = req.path.includes('matches');
        let matchesParams = parseMatchesParams(req.query, retMatches);

        if (!req.params.id) {
            return;
        }

        let teamFilter = matchesParams.team ? {
            OR: [
                {
                    homeTeam: {
                        id: matchesParams.team
                    },
                    awayTeam: {
                        id: matchesParams.team
                    }
                }
            ]
        } : {};

        let id = parseInt(req.params.id);

        let competition = await prisma.competition.findUnique({
            where: {
                id: id
            },
            include: {
                ...req.path.includes('standings') ?
                    {
                        standings: {
                            orderBy: {
                                points: 'desc'
                            },
                            include: {
                                team: true
                            }
                        }
                    } : {},
                teams: req.path.includes('teams'),
                ...retMatches ?
                    {
                        matches: {
                            orderBy: {
                                date: 'desc'
                            },
                            where: {
                                date: {
                                    gte: matchesParams.startDate,
                                    lte: matchesParams.endDate
                                },
                                ...teamFilter,
                                homeTeam: {
                                    id: matchesParams.homeTeam
                                },
                                awayTeam: {
                                    id: matchesParams.awayTeam
                                },
                                status: matchesParams.status,
                                matchday: matchesParams.matchday
                            },
                            skip: matchesParams.offset,
                            take: matchesParams.limit,
                        }
                    } : {},
            },
        });

        res.json(competition);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error
        });
    }
}
