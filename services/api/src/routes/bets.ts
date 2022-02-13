import express from "express";
import { prisma } from "../../../prisma";
import { AuthenticatedRequest, BetsNewBody } from "../../../types/api";

const router = express.Router();

router.get("/:matchId", async (req, res) => {
    let matchId = parseInt(req.params.matchId);

    return prisma.betInfo.findFirst({
        where: {
            matchId: matchId,
        },
    })
});

router.post("/:matchId/new", async (req, res) => {
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
    })

    if (betInfo) {
        if (betInfo.bets.length < 1) {
            await prisma.bet.create({
                data: {
                    userId: authReq.user.id,
                    betInfoId: betInfo.id,
                    type: params.type,
                    amount: params.amount,
                    goals: params.goals,
                }
            })

            res.status(200).send();
        } else {
            res.status(401).json({
                message: "You've already betted on this match.",
            })
        }
    } else {
        res.status(400).json({
            message: "Match not found",
        })
    }
});

export const betsRouter = router; 