import express from "express";
import { competitionsController } from "../controllers/competitions/competitionsController";
import { competitionByIdController } from "../controllers/competitions/competitionByIdController";
import { checkAuthentication } from "../middlewares/auth";

const router = express.Router();

router.get('/', competitionsController);

router.get('/:id', competitionsController);

router.get('/:id/teams', competitionByIdController);

router.get('/:id/matches', checkAuthentication, competitionByIdController);

router.get('/:id/standings', competitionByIdController);

export const competitionsRouter = router;