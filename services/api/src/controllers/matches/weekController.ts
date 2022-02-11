import { Response } from 'express';
import { ApiMatchCondensed } from '../../../../types/api';
import { prisma } from '../../../../prisma';
import { parseMatches } from '../../services/parsers/matches';
import { addUserBets } from '../../services/bets/userBets';

export async function weekController(req: Express.Request, res: Response) {
    let startDate = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
    let endDate = new Date(new Date().getTime() + (6 * 24 * 60 * 60 * 1000));

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
            betInfo: true,
        }
    });

    let apiMatches: ApiMatchCondensed[] = parseMatches(matches);

    if ((req as any).user) {
        apiMatches = await addUserBets(apiMatches, (req as any).user.id);
    }

    res.json(apiMatches);
}

