import { Request, Response } from "express";
import { prisma } from "../../../../prisma";
import { OptionalAuthenticatedRequest } from "../../../../types/api";
import { parseMatch } from "../../services/parsers/matches";

export const swGetMatch = {
    summary: "Get a match",
    tags: ["matches"],
    responses: {
        "200": {
            description: "Match",
        },
    },
    parameters: [
        {
            id: {
                name: "id",
                in: "path",
                description: "Match ID",
                required: true,
            },
        },
    ],
};

export async function matchController(req: Request, res: Response) {
    try {
        let matchId = parseInt(req.params.id);

        let authReq = req as unknown as OptionalAuthenticatedRequest;

        let match = await prisma.match.findUnique({
            where: {
                id: matchId,
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                competition: true,
                betInfo: {
                    include: {
                        bets: {
                            where: {
                                userId: authReq.user?.id,
                            },
                        },
                    },
                },
            },
        });

        if (!match) {
            res.status(404).json({
                message: "Match not found.",
            });
            return;
        }

        res.json({
            match: parseMatch(match),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: (error as Error).message,
        });
    }
}
