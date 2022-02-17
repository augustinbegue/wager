import express from "express";
import { betController } from "../controllers/bets/betController";
import { newBetController } from "../controllers/bets/newBetController";
import { requireAuthentication } from "../middlewares/auth";

const router = express.Router();

router.get("/:matchId", betController);

router.post("/:matchId/new", requireAuthentication, newBetController);

export const betsRouter = router;