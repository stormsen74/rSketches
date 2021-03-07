import React, { useEffect, useRef } from 'react';
import { extend, useFrame, useThree } from 'react-three-fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

extend({
  EffectComposer,
  ShaderPass,
  RenderPass,
  SSAOPass,
  FXAAShader,
});

export default function Effects() {
  const composer = useRef();
  const { scene, gl, size, camera } = useThree();
  useEffect(() => void composer.current.setSize(size.width, size.height), [size]);
  useFrame(() => composer.current.render(), 1);
  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      {/*<sSAOPass*/}
      {/*  attachArray="passes"*/}
      {/*  args={[scene, camera, 1024, 1024]}*/}
      {/*  kernelRadius={0.8}*/}
      {/*  maxDistance={0.4}*/}
      {/*/>*/}
      <shaderPass
        attachArray="passes"
        args={[FXAAShader]}
        material-uniforms-resolution-value={[1 / size.width, 1 / size.height]}
      />
    </effectComposer>
  );
}
