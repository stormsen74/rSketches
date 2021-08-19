import Particle from './Particle'
import Tweakpane from 'tweakpane'

export default function ParticlesSetup(p) {
  const particles = []

  const pane = new Tweakpane({
    title: 'Parameters',
  })
  const PARAMS = {
    speed: 0.5,
    someColor: 'rgba(0, 0, 0, 1)',
  }
  pane.addInput(PARAMS, 'speed', {
    min: 0,
    max: 100,
  })
  pane.addInput(PARAMS, 'someColor')

  const addParticle = position => {
    const particle = new Particle(p, position)
    particles.push(particle)
  }

  const onResize = () => {
    p.clear()
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

  // p5
  p.setup = () => {
    p.createCanvas(0, 0, p.P2D)
    p.frameRate(60)
    p.colorMode(p.RGB, 255, 255, 255, 1)
    onResize()
  }

  p.windowResized = () => {
    onResize()
  }

  p.mousePressed = () => {
    addParticle(p.createVector(p.mouseX, p.mouseY))
  }

  p.draw = () => {
    p.background(PARAMS.someColor)
    // p.background('rgba(100,0,0,.5');
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      particle.run()
      if (particle.isDead()) {
        particles.splice(i, 1)
      }
    }
  }

  p.remove = () => {
    pane.dispose()
  }
}
