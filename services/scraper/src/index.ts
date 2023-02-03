import dotenv from "dotenv";

// Load dotenv before importing anything else
dotenv.config();

import ipc from "node-ipc";
import { EventsController } from "./events/events-controller";
import { readFileSync } from "fs";
import { ScraperConfig } from "../../types/configs";

let config = JSON.parse(
    readFileSync(__dirname + "/config.json", "utf8"),
) as ScraperConfig;

// Scrape every 12h
let eventsController = new EventsController(config);

// Create ipc server
ipc.config.id = "scraper";
ipc.config.retry = 1500;
ipc.config.silent = true;

ipc.connectTo("ws");

eventsController.emitter.on("match-start", (matchId) => {
    console.log(`Match ${matchId} started.`);

    ipc.of["ws"].emit("match-start", matchId);
});

eventsController.emitter.on("match-end", (matchId) => {
    console.log(`Match ${matchId} ended.`);

    ipc.of["ws"].emit("match-end", matchId);
});

eventsController.emitter.on("match-update", (matchId, type, value) => {
    console.log(`Match ${matchId} updated.`);

    ipc.of["ws"].emit("match-update", { matchId, type, value });
});
