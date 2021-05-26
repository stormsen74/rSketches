import Tweakpane from 'tweakpane'
import Blob from '../NoiseField/Blob'

import m from './assets/m.png'
import perlin from './assets/perlin.png'
import sw from './assets/sw.png'
import radial from './assets/radial.png'

export default function NoiseFieldImage(p) {
  // vars
  let blobs = []
  let screenSize = { w: p.windowWidth, h: p.windowHeight }

  let bufferImage = null
  let interval = null
  const sampleSize = 20
  const dotSize = 3
  const sizeBufferImage = { w: 0, h: 0 }

  let currentImage = null

  const PARAMS = {
    curl: false,
    numBlobs: 180,
    noiseZ: 0.1,
    epsilon: 1,
    curlStrength: 1,
    strength: 2,
    drawNoise: false,
    image: 0,
    someColor: 'rgba(0, 0, 0, .06)',
  }

  // tweaks
  const numBlobs_options = { min: 1, max: 1000, step: 1 }
  const curlStrength_options = { min: 0, max: 5, step: 0.01 }
  const strength_options = { min: 0, max: 10, step: 0.01 }
  const epsilon_options = { min: 0, max: 100, step: 1 }

  const pane = new Tweakpane({
    title: 'Parameters',
  })

  pane.addInput(PARAMS, 'numBlobs', numBlobs_options).on('change', resetBlobs)
  pane.addInput(PARAMS, 'curl')
  pane.addInput(PARAMS, 'epsilon', epsilon_options)
  pane.addInput(PARAMS, 'curlStrength', curlStrength_options)
  pane.addInput(PARAMS, 'strength', strength_options)
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
    const _x = p.map(x, 0, screenSize.w, 0, currentImage.width)
    const _y = p.map(y, 0, screenSize.h, 0, currentImage.height)
    const value = currentImage.get(_x, _y)
    return p.map(value[0], 0, 255, 0, 1)
  }

  const curlField = position => {
    const dx = getNoise(position.x + PARAMS.epsilon, position.y) - getNoise(position.x - PARAMS.epsilon, position.y)
    const dy = getNoise(position.x, position.y + PARAMS.epsilon) - getNoise(position.x, position.y - PARAMS.epsilon)

    const vCurl = p.createVector(dy, -dx)
    vCurl.mult(PARAMS.curlStrength)

    return vCurl
  }

  const vectorFromAngle = (angle, length = 1) => {
    return p.createVector(length * Math.cos(angle), length * Math.sin(angle))
  }

  const getVelocity = position => {
    const noise = getNoise(position.x, position.y)
    const angle = noise * p.TWO_PI
    const vResult = vectorFromAngle(angle, noise)
    vResult.mult(PARAMS.strength)
    return vResult
  }

  const addBlob = () => {
    const position = p.createVector(p.random(0, screenSize.w), p.random(0, screenSize.h))
    const blob = new Blob(p, position, p.createVector(0, 0), position, p.random(1, 5))
    blobs.push(blob)
  }

  const updateBlobs = () => {
    for (let i = blobs.length - 1; i >= 0; --i) {
      const blob = blobs[i]
      const position = blob.position.copy()
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
    p.colorMode(p.RGB, 1)
    bufferImage.noStroke()

    for (let k = 0; k <= screenSize.w; k += sampleSize) {
      for (let j = 0; j <= screenSize.h; j += sampleSize) {
        const position = p.createVector(k, j)
        const noise = getNoise(position.x, position.y)
        const dotColor = p.color(noise, noise, noise)

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
  p.preload = () => {
    const images = [p.loadImage(m), p.loadImage(perlin), p.loadImage(sw), p.loadImage(radial)]
    currentImage = images[0]

    pane
      .addInput(PARAMS, 'image', {
        options: {
          m: 0,
          perlin: 1,
          sw: 2,
          radial: 3,
        },
      })
      .on('change', e => {
        currentImage = images[e]
      })
  }

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
