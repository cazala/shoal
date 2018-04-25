export const connectedClients = new Set();
export function updateAll() {
    connectedClients.forEach(function each(client) {
        client.forceUpdate();
    });
}
//# sourceMappingURL=ConnectedClients.js.map