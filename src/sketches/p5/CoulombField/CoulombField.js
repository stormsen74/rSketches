import Field from './Field';
import Blob from './Blob';
import Tweakpane from 'tweakpane';

export default function CoulombField(p) {
  // vars
  let blobs = [];
  const field = new Field(p);
  const screenSize = { w: p.windowWidth, h: p.windowHeight };
  const epsilon = 0.0001;
  const strength = 50;



  const PARAMS = {
    emitFromCharge: false,
    curl: false,
    debugField: true,
    plotField: false,
    rndField: true,
    useBlobs: true,
    numBlobs: 180,
    someColor: 'rgba(0, 0, 0, .06)',
  };

  // tweaks
  const pane = new Tweakpane({
    title: 'Parameters',
  });
  pane
    .addInput(PARAMS, 'numBlobs', {
      min: 1,
      max: 1000,
      step: 1,
    })
    .on('change', resetBlobs);
  pane.addInput(PARAMS, 'emitFromCharge');
  pane.addInput(PARAMS, 'debugField');
  pane.addInput(PARAMS, 'rndField');
  pane.addInput(PARAMS, 'useBlobs');
  pane.addInput(PARAMS, 'plotField');
  pane.addInput(PARAMS, 'curl');
  pane.addInput(PARAMS, 'someColor');
  pane
    .addButton({
      title: 'clear',
    })
    .on('click', () => {
      p.clear();
    });

  // methods
  const addBlob = () => {
    const charge = field.charges[0];
    const vPosEmitter = charge.position.copy();
    const vOffset = p.createVector(25, 0);
    vOffset.rotate(Math.random() * p.TWO_PI).add(vOffset);
    vPosEmitter.add(vOffset);

    const rndPosition = p.createVector(p.random(0, screenSize.w), p.random(0, screenSize.h));

    const position = PARAMS.emitFromCharge ? vPosEmitter : rndPosition;
    const blob = new Blob(p, position, p.createVector(0, 0), position, p.random(1, 5));
    blobs.push(blob);
  };

  const curlField = (position) => {
    const dx =
      field.getResult(p.createVector(position.x + epsilon, position.y)).mag() -
      field.getResult(p.createVector(position.x - epsilon, position.y)).mag();
    const dy =
      field.getResult(p.createVector(position.x, position.y + epsilon)).mag() -
      field.getResult(p.createVector(position.x, position.y - epsilon)).mag();

    const vCurl = p.createVector(dy, -dx);

    vCurl.mult(strength / epsilon);

    return vCurl;
  };

  const plotField = () => {
    const res = 75;
    p.strokeWeight(1);

    for (let k = 0; k <= screenSize.w; k += res) {
      for (let j = 0; j <= screenSize.h; j += res) {
        const position = p.createVector(k, j);
        const vResult = PARAMS.curl ? curlField(position) : field.getResult(position);
        const angle = vResult.heading();
        const mag = vResult.mag();

        p.push();
        p.translate(position.x, position.y);
        p.rotate(angle);
        p.scale(0.9);
        p.stroke(mag * 255);
        p.line(-5, 0, 5, 0);
        p.pop();
      }
    }
  };

  const rndField = () => {
    const res = 150;
    const maxForce = 5;

    for (let x = 0, len = res; x < len; x++) {
      const position = p.createVector(Math.random() * screenSize.w, Math.random() * screenSize.h);
      const vResult = PARAMS.curl ? curlField(position) : field.getResult(position);
      const angle = vResult.heading();
      const mag = Math.min(vResult.mag(), maxForce);

      p.push();
      p.colorMode(p.HSB, 1);
      p.translate(position.x, position.y);
      p.rotate(angle);
      p.scale(0.9);
      const hue = p.map(mag, 0, maxForce, 0.75, 0.5);
      const w = p.map(mag, 0, maxForce, 1, 1.5);
      const l = p.map(mag, 0, maxForce, 30, 5);
      p.strokeWeight(w);
      p.stroke(hue, 0.75, 0.5);
      p.line(-l, 0, l, 0);
      p.pop();
    }
  };

  const updateBlobs = () => {
    for (let i = blobs.length - 1; i >= 0; --i) {
      const blob = blobs[i];

      const vResult = PARAMS.curl ? curlField(blob.position) : field.getResult(blob.position);

      blob.velocity.set(vResult.x, vResult.y);
      blob.position.add(blob.velocity);

      p.stroke(blob.color);
      p.strokeWeight(blob.size);
      p.line(blob.position.x, blob.position.y, blob.lastPosition.x, blob.lastPosition.y);

      blob.lastPosition = blob.position;

      blob.update();
      if (blob.isDead() || outOfScreen(blob.position)) {
        blobs.splice(i, 1);
        addBlob();
      }
    }
  };

  function resetBlobs() {
    blobs = [];
    for (let index = 0; index < PARAMS.numBlobs; index++) {
      addBlob();
    }
  }

  const outOfScreen = (position) => {
    return (
      position.x < 0 || position.x > screenSize.w || position.y < 0 || position.y > screenSize.h
    );
  };

  // p5
  p.setup = () => {
    p.createCanvas(screenSize.w, screenSize.h, p.P2D);
    p.frameRate(60);

    resetBlobs();
  };

  p.mousePressed = () => {
    field.pressed();
  };

  p.mouseDragged = () => {
    // rndField();
  };

  p.mouseReleased = () => {
    field.released();
  };

  p.draw = () => {
    p.noStroke();
    p.fill(PARAMS.someColor);
    p.rect(0, 0, screenSize.w, screenSize.h);

    if (PARAMS.plotField) plotField();
    if (PARAMS.debugField) field.debugDraw();
    if (PARAMS.rndField) rndField();
    if (PARAMS.useBlobs) updateBlobs();
  };

  p.remove = () => {
    pane.dispose();
  };
}
