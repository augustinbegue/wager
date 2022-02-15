import express from "express";
import { betController } from "../controllers/bets/betController";
import { newBetController } from "../controllers/bets/newBetController";

const router = express.Router();

router.get("/:matchId", betController);

router.post("/:matchId/new", newBetController);

export const betsRouter = router;