const main = async () => {
  const resp = await fetch('http://localhost:9999/sea')
  const data = await resp.json()
  const sea = Shoal.Sea.fromJSON(data)
  sea.start()

  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')

  sea.on('error', e => console.log('error', e))

  const fishById = {}
  sea.fish.forEach(fish => {
    fishById[fish.id] = fish
  })

  var ws = new WebSocket('ws://localhost:9999/ws')
  ws.onmessage = function(event) {
    const [id, lx, ly, vx, vy] = event.data.split(',')
    const fish = fishById[id]
    fish.location.x = +lx
    fish.location.y = +ly
    fish.velocity.x = +vx
    fish.velocity.y = +vy
    sea.render(ctx)
  }
  ws.onerror = function(event) {
    console.log('error')
  }
  ws.onclose = function(event) {
    console.log('closed')
  }
}

main()
