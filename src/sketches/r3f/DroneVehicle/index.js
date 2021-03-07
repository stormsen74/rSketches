import React, { Suspense, useEffect, useRef } from 'react';
import { CanvasContainer } from '../../../common/styles';
import ThreeCanvas from '../../../three/ThreeCanvas';
import { OrbitControls } from '@react-three/drei';
import Vehicle from './Vehicle';
import { useHideTweaks, useKeyPress } from '../../../utils/hooks';
import { useTweaks } from 'use-tweaks';
import { useFrame } from 'react-three-fiber';
import { DoubleSide } from 'three';

function PhysicLayer() {
  useHideTweaks();
  const { keyboard, droneDebug } = useTweaks({
    keyboard: true,
    droneDebug: true,
  });

  const cubeMesh = useRef(null);
  const targetMesh = useRef(null);
  const vehicle = useRef(new Vehicle());
  const forceDirection = useRef(1);
  const angularDirection = useRef(1);

  useEffect(() => {
    console.log('init PhysicLayer!');

    vehicle.current.init(cubeMesh.current);

    return () => {
      vehicle.current.dispose();
    };
  }, []);

  const w = useKeyPress('w');
  const a = useKeyPress('a');
  const s = useKeyPress('s');
  const d = useKeyPress('d');

  const arrowUp = useKeyPress('ArrowUp');
  const arrowLeft = useKeyPress('ArrowLeft');
  const arrowDown = useKeyPress('ArrowDown');
  const arrowRight = useKeyPress('ArrowRight');

  const forward = w || arrowUp;
  const backward = s || arrowDown;
  const left = a || arrowLeft;
  const right = d || arrowRight;

  if (forward) forceDirection.current = 1;
  if (backward) forceDirection.current = -1;
  if (left) angularDirection.current = 1;
  if (right) angularDirection.current = -1;

  function updateTargetPosition(e) {
    targetMesh.current.position.set(e.point.x, 0, e.point.z);
  }

  const updateOnTarget = () => {
    vehicle.current.seek(targetMesh.current.position);
  };

  const updateOnKeyboard = () => {
    if (left || right) {
      vehicle.current.rotate(angularDirection.current);
    }

    if (forward || backward) {
      vehicle.current.move(forceDirection.current);
    } else {
      vehicle.current.break();
    }
  };

  const updateVehicle = () => {
    vehicle.current.update();
    cubeMesh.current.quaternion.slerp(vehicle.current.quaternion, 0.15);
    cubeMesh.current.position.set(
      vehicle.current.location.x,
      vehicle.current.location.y,
      vehicle.current.location.z,
    );
  };

  useFrame(() => {
    keyboard ? updateOnKeyboard() : updateOnTarget();
    updateVehicle();
  });

  return (
    <>
      <group ref={cubeMesh}>
        {droneDebug && (
          <>
            <axesHelper args={[1.5]} />
            <mesh>
              <boxBufferGeometry args={[1, 1, 1]} />
              <meshNormalMaterial transparent={true} opacity={1} wireframe={false} visible={true} />
            </mesh>
          </>
        )}
        {/*<primitive*/}
        {/*  ref={droneRef}*/}
        {/*  object={clonedScene}*/}
        {/*  scale={[3, 3, 3]}*/}
        {/*  rotation={[0, Math.PI, 0]}*/}
        {/*  visible={true}*/}
        {/*/>*/}
      </group>
      <group position={[0, -0.5, 0]}>
        <gridHelper args={[30, 30]} />
      </group>

      <mesh ref={targetMesh}>
        <sphereBufferGeometry args={[0.1]} />
        <meshBasicMaterial color={'#3a7ac8'} visible={!keyboard} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={!keyboard ? updateTargetPosition : null}
        visible={false}
      >
        <planeBufferGeometry args={[30, 30]} />
        <meshNormalMaterial side={DoubleSide} />
      </mesh>
    </>
  );
}

export default function DroneVehicle() {
  const camera = { fov: 35, near: 0.1, far: 1000, position: [10, 10, 15] };
  const orbitControls = useRef(null);

  return (
    <CanvasContainer>
      <ThreeCanvas camera={camera} clearColor={'#0a1e29'}>
        <OrbitControls ref={orbitControls} />
        <Suspense fallback={<>Hi!</>}>
          <PhysicLayer orbitControls={orbitControls} />
        </Suspense>
      </ThreeCanvas>
    </CanvasContainer>
  );
}
