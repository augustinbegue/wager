import express from "express";
import { prisma } from "../../../prisma";
import { AuthenticatedRequest } from "../../../types/api";
import { requireAuthentication } from "../middlewares/auth";

const router = express.Router();

router.get('/me', requireAuthentication, async (req, res) => {
    let authReq = req as unknown as AuthenticatedRequest;

    res.json(authReq.user);
});

export const usersRouter = router;