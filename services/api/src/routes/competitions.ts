import express from "express";
import { competitionsController } from "../controllers/competitions/competitionsController";

const router = express.Router();

router.get('/', competitionsController);

router.get('/:id', competitionsController);

export const competitionsRouter = router;