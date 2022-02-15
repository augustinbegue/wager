import dotenv from 'dotenv';

// Load dotenv before importing anything else
dotenv.config();

import { EventsController } from "./events/events-controller";
import { readFileSync } from 'fs';
import { ScraperConfig } from '../../types/configs';
import ws from 'ws';

let config = JSON.parse(readFileSync(__dirname + '/config.json', 'utf8')) as ScraperConfig;

// Scrape every 12h
let eventsController = new EventsController(config);

// Create websocket server
let wss = new ws.Server({ port: 4000 });

wss.on('connection', (ws, req) => {
    ws.on('message', (message) => {
        let data = JSON.parse(message.toString());
    });
});

eventsController.emitter.on('match-start', (matchId) => {
    console.log(`Match ${matchId} started.`);

    // Send match start event to all clients
    wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify({
                event: 'match-start',
                matchId: matchId
            }));
        }
    });
});

eventsController.emitter.on('match-end', (matchId) => {
    console.log(`Match ${matchId} ended.`);

    // Send match end event to all clients
    wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify({
                event: 'match-end',
                matchId: matchId
            }));
        }
    });
});

eventsController.emitter.on('match-update', (matchId, type, value) => {
    console.log(`Match ${matchId} updated.`);

    // Send match update event to all clients
    wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify({
                event: 'match-update',
                matchId: matchId,
                type: type,
                value: value
            }));
        }
    });
});

