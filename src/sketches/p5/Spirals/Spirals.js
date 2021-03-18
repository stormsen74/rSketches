import Particle from './Particle';
import Tweakpane from 'tweakpane';
import { Vector2 } from 'three';

export default function Spirals(p) {
  const particles = [];
  const center = new Vector2(p.windowWidth / 2, p.windowHeight / 2);
  const polar = { r: 10, theta: 0 };
  const cartesian = { x: 0, y: 0 };

  const pane = new Tweakpane({
    title: 'Parameters',
  });
  const PARAMS = {
    deltaAngle: 0.01,
    someColor: 'rgba(0, 0, 0, 1)',
  };
  pane.addInput(PARAMS, 'deltaAngle', {
    min: -1,
    max: 1,
    step: 0.01,
  });
  pane.addInput(PARAMS, 'someColor');

  const addParticle = (position) => {
    const particle = new Particle(p, position);
    particles.push(particle);
  };

  const onResize = () => {
    p.clear();
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  const updateSpiral = () => {
    polar.theta += PARAMS.deltaAngle;
    polar.r = polar.theta;
    // Convert polar to cartesian
    cartesian.x = polar.r * Math.cos(polar.theta);
    cartesian.y = polar.r * Math.sin(polar.theta);
    particles[0].position.x = center.x + cartesian.x;
    particles[0].position.y = center.y + cartesian.y;
    // particles[0].setPosition(position.x, position.y);
  };

  const createSpiral = () => {
    p.colorMode(p.HSB, 1);

    const step = 0.05;
    const maxRad = Math.PI * 6;
    // const center = new Vector2(p.mouseX, p.mouseY);
    const tempPosition = new Vector2().copy(center);

    for (let theta = 0; theta < maxRad; theta += step) {
      // const r = theta;
      const r = Math.pow(theta, 0.5);

      const position = new Vector2(r * Math.cos(theta), r * Math.sin(theta))
        .multiplyScalar(10)
        .add(center);

      const b = p.map(theta, 0, maxRad, 0.2, 1);
      const color = p.color(0.75, 0.5, b);

      p.stroke(color);
      p.line(tempPosition.x, tempPosition.y, position.x, position.y);

      tempPosition.copy(position);
    }
  };

  // p5
  p.setup = () => {
    p.createCanvas(0, 0, p.P2D);
    p.frameRate(60);
    p.colorMode(p.RGB, 255, 255, 255, 1);
    onResize();

    // center.x = p.windowWidth / 2;
    // center.y = p.windowHeight / 2;

    createSpiral();

    addParticle(p.createVector(0, 0));
  };

  p.windowResized = () => {
    onResize();
  };

  p.mousePressed = () => {
    createSpiral();
  };

  p.draw = () => {
    // updateSpiral();
    // p.background(PARAMS.someColor);
    // p.background('rgba(100,0,0,.5');
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      particle.run();
      if (particle.isDead()) {
        particles.splice(i, 1);
      }
    }
  };

  p.remove = () => {
    pane.dispose();
  };
}
