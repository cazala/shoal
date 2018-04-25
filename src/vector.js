class Vector {
  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }

  set(x, y, z) {
    this.x = x
    this.y = y
    this.z = z

    return this
  }

  add(vec) {
    this.x += vec.x
    this.y += vec.y
    this.z += vec.z

    return this
  }

  sub(vec) {
    this.x -= vec.x
    this.y -= vec.y
    this.z -= vec.z

    return this
  }

  mul(scalar) {
    this.x *= scalar
    this.y *= scalar
    this.z *= scalar

    return this
  }

  div(scalar) {
    !scalar && console.log('Division by zero!')

    this.x /= scalar
    this.y /= scalar
    this.z /= scalar

    return this
  }

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
  }

  normalize() {
    const mag = this.mag()
    if (mag) {
      this.div(mag)
    }
    return this
  }

  angles() {
    return [Math.atan2(this.y, this.x), Math.atan2(this.z, this.x)]
  }

  setMag(mag) {
    const [angleZ, angleY] = this.angles()
    this.x = mag * Math.cos(angleZ)
    this.y = mag * Math.sin(angleZ)
    this.z = mag * Math.sin(angleY)
    return this
  }

  setAngles(angleZ, angleY) {
    const mag = this.mag()
    this.x = mag * Math.cos(angleZ)
    this.y = mag * Math.sin(angleZ)
    this.z = mag * Math.sin(angleY)
    return this
  }

  rotate(az, ay) {
    const [angleZ, angleY] = this.angles()
    this.setAngles([angleZ + az, angleY + ay])
    return this
  }

  limit(limit) {
    const mag = this.mag()
    if (mag > limit) {
      this.setMag(limit)
    }
    return this
  }

  anglesBetween(vec) {
    const anglesA = this.angles()
    const anglesB = vec.angles()
    return [anglesA[0] - anglesB[0], anglesA[1] - anglesB[1]]
  }

  dot(vec) {
    return this.x * vec.x + this.y * vec.y + this.z * vec.z
  }

  lerp(vec, amount) {
    this.x += (vec.x - this.x) * amount
    this.y += (vec.y - this.y) * amount
    this.z += (vec.z - this.z) * amount
    return this
  }

  dist(vec) {
    const dx = this.x - vec.x
    const dy = this.y - vec.y
    const dz = this.z - vec.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  copy() {
    return new Vector(this.x, this.y, this.z)
  }

  toJSON(stringify = true) {
    const data = {
      x: this.x,
      y: this.y,
      z: this.z
    }

    return stringify ? JSON.stringify(data, null, 2) : data
  }
}

Vector.fromJSON = function(json) {
  const { x, y, z } = typeof json === 'string' ? JSON.parse(json) : json
  return new Vector(x, y, z)
}

module.exports = Vector
