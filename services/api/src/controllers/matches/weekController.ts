import { Response } from 'express';
import { ApiMatchCondensed, AuthenticatedRequest, OptionalAuthenticatedRequest } from '../../../../types/api';
import { prisma } from '../../../../prisma';
import { parseMatches } from '../../services/parsers/matches';
import { addUserBets } from '../../services/bets/userBets';

export async function weekController(req: Express.Request, res: Response) {
    let startDate = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
    let endDate = new Date(new Date().getTime() + (6 * 24 * 60 * 60 * 1000));

    let authReq = req as unknown as OptionalAuthenticatedRequest;

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
                            userId: authReq.user?.id
                        }
                    }
                }
            },
        }
    });

    let apiMatches: ApiMatchCondensed[] = parseMatches(matches);

    if ((req as any).user) {
        apiMatches = await addUserBets(apiMatches, (req as any).user.id);
    }

    res.json(apiMatches);
}

