import { EventsController } from "./events/events-controller";
import { readFileSync } from "fs";
import { ScraperConfig } from "../../types/configs";
import { createClient } from "redis";

let config = JSON.parse(
    readFileSync(__dirname + "/config.json", "utf8"),
) as ScraperConfig;

// Scrape every 12h
let eventsController = new EventsController(config);

// Create redis publisher
export const publisher = createClient({
    url: process.env.REDIS_URL,
});

(async () => {
    await publisher.connect();

    eventsController.emitter.on("match-start", async (matchId) => {
        console.log(`Match ${matchId} started.`);

        await publisher.publish("match-start", JSON.stringify(matchId));
    });

    eventsController.emitter.on("match-end", async (matchId) => {
        console.log(`Match ${matchId} ended.`);

        await publisher.publish("match-end", JSON.stringify(matchId));
    });

    eventsController.emitter.on(
        "match-update",
        async (matchId, type, value) => {
            console.log(`Match ${matchId} updated.`);

            await publisher.publish(
                "match-update",
                JSON.stringify({ matchId, type, value }),
            );
        },
    );
})();
