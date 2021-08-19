import React, { useEffect, useRef, useState } from 'react'
import p5 from 'p5'
import ParticlesSetup from './ParticlesSetup'
import { appStates } from 'services/SketchService'

export default function SketchParticlesSetup() {
  const sketchRef = useRef()
  const [sketch, setSketch] = useState(null)

  useEffect(() => {
    setSketch(new p5(ParticlesSetup, sketchRef.current))
  }, [])

  useEffect(() => {
    if (sketch) appStates.getState().setSketchRef(sketch)
  }, [sketch])

  return <div style={{ position: 'absolute', left: '0', right: '0', top: '0', bottom: '0' }} ref={sketchRef} />
}
