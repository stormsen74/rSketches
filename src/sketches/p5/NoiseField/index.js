import React, { useEffect, useRef, useState } from 'react'
import p5 from 'p5'
import { appStates } from 'services/SketchService'
import NoiseField from './NoiseField'

export default function SketchNoiseField() {
  const sketchRef = useRef()
  const [sketch, setSketch] = useState(null)

  useEffect(() => {
    setSketch(new p5(NoiseField, sketchRef.current))
  }, [])

  useEffect(() => {
    if (sketch) appStates.getState().setSketchRef(sketch)
  }, [sketch])

  return <div ref={sketchRef} />
}
