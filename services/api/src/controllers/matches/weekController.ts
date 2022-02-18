import { Response } from 'express';
import { ApiMatchCondensed, AuthenticatedRequest, OptionalAuthenticatedRequest } from '../../../../types/api';
import { prisma } from '../../../../prisma';
import { parseMatches } from '../../services/parsers/matches';

export const swGetMatchesWeek = {
    "summary": "Get all matches for a week",
    "tags": [
        "matches",
    ],
    "responses": {
        "200": {
            "description": "Matches",
        },
    },
}

export async function weekController(req: Express.Request, res: Response) {
    let startDate = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
    let endDate = new Date(new Date().getTime() + (6 * 24 * 60 * 60 * 1000));

    let authReq = req as unknown as OptionalAuthenticatedRequest;

    console.log(authReq.user);

    if (authReq.user) {
        let matchesWithBets = await prisma.match.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                competition: true,
                betInfo: {
                    include: {
                        bets: {
                            where: {
                                userId: authReq.user.id
                            }
                        }
                    }
                }
            },
        });

        let apiMatchesWithBets: ApiMatchCondensed[] = parseMatches(matchesWithBets);

        res.json(apiMatchesWithBets);
    } else {
        let matches = await prisma.match.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                competition: true,
                betInfo: {
                    include: {
                        bets: {
                            where: {
                                userId: -1
                            }
                        }
                    }
                },
            },
        });

        let apiMatches: ApiMatchCondensed[] = parseMatches(matches);

        res.json(apiMatches);
    }
}