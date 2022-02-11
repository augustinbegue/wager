import { prisma } from "../../../prisma";
import { Request, Response } from "express";
import { auth } from "firebase-admin";
import { AuthenticatedRequest } from "../../../types/api";

export async function requireAuthentication(req: Request, res: Response, next: Function) {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).send({ message: "Unauthorized: Missing token." });
    }

    const token = authorization.split(" ")[1];

    try {
        const decodedToken = await auth().verifyIdToken(token, true);

        const user = await prisma.user.upsert({
            where: {
                uid: decodedToken.uid,
            },
            create: {
                uid: decodedToken.uid,
                email: decodedToken.email as string,
                name: decodedToken.name,
                photoUrl: decodedToken.picture,
            },
            update: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name,
                photoUrl: decodedToken.picture,
            },
        });

        (req as AuthenticatedRequest).decoded = decodedToken;
        (req as AuthenticatedRequest).user = user;

        return next();
    } catch (error) {
        console.error(error);
        return res.status(401).send({ message: "Unauthorized: Missing token." });
    }
}

export async function checkAuthentication(req: Request, res: Response, next: Function) {
    const { authorization } = req.headers;

    if (!authorization) {
        return next();
    }

    const token = authorization.split(" ")[1];

    try {
        const decodedToken = await auth().verifyIdToken(token, true);

        const user = await prisma.user.upsert({
            where: {
                uid: decodedToken.uid,
            },
            create: {
                uid: decodedToken.uid,
                email: decodedToken.email as string,
                name: decodedToken.name,
                photoUrl: decodedToken.picture,
            },
            update: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name,
                photoUrl: decodedToken.picture,
            },
        });

        (req as AuthenticatedRequest).decoded = decodedToken;
        (req as AuthenticatedRequest).user = user;

        return next();
    } catch (error) {
        console.error(error);
    }
}