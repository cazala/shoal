import RemoteScene from './RemoteScene'

export const connectedClients: Set<RemoteScene> = new Set()

export function updateAll() {
  connectedClients.forEach(function each(client) {
    client.forceUpdate()
  })
}
