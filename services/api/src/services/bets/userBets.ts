import { Bet, BetInfo } from "@prisma/client";
import { prisma } from "../../../../prisma";
import { ApiMatchCondensed } from "../../../../types/api";
import ipc from 'node-ipc';
import { clamp } from "../../utils/math";

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

export async function computeNewOdds(betInfo: BetInfo) {
    let totalAmount = betInfo.homeTeamAmount + betInfo.awayTeamAmount + betInfo.drawAmount;
    let homeDrawAmount = betInfo.homeTeamAmount + betInfo.drawAmount;
    let awayDrawAmount = betInfo.awayTeamAmount + betInfo.drawAmount;

    betInfo.resultHomeTeamOdd = clamp(1.10, 10, totalAmount / (betInfo.homeTeamAmount * 1.5));
    betInfo.resultAwayTeamOdd = clamp(1.10, 10, totalAmount / (betInfo.awayTeamAmount * 1.5));
    betInfo.resultDrawOdd = clamp(1.10, 10, totalAmount / (betInfo.drawAmount * 1.5));
    betInfo.resultHomeTeamOrDrawOdd = clamp(1.10, 10, totalAmount / (homeDrawAmount * 1.5));
    betInfo.resultAwayTeamOrDrawOdd = clamp(1.10, 10, totalAmount / (awayDrawAmount * 1.5));

    for (let i = 0; i < 10; i++) {
        betInfo.goalsHomeTeamOdds[i] = betInfo.resultHomeTeamOrDrawOdd * Math.exp((i + 1) / 2);
        betInfo.goalsAwayTeamOdds[i] = betInfo.resultAwayTeamOrDrawOdd * Math.exp((i + 1) / 2);
    }

    await prisma.betInfo.update({
        where: {
            id: betInfo.id,
        },
        data: {
            ...betInfo,
            bets: undefined
        }
    });

    // Notify ws of odds update
    ipc.of['ws'].emit('match-update', { matchId: betInfo.matchId, type: 'odds', value: betInfo });
}