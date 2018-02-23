const Vector = require('./Vector')
const seedrandom = require('seedrandom')

let id = 0
function uid() {
  return id++
}

const BEHAVIOURS = {
  SHOAL: 'shoal',
  WANDER: 'wander',
  CHASE: 'chase',
  AVOID: 'avoid'
}

const HALF_PI = Math.PI / 2

class Fish {
  constructor(mass, x, y, seed) {
    this.id = uid()
    this.mass = mass
    this.maxspeed = 12 * this.mass
    this.maxforce = 0.1 / this.mass
    this.separationRange = this.mass * 30
    this.lookRange = this.mass * 200
    this.length = mass * 20
    this.base = this.length * 0.5
    this.location = new Vector(x, y)
    this.velocity = new Vector(0, 0)
    this.acceleration = new Vector(0, 0)
    this.wandering = new Vector(0.2, 0.2)
    this.seed = seed || Math.random()
    this.random = seedrandom(this.seed)
  }

  update() {
    this.velocity.add(this.acceleration)
    this.velocity.limit(this.maxspeed)
    if (this.velocity.mag() < 2) this.velocity.setMag(5)
    this.location.add(this.velocity)
    this.acceleration.mul(0)
  }

  applyForce(force) {
    this.acceleration.add(force)
  }

  boundaries(width, height, multi = 3) {
    if (this.location.x < 0)
      this.applyForce(new Vector(this.maxforce * multi, 0))

    if (this.location.x > width)
      this.applyForce(new Vector(-this.maxforce * multi, 0))

    if (this.location.y < 0)
      this.applyForce(new Vector(0, this.maxforce * multi))

    if (this.location.y > height - 0)
      this.applyForce(new Vector(0, -this.maxforce * multi))
  }

  look(fish, radius, angle) {
    const neighbors = []
    for (let i = 0; i < fish.length; i++) {
      if (fish[i] !== this) {
        const diff = this.location.copy().sub(fish[i].location)
        const a = this.velocity.angleBetween(diff)
        const d = this.location.dist(fish[i].location)
        const isCloseEnough = d < radius
        const isInFoV = a < angle / 2 || a > Math.PI * 2 - angle / 2
        if (isCloseEnough && isInFoV) {
          neighbors.push(fish[i])
        }
      }
    }
    return neighbors
  }

  wander(radius) {
    if (this.random() < 0.05) {
      this.wandering.rotate(Math.PI * 2 * this.random())
    }
    this.velocity.add(this.wandering)
    this.behaviour = BEHAVIOURS.WANDER
  }

  chase(fish) {
    this.chaseList = fish

    if (fish.length == 0) return

    for (let i = 0; i < fish.length; i++) {
      this.applyForce(fish[i].attract(this, 50))
    }

    this.behaviour = BEHAVIOURS.CHASE
  }

  follow(target, arrive) {
    const dest = target.copy().sub(this.location)
    const dist = dest.dist(this.location)

    if (dist < arrive) {
      dest.setMag(dist / arrive * this.maxspeed)
    } else {
      dest.setMag(this.maxspeed)
    }

    this.applyForce(dest.limit(this.maxforce * 2))
  }

  seek(target) {
    var seek = target.copy().sub(this.location)
    seek.normalize()
    seek.mul(this.maxspeed)
    seek.sub(this.velocity).limit(this.maxforce)

    return seek
  }

  attract(body, attractionForce) {
    const force = this.location.copy().sub(body.location)
    const distance = force.mag()
    distance = distance < 5 ? 5 : distance > 25 ? 25 : distance
    force.normalize()

    const strength =
      attractionForce * this.mass * body.mass / (distance * distance)
    force.mul(strength)
    return force
  }

  separate(neighbors, range) {
    const sum = new Vector(0, 0)

    if (neighbors.length > 0) {
      for (let i = 0; i < neighbors.length; i++) {
        const dist = this.location.dist(neighbors[i].location)
        if (dist < range) {
          const diff = this.location.copy().sub(neighbors[i].location)
          diff.normalize()
          diff.div(dist)
          sum.add(diff)
        }
      }
      sum.div(neighbors.length)
      sum.normalize()
      sum.mul(this.maxspeed)
      sum.sub(this.velocity)
      sum.limit(this.maxforce)
    }

    return sum
  }

  align(neighbors) {
    const sum = new Vector(0, 0)

    if (neighbors.length) {
      for (let i = 0; i < neighbors.length; i++) {
        sum.add(neighbors[i].velocity)
      }
      sum.div(neighbors.length)
      sum.normalize()
      sum.mul(this.maxspeed)

      sum.sub(this.velocity).limit(this.maxspeed)
    }

    return sum
  }

  cohesion(neighbors) {
    const sum = new Vector(0, 0)

    if (neighbors.length) {
      for (let i = 0; i < neighbors.length; i++) {
        sum.add(neighbors[i].location)
      }
      sum.div(neighbors.length)
      return this.seek(sum)
    }

    return sum
  }

  shoal(neighbors) {
    this.shoalList = neighbors

    const separation = this.separate(neighbors, this.separationRange).limit(
      this.maxforce
    )
    const alignment = this.align(neighbors).limit(this.maxforce)
    const cohesion = this.cohesion(neighbors).limit(this.maxforce)

    separation.mul(1.4)
    alignment.mul(1.2)
    cohesion.mul(1)

    this.applyForce(separation)
    this.applyForce(alignment)
    this.applyForce(cohesion)

    this.behavour = BEHAVIOURS.SHOAL
  }

  avoid(fish, dist) {
    this.avoidList = fish
    for (let i = 0; i < fish.length; i++) {
      var dist = this.location.dist(fish[i].location)
      if (dist < dist) {
        var force = fish[i].location
          .copy()
          .sub(this.location)
          .mul(-100)
        this.applyForce(force)
      }
    }

    this.behaviour = BEHAVIOURS.AVOID
  }

  render(ctx) {
    const angle = this.velocity.angle()

    const x1 = this.location.x + Math.cos(angle) * this.base
    const y1 = this.location.y + Math.sin(angle) * this.base

    const x = this.location.x - Math.cos(angle) * this.length
    const y = this.location.y - Math.sin(angle) * this.length

    const x2 = this.location.x + Math.cos(angle + HALF_PI) * this.base
    const y2 = this.location.y + Math.sin(angle + HALF_PI) * this.base

    const x3 = this.location.x + Math.cos(angle - HALF_PI) * this.base
    const y3 = this.location.y + Math.sin(angle - HALF_PI) * this.base

    ctx.lineWidth = 2
    ctx.fillStyle = '#000'
    ctx.strokeStyle = '#000'
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.quadraticCurveTo(x2, y2, x, y)
    ctx.quadraticCurveTo(x3, y3, x1, y1)
    ctx.stroke()
    ctx.fill()
  }

  toJSON(stringify = true) {
    const data = {
      id: this.id,
      mass: this.mass,
      maxspeed: this.maxspeed,
      maxforce: this.maxforce,
      separationRange: this.separationRange,
      lookRange: this.lookRange,
      length: this.length,
      base: this.base,
      location: this.location.toJSON(stringify),
      velocity: this.velocity.toJSON(stringify),
      acceleration: this.acceleration.toJSON(stringify),
      wandering: this.wandering.toJSON(stringify),
      seed: this.seed
    }

    return stringify ? JSON.stringify(data, null, 2) : data
  }
}

Fish.fromJSON = function(json) {
  let {
    id,
    mass,
    maxspeed,
    maxforce,
    separationRange,
    lookRange,
    length,
    base,
    location,
    velocity,
    acceleration,
    wandering,
    seed
  } =
    typeof json === 'string' ? JSON.parse(json) : json

  location = Vector.fromJSON(location)
  velocity = Vector.fromJSON(velocity)
  acceleration = Vector.fromJSON(acceleration)
  wandering = Vector.fromJSON(wandering)

  const fish = new Fish(mass, location.x, location.y, seed)

  fish.id = id
  fish.mass = mass
  fish.maxspeed = maxspeed
  fish.maxforce = maxforce
  fish.separationRange = separationRange
  fish.lookRange = lookRange
  fish.length = length
  fish.base = base
  fish.location = location
  fish.velocity = velocity
  fish.acceleration = acceleration
  fish.wandering = wandering

  return fish
}

module.exports = Fish
