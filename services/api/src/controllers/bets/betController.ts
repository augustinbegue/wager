import { Request, Response } from "express";
import { prisma } from "../../../../prisma";

export async function betController(req: Request, res: Response) {
    let matchId = parseInt(req.params.matchId);

    let bet = await prisma.betInfo.findFirst({
        where: {
            matchId: matchId,
        },
    });

    res.json(bet);
}
