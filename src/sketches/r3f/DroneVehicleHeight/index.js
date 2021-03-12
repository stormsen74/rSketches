import React, { Suspense, useEffect, useRef, useState } from 'react';
import { CanvasContainer } from '../../../common/styles';
import ThreeCanvas from '../../../three/ThreeCanvas';
import { OrbitControls, useGLTF } from '@react-three/drei';
import Vehicle from './Vehicle';
import { useHideTweaks, useKeyPress } from '../../../utils/hooks';
import { useTweaks } from 'use-tweaks';
import { useFrame, useLoader } from 'react-three-fiber';
import {
  Box3,
  DirectionalLight,
  MeshStandardMaterial,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three';
import DES_Blockout from './DES_Blockout_cut.glb';
import CanvasHeightMap from './CanvasHeightMap';
import Map from './blender_height_512_cutout.png';
import drone from './DES_drone.glb';

function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

function Lights() {
  const dirLight = new DirectionalLight('#ffffff', 0.75);
  dirLight.lookAt(new Vector3(0, 0, 0));
  dirLight.position.set(0, 10, 0);
  // dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 512;
  dirLight.shadow.mapSize.height = 512;
  dirLight.shadow.camera.right = 25;
  dirLight.shadow.camera.left = -25;
  dirLight.shadow.camera.top = 25;
  dirLight.shadow.camera.bottom = -25;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 11;

  const indirLight = new DirectionalLight('#ffffff', 0.3);
  indirLight.lookAt(new Vector3(0, 0, 0));
  indirLight.position.set(5, 5, 10);

  return (
    <>
      <primitive object={dirLight} />
      <primitive object={indirLight} />
    </>
  );
}

function Blockout() {
  const { scene } = useGLTF(DES_Blockout);

  useEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.material = new MeshStandardMaterial({
          color: '#1a5b59',
          metalness: 1,
          roughness: 0.5,
        });
      }
    });
  }, []);

  return (
    <group>
      <primitive object={scene} scale={[4, 4, 4]} visible={true} />
    </group>
  );
}

function PhysicLayer() {
  useHideTweaks();
  const { keyboard, droneDebug } = useTweaks({
    keyboard: true,
    droneDebug: true,
  });

  const DEFAULT_HEIGHT = 4;

  const { scene } = useGLTF(drone);
  const cubeMesh = useRef(null);
  const targetMesh = useRef(null);
  const boxMesh = useRef(null);
  const aabb = useRef(new Box3());
  const [areaActive, setAreaActive] = useState(false);
  const vehicle = useRef(new Vehicle());
  const forceDirection = useRef(1);
  const angularDirection = useRef(1);
  const [mapTexture] = useLoader(TextureLoader, [Map]);
  const canvasHeightMap = useRef(new CanvasHeightMap());

  useEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.material = new MeshStandardMaterial({
          color: '#de7a0f',
          metalness: 1,
          roughness: 0.5,
        });
      }
    });

    canvasHeightMap.current.init(mapTexture);
    vehicle.current.init(cubeMesh.current);
    aabb.current.setFromObject(boxMesh.current);

    return () => {
      vehicle.current.dispose();
      canvasHeightMap.current.dispose();
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
    targetMesh.current.position.set(e.point.x, DEFAULT_HEIGHT, e.point.z);
  }

  const updateOnTarget = () => {
    const vPosXZ = new Vector3(
      targetMesh.current.position.x,
      vehicle.current.location.y,
      targetMesh.current.position.z,
    );
    vehicle.current.seek(vPosXZ);
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

  const updateReferenzPosition = () => {
    const vPosXZ = new Vector2(cubeMesh.current.position.x, cubeMesh.current.position.z);
    canvasHeightMap.current.updatePosition(vPosXZ);
  };

  const updateVehicle = () => {
    vehicle.current.update();
    cubeMesh.current.quaternion.slerp(vehicle.current.quaternion, 0.15);
    cubeMesh.current.position.set(
      vehicle.current.location.x,
      vehicle.current.location.y + DEFAULT_HEIGHT,
      vehicle.current.location.z,
    );
  };

  const updateHeightFromMap = () => {
    const currentHeight = vehicle.current.location.y;
    const desiredHeight = canvasHeightMap.current.normalizedValue * 6;
    vehicle.current.location.y = lerp(currentHeight, desiredHeight, 0.1);
  };

  const checkBoundingBox = () => {
    setAreaActive(aabb.current.containsPoint(vehicle.current.location));
  };

  useFrame(() => {
    keyboard.value ? updateOnKeyboard() : updateOnTarget();
    updateReferenzPosition();
    updateHeightFromMap();
    checkBoundingBox();
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
              <meshNormalMaterial
                transparent={true}
                opacity={0.5}
                wireframe={true}
                visible={true}
              />
            </mesh>
          </>
        )}
        <primitive
          object={scene}
          scale={[1.5, 1.5, 1.5]}
          rotation={[0, Math.PI, 0]}
          visible={true}
        />
      </group>

      <mesh ref={targetMesh}>
        <sphereBufferGeometry args={[0.1]} />
        <meshBasicMaterial color={'#ff7236'} visible={!keyboard.value} />
      </mesh>

      <mesh ref={boxMesh} position={[0, 5, 17]}>
        <boxBufferGeometry args={[10, 10, 10]} />
        <meshBasicMaterial
          color={areaActive ? '#35db0c' : '#e30b50'}
          transparent={true}
          opacity={1}
          wireframe={true}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, DEFAULT_HEIGHT, 0]}
        onPointerMove={!keyboard.value ? updateTargetPosition : null}
        visible={!keyboard.value}
      >
        <planeBufferGeometry args={[150, 150, 1, 1]} />
        <meshBasicMaterial color={'#00cc00'} transparent={true} opacity={0.25} wireframe={true} />
      </mesh>
    </>
  );
}

export default function DroneVehicleHeight() {
  const camera = { fov: 35, near: 0.1, far: 1000, position: [10, 15, 40] };
  const orbitControls = useRef(null);

  return (
    <CanvasContainer>
      <ThreeCanvas camera={camera} clearColor={'#0a1e29'}>
        <OrbitControls ref={orbitControls} />
        <Suspense fallback={<>Hi!</>}>
          <PhysicLayer orbitControls={orbitControls} />
          <Blockout />
          <Lights />
        </Suspense>
      </ThreeCanvas>
    </CanvasContainer>
  );
}
