import React, { useMemo } from 'react';
import { WEBGL } from 'three/examples/jsm/WebGL';
import { Canvas } from 'react-three-fiber';
import { Color } from 'three';

export default function ThreeCanvas({ camera, clearColor = '#000000', children }) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const gl2 = useMemo(() => {
    return WEBGL.isWebGL2Available();
  }, []);

  console.log('gl2', gl2, 'isMobile', isMobile);

  const defaultCamera = { fov: 75, near: 0.1, far: 1000, z: 5, position: [0, 0, 10] };

  return (
    <Canvas
      pixelRatio={Math.min(2, isMobile ? window.devicePixelRatio : 1)}
      camera={camera || defaultCamera}
      shadowMap={true}
      colorManagement={true}
      onCreated={({ gl }) => {
        gl.setClearColor(new Color(clearColor));
        // gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
      onContextMenu={(e) => {
        e.nativeEvent.preventDefault();
      }}
    >
      {children}
    </Canvas>
  );
}
