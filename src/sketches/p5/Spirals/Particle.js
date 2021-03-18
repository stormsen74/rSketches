export default class Particle {
  constructor(p, position) {
    this.p = p;
    this.position = position;
    this.acceleration = this.p.createVector();
    this.velocity = this.p.createVector();
    this.shapeColor = this.p.color(this.p.random(75, 150), 255);
    this.lifespan = 500;
    this.maxSize = 12;
    this.tailLength = 200;
    this.history = [];
  }

  run() {
    this.update();
    this.display();
  }

  isDead() {
    return this.lifespan < 0;
  }

  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  update() {
    // this.velocity.add(this.acceleration);
    // this.position.add(this.velocity);
    // this.lifespan -= 2;

    this.history.push(this.position.copy());

    if (this.history.length > this.tailLength) {
      this.history.splice(0, 1);
    }
  }

  display() {
    this.p.noStroke();
    // const size = this.p.map(this.lifespan, 0, 500, this.maxSize, 0.1);
    const size = 1;
    this.shapeColor.setAlpha(255);
    this.p.fill(this.shapeColor);
    this.p.ellipse(this.position.x, this.position.y, size, size);

    for (let i = 0; i < this.history.length; i++) {
      const pos = this.history[i];
      const shapeSize = (i / this.tailLength) * size;
      this.p.ellipse(pos.x, pos.y, shapeSize, shapeSize);
    }
  }
}
