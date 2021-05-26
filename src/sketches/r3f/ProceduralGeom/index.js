import React, { useMemo } from 'react';
import { CanvasContainer } from '../../../common/styles';
import { useFrame } from '@react-three/fiber';
import {
  CameraHelper,
  DirectionalLight,
  HemisphereLight,
  PointLight,
  PointLightHelper,
  Vector3,
} from 'three';
import { OrbitControls } from '@react-three/drei';
import Shell from './Shell';
import Effects from './Effects';
import ThreeCanvas from '../../../three/ThreeCanvas';

function Lights() {
  let t = 0;
  const tStep = 0.5;
  const r = 3;
  const h = 6;
  useFrame((_, delta) => {
    t += tStep * delta;
    const x = r * Math.sin(t);
    const y = r * Math.cos(t);
    pointLight.position.set(x, h, y);
  });

  const { hemiLight } = useMemo(() => {
    const hemiLight = new HemisphereLight('#53f6d0', '#080820', 0.3);
    return { hemiLight };
  }, []);

  const dirLight = new DirectionalLight('#ffffff', 1);
  dirLight.lookAt(new Vector3(0, 0, 0));
  dirLight.position.set(5, 10, -5);
  dirLight.castShadow = false;
  dirLight.shadow.mapSize.width = 512;
  dirLight.shadow.mapSize.height = 512;
  // dirLight.shadow.camera.top = 4;
  // dirLight.shadow.camera.right = 5;
  // dirLight.shadow.camera.bottom = -4;
  // dirLight.shadow.camera.left = -5;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 30;
  dirLight.shadow.radius = 1000;

  const pointLight = new PointLight('#ff0000', 1, 25, 1);
  pointLight.shadow.mapSize.width = 1024;
  pointLight.shadow.mapSize.height = 1024;
  pointLight.castShadow = true;

  const dirLightHelper = new CameraHelper(dirLight.shadow.camera);
  const pointLightHelper = new PointLightHelper(pointLight, 0.5);

  return (
    <>
      <primitive object={hemiLight} />
      <primitive object={pointLight} />
      {/*<primitive object={dirLight} />*/}
      <primitive object={dirLightHelper} />
      {/*<primitive object={pointLightHelper} />*/}
    </>
  );
}

export default function ProceduralGeomSketch() {
  // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <CanvasContainer>
      <ThreeCanvas clearColor={'#09161f'}>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <axesHelper args={[5]} />
        <Lights />
        <Shell />
        <Effects />
      </ThreeCanvas>
    </CanvasContainer>
  );
}
