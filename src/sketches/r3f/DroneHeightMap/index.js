import { CanvasContainer } from '../../../common/styles';
import ThreeCanvas from '../../../three/ThreeCanvas';
import { OrbitControls, useGLTF } from '@react-three/drei';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import * as CANNON from 'cannon-es';
import { useFrame, useLoader } from 'react-three-fiber';
import { useHideTweaks, useKeyPress } from '../../../utils/hooks';
import Map from './blocksHeight.png';
import {
  DirectionalLight,
  DoubleSide,
  MeshStandardMaterial,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three';
import { useTweaks } from 'use-tweaks';
import { mapRange } from '../../../utils/math';
import simpleDrone from '../DroneSteeringPrototype/simple-drone.glb';
import CanvasHeightMap from './CanvasHeightMap';

// https://stackoverflow.com/questions/27533311/moving-a-body-to-a-specific-position
// https://stackoverflow.com/questions/49565413/move-cannon-js-body-toward-dynamic-position

function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

function Lights() {
  const dirLight = new DirectionalLight('#ffffff', 1);
  dirLight.lookAt(new Vector3(0, 0, 0));
  dirLight.position.set(0, 10, 0);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.right = 15;
  dirLight.shadow.camera.left = -15;
  dirLight.shadow.camera.top = 15;
  dirLight.shadow.camera.bottom = -15;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 13;

  return (
    <>
      <ambientLight color={'#92a3bc'} intensity={1} />
      <primitive object={dirLight} />
      {/*<primitive object={new CameraHelper(dirLight.shadow.camera)} />*/}
    </>
  );
}

function PhysicLayer({ orbitControls }) {
  useHideTweaks();
  const { keyboard, showGrid, droneDebug, showHeightMap, miniMap, targetCam, orbitCam } = useTweaks(
    {
      keyboard: true,
      showGrid: false,
      droneDebug: true,
      showHeightMap: false,
      miniMap: true,
      targetCam: false,
      orbitCam: true,
    },
  );

  const timeStep = 1 / 60;
  const MAX_FORCE = 20;

  const [world] = useState(() => new CANNON.World({ gravity: new CANNON.Vec3(0, -0.1, 0) }));

  const [cubeMaterial] = useState(new CANNON.Material());
  const [cubeShape] = useState(() => new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)));
  const [cubeBody] = useState(
    () =>
      new CANNON.Body({
        mass: 1,
        material: cubeMaterial,
        position: new CANNON.Vec3(0, 0.5, 0),
        // fixedRotation: true,
      }),
  );

  const [groundMaterial] = useState(new CANNON.Material());
  const [groundShape] = useState(() => new CANNON.Plane());
  const [groundBody] = useState(
    () =>
      new CANNON.Body({
        mass: 0,
        material: groundMaterial,
        type: CANNON.BODY_TYPES.STATIC,
      }),
  );

  const forceDirection = useRef(1);
  const angularDirection = useRef(1);
  const cubeMesh = useRef(null);
  const targetMesh = useRef(null);

  const { scene } = useGLTF(simpleDrone, true);
  const droneRef = useRef();

  const [mapTexture] = useLoader(TextureLoader, [Map]);
  const canvasHeightMap = useRef(new CanvasHeightMap(mapTexture));

  useEffect(() => {
    console.log('init Physics');

    canvasHeightMap.current.init();

    cubeBody.addShape(cubeShape);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    groundBody.addShape(groundShape);

    // Create contact material behaviour
    const contact_ground_cube = new CANNON.ContactMaterial(groundMaterial, cubeMaterial, {
      friction: 0.0,
      restitution: 0.0,
    });

    world.addContactMaterial(contact_ground_cube);
    world.addBody(cubeBody);
    world.addBody(groundBody);

    scene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.material = new MeshStandardMaterial({
          color: '#12263e',
          metalness: 1,
          roughness: 0.5,
        });
      }
    });

    return () => {
      world.removeBody(cubeBody);
      world.removeBody(groundBody);
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
    targetMesh.current.position.set(e.point.x, 0, e.point.z);
  }

  const updateOnKeyboard = () => {
    const direction = new Vector3();
    cubeMesh.current.getWorldDirection(direction);
    direction.multiplyScalar(forceDirection.current * MAX_FORCE);

    if (forward || backward) {
      cubeBody.applyForce(direction, new CANNON.Vec3(0, 0, 0));
    } else {
      cubeBody.linearDamping = 0.9;
    }

    if (left || right) {
      cubeBody.angularVelocity.set(0, angularDirection.current, 0);
    } else {
      cubeBody.angularDamping = 0.9;
    }

    // if (contact) cubeBody.applyImpulse(new CANNON.Vec3(0, 3, 0), new CANNON.Vec3(0, 0, 0));
  };

  const updateOnTarget = () => {
    const direction = new CANNON.Vec3();
    const vTargetPos = new CANNON.Vec3(
      targetMesh.current.position.x,
      targetMesh.current.position.y,
      targetMesh.current.position.z,
    );
    vTargetPos.vsub(cubeBody.position, direction);
    direction.y = 0;
    direction.normalize();

    const cubePosXZ = new CANNON.Vec3(cubeBody.position.x, 0, cubeBody.position.z);
    if (cubePosXZ.distanceTo(vTargetPos) > 0.5) {
      const forward = new CANNON.Vec3(0, 0, 1);
      const q1 = cubeBody.quaternion.clone();
      const q2 = q1.clone().setFromVectors(forward, direction);
      cubeBody.quaternion = q1.slerp(q2, 0.15);

      const speed = (cubePosXZ.distanceTo(vTargetPos) / 2) * 3;
      const targetVelocity = new CANNON.Vec3(speed, speed, speed);
      direction.vmul(targetVelocity, cubeBody.velocity);
    } else {
      cubeBody.linearDamping = 0.99;
    }
  };

  const updateHeightFromMap = () => {
    const currentHeight = cubeBody.position.y;
    const desiredHeight = canvasHeightMap.current.normalizedValue * 7.5;
    cubeBody.position.y = lerp(currentHeight, desiredHeight, 0.1);
  };

  const updateSecondaryAnimations = () => {
    const getAngleFromVelocity = () => {
      let angle = mapRange(cubeBody.velocity.length(), 0, 9, 0, Math.PI / 6);
      angle *= forceDirection.current === -1 ? -1 : 1;
      return angle;
    };

    droneRef.current.rotation.x = getAngleFromVelocity();
  };

  const updateWorld = () => {
    world.step(timeStep);
    cubeMesh.current.position.copy(cubeBody.position);
    cubeMesh.current.quaternion.copy(cubeBody.quaternion);
  };

  const updateReferenzPosition = () => {
    const vPosXZ = new Vector2(cubeBody.position.x, cubeBody.position.z);
    canvasHeightMap.current.updatePosition(vPosXZ);
  };

  const updateCamera = (_state) => {
    if (targetCam) {
      _state.camera.lookAt(cubeMesh.current.position);
      _state.camera.updateProjectionMatrix();
    }
  };

  useEffect(() => {
    orbitControls.current.enabled = orbitCam;
  }, [orbitCam]);

  useEffect(() => {
    canvasHeightMap.current.canvas.style.display = miniMap ? 'block' : 'none';
  }, [miniMap]);

  useFrame((state, delta) => {
    keyboard ? updateOnKeyboard() : updateOnTarget();
    updateWorld();
    updateHeightFromMap();
    updateReferenzPosition();
    updateSecondaryAnimations();
    updateCamera(state);
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
                opacity={0.25}
                wireframe={true}
                visible={true}
              />
            </mesh>
          </>
        )}
        <primitive
          ref={droneRef}
          object={scene}
          scale={[3, 3, 3]}
          rotation={[0, Math.PI, 0]}
          visible={true}
        />
      </group>
      <group>
        {showGrid && <gridHelper args={[30, 30]} />}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerMove={!keyboard ? updateTargetPosition : null}
          visible={false}
        >
          <planeBufferGeometry args={[30, 30]} />
          <meshNormalMaterial side={DoubleSide} />
        </mesh>
      </group>
      <mesh ref={targetMesh}>
        <sphereBufferGeometry args={[0.1]} />
        <meshBasicMaterial color={'#3a7ac8'} visible={!keyboard} />
      </mesh>

      <mesh position={[0, 0, 0]} receiveShadow={true}>
        <boxBufferGeometry args={[3, 8.5, 3, 5, 5, 5]} />
        <meshStandardMaterial
          color={'#124451'}
          transparent={true}
          opacity={1}
          wireframe={showHeightMap}
        />
      </mesh>
      <mesh position={[0, 0, 0]} receiveShadow={true}>
        <boxBufferGeometry args={[13, 3.5, 13, 5, 5, 5]} />
        <meshStandardMaterial
          color={'#124451'}
          transparent={true}
          opacity={1}
          wireframe={showHeightMap}
        />
      </mesh>

      {showHeightMap && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow={true}>
          <planeBufferGeometry args={[30, 30]} />
          <meshStandardMaterial map={mapTexture} />
        </mesh>
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow={true}>
        <planeBufferGeometry args={[30, 30]} />
        <meshStandardMaterial color={'#cccccc'} />
      </mesh>
    </>
  );
}

export default function DroneSteeringApproach() {
  const camera = { fov: 35, near: 0.1, far: 1000, position: [10, 10, 15] };
  const orbitControls = useRef(null);

  return (
    <CanvasContainer>
      <ThreeCanvas camera={camera} clearColor={'#0a1e29'}>
        <OrbitControls ref={orbitControls} />
        <Lights />
        <Suspense fallback={<>Hi!</>}>
          <PhysicLayer orbitControls={orbitControls} />
        </Suspense>
      </ThreeCanvas>
    </CanvasContainer>
  );
}
