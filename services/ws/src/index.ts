import ws from "ws";
import { createClient } from "redis";

// Create redis subscriber
const subscriber = createClient({
    url: process.env.REDIS_URL,
});

(async () => {
    await subscriber.connect();

    // Create websocket server
    let wss = new ws.Server({ port: 4000 });
    let connectionNumber = 0;
    let clients: { ws: ws.WebSocket; id: number; userId: number }[] = [];

    console.log("Websocket server started.");

    wss.on("connection", (ws, req) => {
        let id = ++connectionNumber;
        console.log(`Client connected: ${req.socket.remoteAddress}`);

        ws.on("message", (message) => {
            let messageObject = JSON.parse(message.toString());

            if (messageObject.request === "user-subscribe") {
                clients[id - 1] = {
                    ws: ws,
                    id: id,
                    userId: messageObject.userId,
                };
            }
        });

        clients.push({ ws: ws, id: id, userId: 0 });
    });

    subscriber.subscribe("match-start", (data) => {
        console.log(`Match ${data} started.`);

        // Send match start event to all clients
        wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
                client.send(
                    JSON.stringify({
                        event: "match-start",
                        matchId: data,
                    }),
                );
            }
        });
    });

    subscriber.subscribe("match-end", (data) => {
        console.log(`Match ${data} ended.`);

        // Send match end event to all clients
        wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
                client.send(
                    JSON.stringify({
                        event: "match-end",
                        matchId: data,
                    }),
                );
            }
        });
    });

    subscriber.subscribe("match-update", (rawData) => {
        let data = JSON.parse(rawData);

        console.log(`Match ${data.matchId} updated.`);

        // Send match update event to all clients
        wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
                client.send(
                    JSON.stringify({
                        event: "match-update",
                        ...data,
                    }),
                );
            }
        });
    });

    subscriber.subscribe("balance-update", (rawData) => {
        let data = JSON.parse(rawData);

        console.log(`Balance of ${data.userId} updated by ${data.balance}.`);

        // Send balance update to subscribed clients
        clients.forEach((client) => {
            if (client.userId === data.userId) {
                client.ws.send(
                    JSON.stringify({
                        event: "balance-update",
                        value: data.balance,
                    }),
                );
            }
        });
    });
})();
