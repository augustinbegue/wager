// Firebase Admin SDK
import { initializeApp } from "firebase-admin/app";
import { credential } from "firebase-admin";

initializeApp({
    credential: credential.cert(
        JSON.parse(process.env.FIREBASE_ADMIN_SDK as string),
    ),
});

// Redis
import { createClient } from "redis";
export const publisher = createClient({
    url: process.env.REDIS_URL,
});

// Express and dependencies
import express from "express";
import path from "path";
import routers from "./routes";
import cors from "cors";
import bodyParser from "body-parser";

export const app = express();

// Middlewares
import { demoLogger } from "./middlewares/logger";

app.use(demoLogger);
app.use(cors());
app.use(bodyParser.json());

// Swagger
import swaggerUi from "swagger-ui-express";
import { swagger } from "./docs/swagger.def";
app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swagger, { explorer: true, customSiteTitle: "Wager API" }),
);

app.use("/matches", routers.matchesRouter);
app.use("/competitions", routers.competitionsRouter);
app.use("/bets", routers.betsRouter);
app.use("/users", routers.usersRouter);

// Static Assets
app.use(
    "/static",
    process.env.PRODUCTION === "true"
        ? express.static("/public")
        : express.static(path.join(__dirname, "../public")),
);

app.get("/", (req, res) => {
    res.redirect("https://wager.ga");
});

app.get("*", (req, res) => {
    res.status(404).json({ message: "What are you looking for ?" });
});

app.listen(3000, "0.0.0.0", async () => {
    console.log("Listening ...");

    // Connect to Redis
    await publisher.connect();
});
