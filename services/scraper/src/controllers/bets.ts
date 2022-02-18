import { betType } from "@prisma/client";
import { prisma } from "../../../prisma";

export async function closeBets(matchId: number) {
    await prisma.betInfo.update({
        where: {
            matchId: matchId,
        },
        data: {
            opened: false,
        }
    });
}

export async function computeBets(matchId: number) {
    let betInfo = await prisma.betInfo.findUnique({
        where: {
            matchId: matchId,
        },
        include: {
            bets: {
                include: {
                    user: true,
                }
            },
            match: true,
        }
    });

    if (!betInfo || betInfo === null || betInfo.match === null)
        return;

    let winningBets: betType[] = [];

    if (betInfo.match.winner === "HOME_TEAM") {
        winningBets = ["GOALS_HOME_TEAM", "GOALS_AWAY_TEAM", "RESULT_HOME_TEAM", "RESULT_HOME_TEAM_OR_DRAW"];
    } else if (betInfo.match.winner === "AWAY_TEAM") {
        winningBets = ["GOALS_AWAY_TEAM", "GOALS_HOME_TEAM", "RESULT_AWAY_TEAM", "RESULT_AWAY_TEAM_OR_DRAW"];
    } else {
        winningBets = ["GOALS_HOME_TEAM", "GOALS_AWAY_TEAM", "RESULT_DRAW", "RESULT_HOME_TEAM_OR_DRAW", "RESULT_AWAY_TEAM_OR_DRAW"];
    }

    betInfo.bets.forEach(async (bet) => {
        if (winningBets.includes(bet.type)) {
            let odd = 1;

            if (bet.type === "GOALS_HOME_TEAM" && bet.goals && bet.goals <= betInfo?.match.homeTeamScore!) {
                odd = betInfo?.goalsHomeTeamOdds[bet.goals] as number;
            }

            if (bet.type === "GOALS_AWAY_TEAM" && bet.goals && bet.goals <= betInfo?.match.awayTeamScore!) {
                odd = betInfo?.goalsAwayTeamOdds[bet.goals] as number;
            }

            if (bet.type === "RESULT_HOME_TEAM" && betInfo?.match.winner === "HOME_TEAM") {
                odd = betInfo?.resultHomeTeamOdd;
            }

            if (bet.type === "RESULT_AWAY_TEAM" && betInfo?.match.winner === "AWAY_TEAM") {
                odd = betInfo?.resultAwayTeamOdd;
            }

            if (bet.type === "RESULT_DRAW" && betInfo?.match.winner === "DRAW") {
                odd = betInfo?.resultDrawOdd;
            }

            if (bet.type === "RESULT_HOME_TEAM_OR_DRAW" && (betInfo?.match.winner === "HOME_TEAM" || betInfo?.match.winner === "DRAW")) {
                odd = betInfo?.resultHomeTeamOrDrawOdd;
            }

            if (bet.type === "RESULT_AWAY_TEAM_OR_DRAW" && (betInfo?.match.winner === "AWAY_TEAM" || betInfo?.match.winner === "DRAW")) {
                odd = betInfo?.resultAwayTeamOrDrawOdd;
            }

            prisma.user.update({
                where: {
                    id: bet.user.id,
                },
                data: {
                    balance: {
                        increment: bet.amount * odd,
                    }
                }
            });

            // TODO: Notify user that he has won a bet
        }
    });
}