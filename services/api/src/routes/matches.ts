import express from 'express';
import { matchesController } from '../controllers/matches/matchesController';
import { weekController } from '../controllers/matches/weekController';

const router = express.Router();

router.get('/week', weekController);

router.get('/', matchesController);

export const matchesRouter = router;