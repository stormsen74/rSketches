import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import CoulombField from './CoulombField';
import { appStates } from 'services/SketchService';

export default function SketchField() {
  const sketchRef = useRef();
  const [sketch, setSketch] = useState(null);

  useEffect(() => {
    setSketch(new p5(CoulombField, sketchRef.current));
  }, []);

  useEffect(() => {
    if (sketch) appStates.getState().setSketchRef(sketch);
  }, [sketch]);

  return <div ref={sketchRef} />;
}
