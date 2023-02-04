import ws from "ws";
import ipc from "node-ipc";

// Create ipc server
ipc.config.id = "ws";
ipc.config.retry = 1500;
ipc.config.silent = true;

ipc.serve();
ipc.server.start();

// Create websocket server
let wss = new ws.Server({ port: 4000 });
let connectionNumber = 0;
let clients: { ws: ws.WebSocket; id: number; userId: number }[] = [];

wss.on("connection", (ws, req) => {
    let id = ++connectionNumber;
    console.log(`Client connected: ${req.socket.remoteAddress}`);

    ws.on("message", (message) => {
        let messageObject = JSON.parse(message.toString());

        if (messageObject.request === "user-subscribe") {
            clients[id - 1] = { ws: ws, id: id, userId: messageObject.userId };
        }
    });

    clients.push({ ws: ws, id: id, userId: 0 });
});

ipc.server.on("match-start", (data, socket) => {
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

ipc.server.on("match-end", (data, socket) => {
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

ipc.server.on("match-update", (data, socket) => {
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

ipc.server.on("balance-update", (data, socket) => {
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
