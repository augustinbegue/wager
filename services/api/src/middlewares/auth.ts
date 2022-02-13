import { prisma } from "../../../prisma";
import { Request, Response } from "express";
import { auth } from "firebase-admin";
import { AuthenticatedRequest } from "../../../types/api";

export async function requireAuthentication(req: Request, res: Response, next: Function) {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).send({ message: "Unauthorized: Missing token." });
    }

    try {
        await checkToken(authorization, req);
    } catch (error) {
        console.log(error);
        return res.status(401).send({ message: "Unauthorized: Missing token." });
    }

    return next();
}

export async function checkAuthentication(req: Request, res: Response, next: Function) {
    const { authorization } = req.headers;

    if (!authorization) {
        return next();
    }

    try {
        await checkToken(authorization, req);
    } catch (error) {
        console.log(error);
    }

    return next();
}

async function checkToken(authorization: string, req: Request) {
    const token = authorization.split(" ")[1];

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
            balance: 1000,
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
}
