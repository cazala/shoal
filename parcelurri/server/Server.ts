import { createServer } from 'http'
import { Server as WebSocketServer } from 'ws'
const Sea = require('../../../src/Sea')

import { connectedClients, updateAll } from './ConnectedClients'
import { WebSocketTransport } from 'metaverse-api'
import RemoteScene from './RemoteScene'
import { setState } from './State'

const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())

const server = createServer(app)
const wss = new WebSocketServer({ server })

wss.on('connection', function connection(ws, req) {
  const client = new RemoteScene(WebSocketTransport(ws))
  client.on('error', (err: Error) => {
    console.error(err)
    ws.close()
  })
  connectedClients.add(client)
  ws.on('close', () => connectedClients.delete(client))
  console.log(`Client connected at ${req.connection.remoteAddress}`)
})

server.listen(8087, function listening() {
  console.log(`Listening on 8087`)
})

// Sea
const sea = new Sea(40, 1200, 1200)
sea.start()
sea.on('update', (fish: any) => {
  const { id, location, velocity, mass } = fish.toJSON(false)
  setState({
    [id]: { id, location, velocity, mass }
  })
})

setInterval(() => updateAll(), 100)
