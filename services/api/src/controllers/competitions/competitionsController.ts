import { Request, Response } from "express";
import { prisma } from "../../../../prisma";
import { parseCompetitionsParams } from "../../services/parsers/parameters";

export async function competitionsController(req: Request, res: Response) {
    try {
        let params = parseCompetitionsParams(req.query);
        if (req.params.id) {
            params = {
                id: parseInt(req.params.id),
            }
        }

        let competitions = await prisma.competition.findMany({
            where: {
                id: params.id,
                name: {
                    contains: params.name
                }
            },
            select: {
                id: true,
                name: true,
                emblemUrl: true,
                currentSeason: true,
            }
        });

        res.json(competitions);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: (error as Error).message
        });
    }
}