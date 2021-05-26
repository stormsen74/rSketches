import Tweakpane from 'tweakpane'
import { Vector2 } from 'three'

export default function Spirals(p) {
  const center = new Vector2(p.windowWidth / 2, p.windowHeight / 2)
  const updateSpiral = () => {
    p.clear()
    createSpiral()
  }

  // https://en.wikipedia.org/wiki/Spiral/
  // https://mathcurve.com/courbes2d.gb/courbes2d.shtml

  const spiralTypes = {
    archimedean: theta => {
      return theta
    },
    hyperbolic: theta => {
      return 1 / theta
    },
    fermat: theta => {
      return Math.pow(theta, 0.5)
    },
    golden: theta => {
      return Math.pow(Math.E, theta * 0.3063489)
    },
    lituus: theta => {
      return Math.pow(theta, -0.5)
    },
    logarithmic: theta => {
      return Math.pow(Math.E, 0.5 * theta)
    },
    sinusoidal: theta => {
      return Math.cos(3 * theta)
    },
  }

  const pane = new Tweakpane({
    title: 'Parameters',
  })
  const PARAMS = {
    alpha: 50,
    step: 0.05,
    maxAngle: Math.PI * 6,
    type: 'archimedean',
    someColor: 'rgba(0, 0, 0, 1)',
  }

  // tweaks
  const scale_options = { min: 1, max: 200, step: 1 }
  const step_options = { min: 0.01, max: 1, step: 0.01 }
  const maxAngle_options = { min: 0, max: Math.PI * 10, step: 0.1 }
  const type_options = {
    options: {
      archimedean: 'archimedean',
      hyperbolic: 'hyperbolic',
      fermat: 'fermat',
      lituus: 'lituus',
      logarithmic: 'logarithmic',
      golden: 'golden',
      sinusoidal: 'sinusoidal',
    },
  }

  pane.addInput(PARAMS, 'alpha', scale_options).on('change', updateSpiral)
  pane.addInput(PARAMS, 'step', step_options).on('change', updateSpiral)
  pane.addInput(PARAMS, 'maxAngle', maxAngle_options).on('change', updateSpiral)
  pane.addInput(PARAMS, 'type', type_options).on('change', updateSpiral)
  pane.addInput(PARAMS, 'someColor')

  const onResize = () => {
    p.clear()
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

  const createSpiral = () => {
    p.colorMode(p.HSB, 1)

    const tempPosition = new Vector2().copy(center)

    for (let theta = 0; theta < PARAMS.maxAngle; theta += PARAMS.step) {
      const r = spiralTypes[PARAMS.type](theta)
      const position = new Vector2(r * Math.cos(theta), r * Math.sin(theta)).multiplyScalar(PARAMS.alpha).add(center)

      const b = p.map(theta, 0, PARAMS.maxAngle, 0.2, 1)
      const c = p.map(theta, 0, PARAMS.maxAngle, 0, 0.5)
      const color = p.color(c, c, b)

      p.stroke(color)
      p.line(tempPosition.x, tempPosition.y, position.x, position.y)

      tempPosition.copy(position)
    }
  }

  // p5
  p.setup = () => {
    p.createCanvas(0, 0, p.P2D)
    p.frameRate(60)
    p.colorMode(p.RGB, 255, 255, 255, 1)
    onResize()

    updateSpiral()
  }

  p.windowResized = () => {
    onResize()
  }

  p.mousePressed = () => {
    createSpiral()
  }

  p.draw = () => {}

  p.remove = () => {
    pane.dispose()
  }
}
