export default class Blob {
  constructor(p, position, velocity, lastPosition, size) {
    this.p = p
    this.position = position
    this.velocity = velocity
    this.lastPosition = lastPosition
    this.size = size
    this.color = p.color('#315F6B')
    this.lifespan = p.random(350, 1800)
    this.lifetime = 0
  }

  update() {
    this.lifetime += 1

    const a = this.p.map(this.velocity.mag(), 0.001, 0.8, 0, 1)
    // console.log(this.velocity.mag(), a)

    const colorFrom = this.p.color(218, 165, 32)
    const colorTo = this.p.color(72, 61, 139)
    this.p.colorMode(this.p.RGB) // Try changing to HSB.
    this.color = this.p.lerpColor(colorFrom, colorTo, a)

    // const v = this.velocity;
    // this.dir >= 1 ? this.position.add(v) : this.position.sub(v)
    this.position.add(this.velocity)
  }

  isDead() {
    return this.lifetime > this.lifespan
  }
}
