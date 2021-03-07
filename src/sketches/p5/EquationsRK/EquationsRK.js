import { Equations } from './Equations';
import Tweakpane from 'tweakpane';
import Blob from './Blob';
import Point from 'common/components/Point';

export default function EquationsRK(p) {
  // vars
  let blobs = [];
  let screenSize = { w: p.windowWidth, h: p.windowHeight };
  let scale = { x: 1, y: 1 };
  let center = { x: 0, y: 0 };
  const equations = new Equations();
  equations.setType('|sin(y),sin(x)|');

  const PARAMS = {
    speed: 0.0002,
    plotField: false,
    fScale: 20,
    numBlobs: 180,
    direction: 'positive',
    ode: '|sin(y),sin(x)|',
    someColor: 'rgba(0, 0, 0, .06)',
  };

  const equationList = {};
  equations.getTypes().forEach((equation) => {
    equationList[equation] = equation;
  });

  // tweaks
  const numBlobs_options = { min: 1, max: 1000, step: 1 };
  const fScale_options = { min: 1, max: 30, step: 1 };
  const speed_options = { min: 0.0, max: 0.005, step: 0.00001 };

  const pane = new Tweakpane({
    title: 'Parameters',
  });
  pane
    .addInput(PARAMS, 'ode', {
      options: equationList,
    })
    .on('change', () => {
      equations.setType(PARAMS.ode);
      resetBlobs();
    });
  pane.addInput(PARAMS, 'numBlobs', numBlobs_options).on('change', resetBlobs);
  pane.addInput(PARAMS, 'speed', speed_options);
  pane.addInput(PARAMS, 'fScale', fScale_options).on('change', onResize);
  pane
    .addInput(PARAMS, 'direction', {
      options: {
        positive: 'positive',
        negative: 'negative',
        both: 'both',
      },
    })
    .on('change', resetBlobs);
  pane.addInput(PARAMS, 'someColor');

  // methods
  const addBlob = () => {
    const x = p.random(0, screenSize.w);
    const y = p.random(0, screenSize.h);
    const position = p.createVector(x, y);

    const blob = new Blob(
      p,
      getSimPosition(position),
      p.createVector(0, 0),
      p.random(1, 5),
      getDir(),
    );

    blobs.push(blob);
  };

  const getDir = () => {
    let dir = 0;
    switch (PARAMS.direction) {
      case 'positive':
        dir = p.random(0.1, 1);
        break;
      case 'negative':
        dir = p.random(-0.1, -1);
        break;
      case 'both':
        dir = p.random(0.1, 1) * (p.random() > 0.5 ? 1 : -1);
        break;
    }
    return dir;
  };

  const getSimPosition = (position) => {
    return p.createVector((position.x - center.x) / scale.x, -(position.y - center.y) / scale.y);
  };

  const getScreenPosition = (position) => {
    return p.createVector(scale.x * position.x + center.x, -scale.y * position.y + center.y);
  };

  const outOfScreen = (position) => {
    return (
      position.x < 0 || position.x > screenSize.w || position.y < 0 || position.y > screenSize.h
    );
  };

  function onResize() {
    screenSize = { w: p.windowWidth, h: p.windowHeight };
    p.resizeCanvas(screenSize.w, screenSize.h);
    const xscale = screenSize.w / PARAMS.fScale;
    const yscale = (screenSize.h / PARAMS.fScale) * (screenSize.w / screenSize.h);
    scale = { x: xscale, y: yscale };
    center = { x: screenSize.w / 2, y: screenSize.h / 2 };
    resetBlobs();
  }

  const rk2 = (stepsize, position, dir) => {
    const x = position.x;
    const y = position.y;

    const k1x = equations.getSlopeX(x, y);
    const k1y = equations.getSlopeY(x, y);

    const k2x = equations.getSlopeX(x + 0.5 * dir * stepsize * k1x, y + 0.5 * dir * stepsize * k1y);
    const k2y = equations.getSlopeY(x + 0.5 * dir * stepsize * k1x, y + 0.5 * dir * stepsize * k1y);

    return new Point(stepsize * (k1x + k2x) * 0.5, stepsize * (k1y + k2y) * 0.5);
  };

  function resetBlobs() {
    blobs = [];
    for (let index = 0; index < PARAMS.numBlobs; index++) {
      addBlob();
    }
  }

  const updateBlobs = () => {
    const stepsize = p.frameRate() * PARAMS.speed;

    for (let i = blobs.length - 1; i >= 0; i--) {
      const blob = blobs[i];

      // const solver = this.settings.useRK4 ? this.rk4(stepsize, blob.position, blob.dir) : this.rk2(stepsize, blob.position, blob.dir);
      const solver = rk2(stepsize, blob.position, blob.dir);
      blob.velocity.set(blob.dir * solver.x, blob.dir * solver.y);
      blob.position.add(blob.velocity);

      const screenPosition = getScreenPosition(blob.position);
      p.stroke(blob.color);
      p.strokeWeight(blob.lifetime > 1 ? blob.size : 0);
      p.line(screenPosition.x, screenPosition.y, blob.lastPosition.x, blob.lastPosition.y);
      blob.lastPosition = screenPosition;

      blob.update();
      if (blob.isDead() || outOfScreen(screenPosition)) {
        blobs.splice(i, 1);
        addBlob();
      }
    }
  };

  // p5
  p.setup = () => {
    p.createCanvas(screenSize.w, screenSize.h, p.P2D);
    p.frameRate(60);

    resetBlobs();
    onResize();
  };

  p.windowResized = () => {
    onResize();
  };

  p.draw = () => {
    p.noStroke();
    p.fill(PARAMS.someColor);
    p.rect(0, 0, screenSize.w, screenSize.h);

    updateBlobs();
  };

  p.remove = () => {
    pane.dispose();
  };
}
