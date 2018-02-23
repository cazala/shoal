const WebSocket = require('ws')
const express = require('express')
const Sea = require('../src/Sea')

var sea = new Sea(20, 500, 500)

sea.start()

sea.on('update', fish => {
  const { id, location, velocity } = fish.toJSON(false)
  const data = [id, location.x, location.y, velocity.x, velocity.y].join(',')
  console.log(data)
  wss.broadcast(data)
})

const app = express()
app.use('/sea', (req, res) => res.json(sea.toJSON(false)))
app.use('/', express.static(__dirname))
app.use('/dist', express.static(require('path').resolve(__dirname, '../dist')))
const server = require('http').createServer(app)
const wss = new WebSocket.Server({ path: '/ws', server })
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(client => {
    try {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    } catch (e) {
      console.log('error', e.message)
    }
  })
}
const port = process.env.PORT || 9999
wss.on('listening', () => console.log(`Listening on port ${port}`))
wss.on('error', e => console.log('wss error', e))
wss.on('connection', ws => {
  ws.on('error', e => console.log('ws error', e))
})
server.listen(port, '0.0.0.0')

process.on('unhandledException', function(e) {
  console.error('An error occured', e.message)
})
