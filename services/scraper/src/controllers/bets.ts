import { Bet, BetInfo, betType, Match, User } from "@prisma/client";
import ipc from "node-ipc";
import { prisma } from "../../../prisma";

export async function closeBets(matchId: number) {
    await prisma.betInfo.update({
        where: {
            matchId: matchId,
        },
        data: {
            opened: false,
        },
    });
}

export async function computeMatchBets(matchId: number) {
    let betInfo = await prisma.betInfo.findUnique({
        where: {
            matchId: matchId,
        },
        include: {
            bets: {
                include: {
                    user: true,
                },
                where: {
                    computed: false,
                },
            },
            match: true,
        },
    });

    if (!betInfo || betInfo === null || betInfo.match === null) return;

    let winningBets: betType[] = [];

    if (betInfo.match.winner === "HOME_TEAM") {
        winningBets = [
            "GOALS_HOME_TEAM",
            "GOALS_AWAY_TEAM",
            "RESULT_HOME_TEAM",
            "RESULT_HOME_TEAM_OR_DRAW",
        ];
    } else if (betInfo.match.winner === "AWAY_TEAM") {
        winningBets = [
            "GOALS_AWAY_TEAM",
            "GOALS_HOME_TEAM",
            "RESULT_AWAY_TEAM",
            "RESULT_AWAY_TEAM_OR_DRAW",
        ];
    } else {
        winningBets = [
            "GOALS_HOME_TEAM",
            "GOALS_AWAY_TEAM",
            "RESULT_DRAW",
            "RESULT_HOME_TEAM_OR_DRAW",
            "RESULT_AWAY_TEAM_OR_DRAW",
        ];
    }

    betInfo.bets.forEach(async (bet) => {
        if (winningBets.includes(bet.type)) {
            let odd = getWinningOdd(bet, betInfo);

            if (odd != 0) {
                await prisma.user.update({
                    where: {
                        id: bet.user.id,
                    },
                    data: {
                        balance: {
                            increment: bet.amount * odd,
                        },
                    },
                });

                await prisma.bet.update({
                    where: {
                        id: bet.id,
                    },
                    data: {
                        computed: true,
                    },
                });

                console.log(
                    `New balance evolution for user ${bet.user.id}: ${
                        bet.amount * odd
                    }`,
                );
                ipc.of["ws"].emit("balance-update", {
                    userId: bet.user.id,
                    balance: bet.amount * odd,
                });
            }
        }
    });
}

export async function computeBets() {
    let bets = await prisma.bet.findMany({
        where: {
            computed: false,
        },
        include: {
            user: true,
            betInfo: {
                include: {
                    match: true,
                },
            },
        },
    });

    bets.forEach(async (bet) => {
        let odd = getWinningOdd(bet, bet.betInfo);

        if (odd != 0) {
            await prisma.user.update({
                where: {
                    id: bet.user.id,
                },
                data: {
                    balance: {
                        increment: bet.amount * odd,
                    },
                },
            });

            await prisma.bet.update({
                where: {
                    id: bet.id,
                },
                data: {
                    computed: true,
                },
            });

            console.log(
                `New balance evolution for user ${bet.user.id}: ${
                    bet.amount * odd
                }`,
            );
            ipc.of["ws"].emit("balance-update", {
                userId: bet.user.id,
                balance: bet.amount * odd,
            });
        }
    });
}

/**
 * Computes the winning odd for a bet
 * @param bet Bet to compute
 * @param betInfo Betinfo of the bet
 * @returns 0 if the bet is not winning, the winning odd otherwise
 */
function getWinningOdd(
    bet: Bet & { user: User },
    betInfo: (BetInfo & { match: Match }) | null,
) {
    let odd = 0;

    if (
        bet.type === "GOALS_HOME_TEAM" &&
        bet.goals &&
        bet.goals <= betInfo?.match.homeTeamScore!
    ) {
        odd = betInfo?.goalsHomeTeamOdds[bet.goals] as number;
    }

    if (
        bet.type === "GOALS_AWAY_TEAM" &&
        bet.goals &&
        bet.goals <= betInfo?.match.awayTeamScore!
    ) {
        odd = betInfo?.goalsAwayTeamOdds[bet.goals] as number;
    }

    if (
        bet.type === "RESULT_HOME_TEAM" &&
        betInfo?.match.winner === "HOME_TEAM"
    ) {
        odd = betInfo?.resultHomeTeamOdd;
    }

    if (
        bet.type === "RESULT_AWAY_TEAM" &&
        betInfo?.match.winner === "AWAY_TEAM"
    ) {
        odd = betInfo?.resultAwayTeamOdd;
    }

    if (bet.type === "RESULT_DRAW" && betInfo?.match.winner === "DRAW") {
        odd = betInfo?.resultDrawOdd;
    }

    if (
        bet.type === "RESULT_HOME_TEAM_OR_DRAW" &&
        (betInfo?.match.winner === "HOME_TEAM" ||
            betInfo?.match.winner === "DRAW")
    ) {
        odd = betInfo?.resultHomeTeamOrDrawOdd;
    }

    if (
        bet.type === "RESULT_AWAY_TEAM_OR_DRAW" &&
        (betInfo?.match.winner === "AWAY_TEAM" ||
            betInfo?.match.winner === "DRAW")
    ) {
        odd = betInfo?.resultAwayTeamOrDrawOdd;
    }
    return odd;
}
