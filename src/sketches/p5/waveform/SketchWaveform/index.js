import React, { useEffect, useRef, useState } from 'react'
import p5 from 'p5'
import WF from './WF'
import { appStates } from 'services/SketchService'

export default function SketchWaveform() {
  const sketchRef = useRef()
  const [sketch, setSketch] = useState(null)

  useEffect(() => {
    setSketch(new p5(WF, sketchRef.current))
  }, [])

  useEffect(() => {
    if (sketch) appStates.getState().setSketchRef(sketch)
  }, [sketch])

  return <div ref={sketchRef} />
}
