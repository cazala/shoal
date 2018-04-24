import { renderAndCache } from './RemoteScene';
export const connectedClients = new Set();
export function updateAll() {
    renderAndCache();
    connectedClients.forEach(function each(client) {
        client.forceUpdate();
    });
}
//# sourceMappingURL=ConnectedClients.js.map