import { prisma } from "../../../../prisma";
import { ApiMatchCondensed } from "../../../../types/api";

export async function addUserBets(apiMatches: ApiMatchCondensed[], userId: number) {
    let promises = apiMatches.map(async match => {
        let userBet = await prisma.bet.findFirst({
            where: {
                userId: userId,
                betInfoId: match.betInfo.id
            }
        });

        if (userBet) {
            return {
                ...match, bet: {
                    id: userBet.id,
                    type: userBet.type,
                    amount: userBet.amount,
                    goals: userBet.goals
                },
            }
        } else {
            return match;
        }
    });

    return Promise.all(promises);
}