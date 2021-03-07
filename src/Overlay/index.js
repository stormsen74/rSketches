import { useHistory, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import { appStates } from '../services/SketchService';
import { sketches, sketchTypes } from '../IndexPage/sketches';
import IconClose from 'common/icons/x.svg';
import { Close, Display, Wrapper } from './styles';

export default function Overlay() {
  const location = useLocation();
  const history = useHistory();
  const sketch = appStates((state) => state.sketch);
  const sketchRef = appStates((state) => state.sketchRef);
  const sketchIsActive = sketch && Object.keys(sketch).length > 0;

  useEffect(() => {
    const route = location.pathname;
    const activeSketch = sketches.find((sketch) => route === sketch.route);
    appStates.getState().setSketch(activeSketch);

    if (location.pathname === '/' && sketch) {
      if (sketch.type === sketchTypes.p5) {
        if (sketchRef) {
          sketchRef.remove();
        }
      }
      appStates.getState().setSketchRef(null);
      appStates.getState().setSketch(null);
    }
  }, [location]);

  return (
    sketchIsActive && (
      <>
        <Wrapper>
          <Close
            onClick={() => {
              history.push('/');
            }}
          >
            <IconClose />
          </Close>
        </Wrapper>
        <Display>{sketch.title}</Display>
      </>
    )
  );
}
