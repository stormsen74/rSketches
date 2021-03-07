class Charge {
  constructor(p, position, charge) {
    this.p = p;
    this.position = position;
    this.charge = charge;
    this.radius = 10;
    this.dragging = false;
    this.offset = p.createVector();
  }

  pressed() {
    const mouse = this.p.createVector(this.p.mouseX, this.p.mouseY);
    if (
      mouse.x > this.position.x - this.radius &&
      mouse.x < this.position.x + this.radius &&
      mouse.y > this.position.y - this.radius &&
      mouse.y < this.position.y + this.radius
    ) {
      this.dragging = true;
      this.offset.x = this.position.x - mouse.x;
      this.offset.y = this.position.y - mouse.y;
    }
  }

  release() {
    this.dragging = false;
  }

  update() {
    if (this.dragging) {
      const mouse = this.p.createVector(this.p.mouseX, this.p.mouseY);
      this.position.x = mouse.x + this.offset.x;
      this.position.y = mouse.y + this.offset.y;
    } else {
      this.p.stroke(this.p.color(this.charge > 0 ? 'rgba(0,0,255,.5)' : 'rgba(255,0,0,.5)'));
      this.p.ellipse(this.position.x, this.position.y, 20, 20);
    }
  }
}

export default class Field {
  constructor(p) {
    this.p = p;

    const getRandomX = () => {
      return p.random(0, p.windowWidth);
    };

    const getRandomY = () => {
      return p.random(0, p.windowHeight);
    };

    const q1 = new Charge(p, p.createVector(getRandomX(), getRandomY()), 1);
    const q2 = new Charge(p, p.createVector(getRandomX(), getRandomY()), -1);

    this.charges = [q1, q2];
  }

  pressed() {
    this.charges.forEach((c) => {
      c.pressed();
    });
  }

  released() {
    this.charges.forEach((c) => {
      c.release();
    });
  }

  debugDraw() {
    this.p.noStroke();

    this.charges.forEach((c) => {
      c.update();
    });
  }

  getResult(position) {
    const location = this.p.createVector(position.x, position.y);
    const vResult = this.p.createVector();

    for (let index = 0; index < this.charges.length; index++) {
      const q = this.charges[index];
      const dir = location.copy().sub(q.position);
      const e = dir.copy().normalize();
      e.mult(q.charge / (4 * Math.PI));
      e.mult(1 / Math.pow(dir.mag(), 2));

      vResult.add(e);
    }

    vResult.mult(1000000);
    return vResult;

    /*--------------------------------------------
    ~ component Vector 1
    --------------------------------------------*/
    // this.rVec1 = location.copy().sub(this.Q1.position);

    // this.eVec1 = this.rVec1.copy().normalize();
    // Q/4*PI*e0*eR -> Q = charge (-/+)
    // this.eVec1.mult(this.Q1.charge / (4 * Math.PI));
    // rVec/r^3 || rVec/r^2
    // this.eVec1.mult(1 / Math.pow(this.rVec1.mag(), 2));
  }
}
