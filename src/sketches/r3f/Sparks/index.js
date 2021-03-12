import React, { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { Color } from 'three';
import { Canvas } from 'react-three-fiber';
import Particles from './Particles';
import Sparks from './Sparks';
import { CanvasContainer } from 'common/styles';
import Effects from './Effects';

/*
 * ~based on
 * // https://codesandbox.io/s/r3f-sparks-sbf2i
 */

export default function SparksSketch() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const mouse = useRef([0, 0]);
  const onMouseMove = useCallback(
    ({ clientX: x, clientY: y }) =>
      (mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2]),
    [],
  );

  return (
    <CanvasContainer>
      <Canvas
        pixelRatio={Math.min(2, isMobile ? window.devicePixelRatio : 1)}
        camera={{ fov: 100, position: [0, 0, 30] }}
        onMouseMove={onMouseMove}
        // onMouseUp={() => set(false)}
        // onMouseDown={() => set(true)}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.setClearColor(new Color('#020207'));
        }}
      >
        <axesHelper args={[5]} />
        {/*<OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />*/}
        <fog attach="fog" args={['white', 50, 190]} />
        <pointLight distance={100} intensity={4} color="white" />
        {/*<Number mouse={mouse} hover={hover} />*/}
        <Particles count={isMobile ? 5000 : 10000} mouse={mouse} />
        <Sparks
          count={20}
          mouse={mouse}
          colors={['#A2CCB6', '#FCEEB5', '#EE786E', '#e0feff', 'lightpink', 'lightblue']}
        />
        <Effects />
      </Canvas>
    </CanvasContainer>
  );
}
