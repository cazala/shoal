class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  set(x, y) {
    this.x = x
    this.y = y

    return this
  }

  add(vec) {
    this.x += vec.x
    this.y += vec.y

    return this
  }

  sub(vec) {
    this.x -= vec.x
    this.y -= vec.y

    return this
  }

  mul(scalar) {
    this.x *= scalar
    this.y *= scalar

    return this
  }

  div(scalar) {
    !scalar && console.log('Division by zero!')

    this.x /= scalar
    this.y /= scalar

    return this
  }

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  normalize() {
    const mag = this.mag()
    if (mag) {
      this.div(mag)
    }
    return this
  }

  angle() {
    return Math.atan2(this.y, this.x)
  }

  setMag(mag) {
    const angle = this.angle()
    this.x = mag * Math.cos(angle)
    this.y = mag * Math.sin(angle)
    return this
  }

  setAngle(angle) {
    const mag = this.mag()
    this.x = mag * Math.cos(angle)
    this.y = mag * Math.sin(angle)
    return this
  }

  rotate(a) {
    this.setAngle(this.angle() + a)
    return this
  }

  limit(limit) {
    const mag = this.mag()
    if (mag > limit) {
      this.setMag(limit)
    }
    return this
  }

  angleBetween(vec) {
    return this.angle() - vec.angle()
  }

  dot(vec) {
    return this.x * vec.x + this.y * vec.y
  }

  lerp(vec, amount) {
    this.x += (vec.x - this.x) * amount
    this.y += (vec.y - this.y) * amount
    return this
  }

  dist(vec) {
    const dx = this.x - vec.x
    const dy = this.y - vec.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  copy() {
    return new Vector(this.x, this.y)
  }

  toJSON(stringify = true) {
    const data = {
      x: this.x,
      y: this.y
    }

    return stringify ? JSON.stringify(data, null, 2) : data
  }
}

Vector.fromJSON = function(json) {
  const { x, y } = typeof json === 'string' ? JSON.parse(json) : json
  return new Vector(x, y)
}

module.exports = Vector
