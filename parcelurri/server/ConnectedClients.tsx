import RemoteScene from './RemoteScene'
import { renderAndCache } from './RemoteScene'

export const connectedClients: Set<RemoteScene> = new Set()

export function updateAll() {
  renderAndCache()
  connectedClients.forEach(function each(client) {
    client.forceUpdate()
  })
}
