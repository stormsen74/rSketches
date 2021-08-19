import React, { useEffect, useRef, useState } from 'react'
import { ReactP5Wrapper } from '../../../common/p5Wrapper'
import Tweakpane from 'tweakpane'
import Particle from '../ParticlesSetup/Particle'

export default function P5Wrapper_test() {
  const sketch = p5 => {
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
      const particle = new Particle(p5, position)
      particles.push(particle)
    }

    const onResize = () => {
      p5.clear()
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
    }

    // p5
    p5.setup = () => {
      p5.createCanvas(0, 0, p5.P2D)
      p5.frameRate(60)
      p5.colorMode(p5.RGB, 255, 255, 255, 1)
      onResize()
    }

    p5.windowResized = () => {
      onResize()
    }

    p5.mousePressed = () => {
      addParticle(p5.createVector(p5.mouseX, p5.mouseY))
    }

    p5.draw = () => {
      p5.background(PARAMS.someColor)
      // p.background('rgba(100,0,0,.5');
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i]
        particle.run()
        if (particle.isDead()) {
          particles.splice(i, 1)
        }
      }
    }

    p5.remove = () => {
      pane.dispose()
    }
  }

  return <ReactP5Wrapper sketch={sketch} />
}
