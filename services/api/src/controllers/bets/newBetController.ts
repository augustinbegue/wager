import { Request, Response } from "express";
import { prisma } from "../../../../prisma";
import { AuthenticatedRequest, BetsNewBody } from "../../../../types/api";
import { computeNewOdds } from "../../services/bets/userBets";

export async function newBetController(req: Request, res: Response) {
    let matchId = parseInt(req.params.matchId);

    let authReq = (req as unknown as AuthenticatedRequest);

    let params = req.body as BetsNewBody;

    if (!params.type) {
        return res.status(400).send({ message: "Missing bet type." });
    }

    if ((params.type === "GOALS_AWAY_TEAM" || params.type === "GOALS_HOME_TEAM") && !params.goals) {
        return res.status(400).send({ message: "Missing goals." });
    }

    if (!params.amount || params.amount <= 0) {
        return res.status(400).json({
            error: "Invalid amount",
        });
    }

    if (params.amount > authReq.user.balance) {
        return res.status(400).json({
            error: "Insufficient balance",
        });
    }


    let betInfo = await prisma.betInfo.findUnique({
        where: {
            matchId: matchId,
        },
        include: {
            bets: {
                where: {
                    userId: authReq.user.id,
                }
            }
        }
    });

    if (betInfo) {
        if (betInfo.bets.length < 1) {
            let bet = await prisma.bet.create({
                data: {
                    userId: authReq.user.id,
                    betInfoId: betInfo.id,
                    type: params.type,
                    amount: params.amount,
                    goals: params.goals,
                }
            });

            // Update bet amounts and odds
            betInfo = {
                ...betInfo,
                ... await prisma.betInfo.update(
                    {
                        where: {
                            id: betInfo.id,
                        },
                        data: {
                            homeTeamAmount: {
                                increment: params.type === "GOALS_HOME_TEAM" || params.type === "RESULT_HOME_TEAM" ? params.amount : params.type === "RESULT_HOME_TEAM_OR_DRAW" ? params.amount / 2 : 0,
                            },
                            awayTeamAmount: {
                                increment: params.type === "GOALS_AWAY_TEAM" || params.type === "RESULT_AWAY_TEAM" ? params.amount : params.type === "RESULT_AWAY_TEAM_OR_DRAW" ? params.amount / 2 : 0,
                            },
                            drawAmount: {
                                increment: params.type === "RESULT_DRAW" ? params.amount : params.type === "RESULT_HOME_TEAM_OR_DRAW" || params.type === "RESULT_AWAY_TEAM_OR_DRAW" ? params.amount / 2 : 0,
                            },
                        }
                    }
                )
            }

            // Update user balance
            await prisma.user.update({
                where: {
                    id: authReq.user.id,
                },
                data: {
                    balance: {
                        decrement: params.amount,
                    }
                }
            })

            // Update odds
            computeNewOdds(betInfo);

            res.status(201).send();
        } else {
            res.status(401).json({
                message: "You've already betted on this match.",
            });
        }
    } else {
        res.status(400).json({
            message: "Match not found",
        });
    }
}
