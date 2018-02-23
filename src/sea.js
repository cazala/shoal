const EventEmitter = require('events')
const Fish = require('./Fish')
const seedrandom = require('seedrandom')

class Sea extends EventEmitter {
  constructor(fish, width, height, seed) {
    super()
    this.fish = []
    this.width = width
    this.height = height
    this.interval = null
    this.seed = seed || Math.random()
    this.random = seedrandom(this.seed)

    if (typeof fish === 'number') {
      for (let i = 0; i < fish; i++) {
        const mass = 0.5 + this.random() * 0.2
        const x = this.random() * this.width
        const y = this.random() * this.height
        this.fish.push(new Fish(mass, x, y))
      }
    } else if (Array.isArray(fish)) {
      for (let i = 0; i < fish.length; i++) {
        this.fish.push(Fish.fromJSON(fish[i]))
      }
    } else {
      throw new Error(
        'Argument `fish` must a number or an array of Fish#toJSON()'
      )
    }
  }

  step() {
    for (let i = 0; i < this.fish.length; i++) {
      const fish = this.fish[i]
      const neighbors = fish.look(this.fish, 100 * fish.mass, Math.PI * 2)

      const friends = []
      for (let j = 0; j < neighbors.length; j++) {
        if (
          neighbors[j].mass < fish.mass * 2 &&
          neighbors[j].mass < fish.mass * 2
        )
          friends.push(neighbors[j])
      }

      if (friends.length > 0) {
        fish.shoal(friends)
      } else {
        fish.wander(200)
      }

      fish.boundaries(this.width, this.height)

      const bigger = []
      for (let j = 0; j < neighbors.length; j++) {
        if (neighbors[j].mass > fish.mass * 2) {
          bigger.push(neighbors[j])
        }
      }

      if (bigger.length > 0) {
        fish.avoid(bigger, 300)
      }

      const smaller = []
      for (let j = 0; j < neighbors.length; j++) {
        if (neighbors[j].mass < fish.mass / 2) {
          smaller.push(neighbors[j])
        }
      }
      if (smaller.length > 0) {
        fish.chase(smaller)
      }

      fish.update()
      this.emit('update', fish)
    }
  }

  start(ms = 16) {
    this.stop()
    this.interval = setInterval(() => this.step(), ms)
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.width, this.height)
    for (let i = 0; i < this.fish.length; i++) {
      const fish = this.fish[i]
      fish.render(ctx)
    }
  }

  toJSON(stringify = true) {
    const data = {
      fish: this.fish.map(fish => fish.toJSON(stringify)),
      width: this.width,
      height: this.height,
      seed: this.seed
    }
    return stringify ? JSON.stringify(data, null, 2) : data
  }
}

Sea.fromJSON = function(json) {
  const { fish, width, height, seed } =
    typeof json === 'string' ? JSON.parse(json) : json
  return new Sea(fish, width, height, seed)
}

module.exports = Sea
