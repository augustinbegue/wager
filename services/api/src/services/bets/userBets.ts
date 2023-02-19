import { BetInfo } from "@prisma/client";
import { publisher } from "api/src";
import { prisma } from "../../../../prisma";
import { clamp } from "../../utils/math";

export async function computeNewOdds(betInfo: BetInfo) {
    let totalAmount =
        betInfo.homeTeamAmount + betInfo.awayTeamAmount + betInfo.drawAmount;
    let homeDrawAmount = betInfo.homeTeamAmount + betInfo.drawAmount;
    let awayDrawAmount = betInfo.awayTeamAmount + betInfo.drawAmount;

    betInfo.resultHomeTeamOdd = clamp(
        1.1,
        10,
        totalAmount / (betInfo.homeTeamAmount * 1.5),
    );
    betInfo.resultAwayTeamOdd = clamp(
        1.1,
        10,
        totalAmount / (betInfo.awayTeamAmount * 1.5),
    );
    betInfo.resultDrawOdd = clamp(
        1.1,
        10,
        totalAmount / (betInfo.drawAmount * 1.5),
    );
    betInfo.resultHomeTeamOrDrawOdd = clamp(
        1.1,
        10,
        totalAmount / (homeDrawAmount * 1.5),
    );
    betInfo.resultAwayTeamOrDrawOdd = clamp(
        1.1,
        10,
        totalAmount / (awayDrawAmount * 1.5),
    );

    for (let i = 0; i < 10; i++) {
        betInfo.goalsHomeTeamOdds[i] =
            betInfo.resultHomeTeamOrDrawOdd * Math.exp((i + 1) / 2);
        betInfo.goalsAwayTeamOdds[i] =
            betInfo.resultAwayTeamOrDrawOdd * Math.exp((i + 1) / 2);
    }

    await prisma.betInfo.update({
        where: {
            id: betInfo.id,
        },
        data: {
            ...betInfo,
            bets: undefined,
        },
    });

    // Notify ws of odds update
    await publisher.publish(
        "match-update",
        JSON.stringify({
            matchId: betInfo.matchId,
            type: "odds",
            value: betInfo,
        }),
    );
}
