import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import { appStates } from 'services/SketchService';
import EquationsRK from './EquationsRK';

export default function SketchEquationsRK() {
  const sketchRef = useRef();
  const [sketch, setSketch] = useState(null);

  useEffect(() => {
    setSketch(new p5(EquationsRK, sketchRef.current));
  }, []);

  useEffect(() => {
    if (sketch) appStates.getState().setSketchRef(sketch);
  }, [sketch]);

  return <div ref={sketchRef} />;
}
