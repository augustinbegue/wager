import { Request, Response } from "express";
import { auth } from "firebase-admin";

export async function isAuthenticated(req: Request, res: Response, next: Function) {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).send({ message: "Unauthorized" });
    }

    const token = authorization.split(" ")[1];

    try {
        const decodedToken = await auth().verifyIdToken(token, true);

        (req as any).user = {
            uid: decodedToken.uid,
            displayName: decodedToken.name,
            email: decodedToken.email,
        }

        return next();
    } catch (error) {
        console.error(error);

        return res.status(401).send({ message: "Unauthorized" });
    }
}