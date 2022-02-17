import express from 'express';
import { matchesController, swGetMatches } from '../controllers/matches/matchesController';
import { swGetMatchesWeek, weekController } from '../controllers/matches/weekController';
import { checkAuthentication } from '../middlewares/auth';

const router = express.Router();

router.get('/week', checkAuthentication, weekController);

router.get('/', checkAuthentication, matchesController);

export const matchesRouter = router;

export const swMatchesRouter = {
    "/matches": {
        "get": {
            ...swGetMatches,
        },
    },
    "/matches/week": {
        "get": {
            ...swGetMatchesWeek
        },
    },
};