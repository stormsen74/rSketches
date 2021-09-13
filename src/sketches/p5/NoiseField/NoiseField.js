import Tweakpane from 'tweakpane'
import Blob from './Blob'
import SimplexNoise from 'simplex-noise'

export default function NoiseField(p) {
  // vars
  let blobs = []
  let screenSize = { w: p.windowWidth, h: p.windowHeight }
  const simplex = new SimplexNoise(Math.random)
  const epsilon = 0.0001
  let t = 0.0

  let bufferImage = null
  let interval = null
  const sampleSize = 20
  const dotSize = 3
  const sizeBufferImage = { w: 0, h: 0 }

  const PARAMS = {
    curl: false,
    useSimplex: false,
    animateNoise: false,
    numBlobs: 1,
    noiseZ: 0.1,
    noiseScale: 0.0015,
    curlStrength: 1,
    strength: 2,
    drawNoise: false,
    someColor: 'rgba(0, 0, 0, .06)',
  }

  // tweaks
  const numBlobs_options = { min: 1, max: 1000, step: 1 }
  const curlStrength_options = { min: 0, max: 2, step: 0.01 }
  const strength_options = { min: 0, max: 4, step: 0.01 }
  const noiseScale_options = { min: 0, max: 0.005, step: 0.0001 }

  const pane = new Tweakpane({
    title: 'Parameters',
  })
  pane.addInput(PARAMS, 'numBlobs', numBlobs_options).on('change', resetBlobs)
  pane.addInput(PARAMS, 'noiseScale', noiseScale_options)
  pane.addInput(PARAMS, 'curl')
  pane.addInput(PARAMS, 'curlStrength', curlStrength_options)
  pane.addInput(PARAMS, 'strength', strength_options)
  pane.addInput(PARAMS, 'animateNoise')
  pane.addInput(PARAMS, 'useSimplex')
  pane.addInput(PARAMS, 'drawNoise').on('change', () => {
    if (PARAMS.drawNoise) {
      sizeBufferImage.w = (screenSize.w / sampleSize) * dotSize
      sizeBufferImage.h = (screenSize.h / sampleSize) * dotSize
      bufferImage = p.createGraphics(sizeBufferImage.w, sizeBufferImage.h)

      drawNoise()
      interval = setInterval(() => {
        drawNoise()
      }, 250)
    } else {
      clearInterval(interval)
      if (bufferImage) {
        bufferImage.remove()
        bufferImage = null
      }
    }
  })
  pane.addInput(PARAMS, 'someColor')

  // methods
  const getNoise = (x, y) => {
    const z = PARAMS.animateNoise ? t : PARAMS.noiseZ
    // simplex: -1 | 1 p5: 0 | 1
    return PARAMS.useSimplex ? simplex.noise3D(x, y, z) : p.noise(x, y, z)
  }

  const curlField = position => {
    const dx = getNoise(position.x + epsilon, position.y) - getNoise(position.x - epsilon, position.y)
    const dy = getNoise(position.x, position.y + epsilon) - getNoise(position.x, position.y - epsilon)

    const vCurl = p.createVector(dy, -dx)
    vCurl.mult(PARAMS.curlStrength / epsilon)
    if (PARAMS.useSimplex) vCurl.mult(0.25)

    return vCurl
  }

  const vectorFromAngle = (angle, length = 1) => {
    return p.createVector(length * Math.cos(angle), length * Math.sin(angle))
  }

  const getVelocity = position => {
    const noise = getNoise(position.x, position.y)
    const angle = noise * p.TWO_PI
    const m = PARAMS.useSimplex ? PARAMS.strength * 2 : PARAMS.strength
    return vectorFromAngle(angle, noise * m)
  }

  const addBlob = () => {
    const position = p.createVector(p.random(0, screenSize.w), p.random(0, screenSize.h))
    const blob = new Blob(p, position, p.createVector(0, 0), position, p.random(1, 5))
    blobs.push(blob)
  }

  const updateBlobs = () => {
    for (let i = blobs.length - 1; i >= 0; --i) {
      const blob = blobs[i]
      const position = blob.position.copy().mult(PARAMS.noiseScale)
      const vResult = PARAMS.curl ? curlField(position) : getVelocity(position)
      blob.velocity.set(vResult.x, vResult.y)
      blob.update()
      if (blob.isDead() || outOfScreen(blob.position)) {
        blobs.splice(i, 1)
        addBlob()
      }
    }
  }

  const drawNoise = () => {
    p.colorMode(p.HSL, 1)
    bufferImage.noStroke()

    for (let k = 0; k <= screenSize.w; k += sampleSize) {
      for (let j = 0; j <= screenSize.h; j += sampleSize) {
        const position = p.createVector(k, j)
        const pScaled = position.copy().mult(PARAMS.noiseScale)
        const noise = !PARAMS.useSimplex
          ? getNoise(pScaled.x, pScaled.y)
          : p.map(getNoise(pScaled.x, pScaled.y), -1, 1, 0, 1)

        const dotColor = p.color(p.map(noise, 0, 1, 0.5, 1), 0.6, 0.5)

        //draw
        bufferImage.fill(0)
        bufferImage.fill(dotColor)
        bufferImage.rect((k / sampleSize) * dotSize, (j / sampleSize) * dotSize, dotSize, dotSize)
      }
    }

    p.colorMode(p.RGB, 255)
  }

  function resetBlobs() {
    blobs = []
    for (let index = 0; index < PARAMS.numBlobs; index++) {
      addBlob()
    }
  }

  const outOfScreen = position => {
    return position.x < 0 || position.x > screenSize.w || position.y < 0 || position.y > screenSize.h
  }

  // p5
  p.setup = () => {
    p.createCanvas(screenSize.w, screenSize.h, p.P2D)
    p.frameRate(60)

    resetBlobs()
  }

  p.windowResized = () => {
    screenSize = { w: p.windowWidth, h: p.windowHeight }
    p.resizeCanvas(screenSize.w, screenSize.h)
    resetBlobs()
  }

  p.draw = () => {
    p.noStroke()
    p.fill(PARAMS.someColor)
    p.rect(0, 0, screenSize.w, screenSize.h)

    // if (PARAMS.plotField) plotField();
    // if (PARAMS.debugField) field.debugDraw();
    t += 0.003
    updateBlobs()
    if (PARAMS.drawNoise)
      p.image(bufferImage, screenSize.w - sizeBufferImage.w - 5, screenSize.h - sizeBufferImage.h - 5)
  }

  p.remove = () => {
    pane.dispose()
    clearInterval(interval)
    if (bufferImage) {
      bufferImage.remove()
      bufferImage = null
    }
  }
}
