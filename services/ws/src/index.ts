import ws from 'ws';
import ipc from 'node-ipc';

// Create ipc server
ipc.config.id = 'ws';
ipc.config.retry = 1500;
ipc.config.silent = true;

ipc.serve();
ipc.server.start();

// Create websocket server
let wss = new ws.Server({ port: 4000 });

wss.on('connection', (ws, req) => {
    console.log(`Client connected: ${req.socket.remoteAddress}`);
});

ipc.server.on('match-start', (data, socket) => {

    // Send match start event to all clients
    wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify({
                event: 'match-start',
                matchId: data
            }));
        }
    });
});

ipc.server.on('match-end', (data, socket) => {

    // Send match end event to all clients
    wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify({
                event: 'match-end',
                matchId: data
            }));
        }
    });
});

ipc.server.on('match-update', (data, socket) => {

    // Send match update event to all clients
    wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify({
                event: 'match-update',
                ...data
            }));
        }
    });
});