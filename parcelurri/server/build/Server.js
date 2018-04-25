import { createServer } from 'http';
import { Server as WebSocketServer } from 'ws';
const shoal = require('../../../src');
import { connectedClients, updateAll } from './ConnectedClients';
import { WebSocketTransport } from 'metaverse-api';
import RemoteScene, { render } from './RemoteScene';
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const server = createServer(app);
const wss = new WebSocketServer({ server });
wss.on('connection', function connection(ws, req) {
    const client = new RemoteScene(WebSocketTransport(ws));
    client.on('error', (err) => {
        console.error(err);
        ws.close();
    });
    connectedClients.add(client);
    ws.on('close', () => connectedClients.delete(client));
    console.log(`Client connected at ${req.connection.remoteAddress}`);
});
server.listen(8087, function listening() {
    console.log(`Listening on 8087`);
});
const sea = new shoal.Sea(50, 1200, 300, 1200, 200);
sea.start(64);
setInterval(() => {
    render(sea);
    updateAll();
}, 100);
//# sourceMappingURL=Server.js.map