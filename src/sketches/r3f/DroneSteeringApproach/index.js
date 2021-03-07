import { CanvasContainer } from '../../../common/styles';
import ThreeCanvas from '../../../three/ThreeCanvas';
import { OrbitControls, useGLTF } from '@react-three/drei';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import * as CANNON from 'cannon-es';
import { useFrame } from 'react-three-fiber';
import { useHideTweaks, useKeyPress } from '../../../utils/hooks';
import { DirectionalLight, DoubleSide, MeshStandardMaterial, Vector3 } from 'three';
import { useTweaks } from 'use-tweaks';
import { mapRange } from '../../../utils/math';
import simpleDrone from '../DroneSteeringPrototype/simple-drone.glb';

// https://stackoverflow.com/questions/27533311/moving-a-body-to-a-specific-position
// https://stackoverflow.com/questions/49565413/move-cannon-js-body-toward-dynamic-position

const sineInOut = (t) => {
  return -0.5 * (Math.cos(Math.PI * t) - 1.0);
};

function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

function Lights() {
  const dirLight = new DirectionalLight('#ffffff', 1);
  dirLight.lookAt(new Vector3(0, 0, 0));
  dirLight.position.set(-1, 5, -1);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.right = 15;
  dirLight.shadow.camera.left = -15;
  dirLight.shadow.camera.top = 15;
  dirLight.shadow.camera.bottom = -15;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 12;

  return (
    <>
      <ambientLight color={'#49525f'} intensity={1} />
      <primitive object={dirLight} />
      {/*<primitive object={new CameraHelper(dirLight.shadow.camera)} />*/}
    </>
  );
}

function PhysicLayer() {
  useHideTweaks();
  const { keyboard, showGrid, droneDebug } = useTweaks({
    keyboard: true,
    showGrid: false,
    droneDebug: true,
  });

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

  const [zoneShape] = useState(() => new CANNON.Box(new CANNON.Vec3(2, 0.05, 2)));
  const [zoneBody] = useState(
    () =>
      new CANNON.Body({
        position: new CANNON.Vec3(0, -0.025, -6),
        type: CANNON.BODY_TYPES.STATIC,
      }),
  );

  const [blockShape] = useState(() => new CANNON.Box(new CANNON.Vec3(2, 2, 2)));
  const [blockBody] = useState(
    () =>
      new CANNON.Body({
        position: new CANNON.Vec3(-8, 0, 0),
        type: CANNON.BODY_TYPES.STATIC,
      }),
  );

  const [heightField] = useState({ radius: 3.5, maxHeight: 2 });
  const [distHeightShape] = useState(() => new CANNON.Sphere(0.1));
  const [distHeightBody] = useState(
    () =>
      new CANNON.Body({
        position: new CANNON.Vec3(0, 0, 7),
        type: CANNON.BODY_TYPES.STATIC,
      }),
  );

  const [contact, setContact] = useState(false);
  const forceDirection = useRef(1);
  const angularDirection = useRef(1);
  const cubeMesh = useRef(null);
  const zoneMesh = useRef(null);
  const targetMesh = useRef(null);
  const blockMesh = useRef(null);
  const distHeightMesh = useRef(null);

  const { scene } = useGLTF(simpleDrone, true);
  const droneRef = useRef();

  useEffect(() => {
    console.log('init Physics');

    distHeightBody.addShape(distHeightShape);
    distHeightBody.collisionResponse = false;

    blockBody.addShape(blockShape);
    cubeBody.addShape(cubeShape);
    zoneBody.addShape(zoneShape);
    zoneBody.collisionResponse = false;
    zoneBody.addEventListener('collide', () => setContact(true));

    world.addEventListener('beginContact', () => {});
    world.addEventListener('endContact', () => setContact(false));

    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    groundBody.addShape(groundShape);

    // Create contact material behaviour
    const contact_ground_cube = new CANNON.ContactMaterial(groundMaterial, cubeMaterial, {
      friction: 0.0,
      restitution: 0.0,
    });

    world.addContactMaterial(contact_ground_cube);
    world.addBody(cubeBody);
    world.addBody(blockBody);
    world.addBody(groundBody);
    world.addBody(zoneBody);
    world.addBody(distHeightBody);

    distHeightMesh.current.position.copy(distHeightBody.position);
    zoneMesh.current.position.copy(zoneBody.position);
    blockMesh.current.position.copy(blockBody.position);

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
      world.removeBody(zoneBody);
      world.removeBody(distHeightBody);
      world.removeEventListener('beginContact', () => {});
      world.removeEventListener('endContact', () => setContact(false));
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
      cubeBody.angularVelocity.set(0, angularDirection.current * 2, 0);
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

  const updateHeightForce = () => {
    const cubePosXZ = new CANNON.Vec3(cubeBody.position.x, 0, cubeBody.position.z);
    const distance = cubePosXZ.distanceTo(distHeightBody.position);
    if (distance < heightField.radius) {
      const normalizedDistance = mapRange(distance, heightField.radius, 0, 0, 1);
      const h = sineInOut(normalizedDistance) * heightField.maxHeight;
      cubeBody.position.y = 0.5 + h;
    } else {
      cubeBody.position.y = 0.5;
    }
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

  useFrame((state, delta) => {
    keyboard ? updateOnKeyboard() : updateOnTarget();
    updateHeightForce();
    updateSecondaryAnimations();
    updateWorld();
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
        {showGrid && <gridHelper args={[25, 25]} />}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerMove={!keyboard ? updateTargetPosition : null}
          visible={false}
        >
          <planeBufferGeometry args={[25, 25]} />
          <meshNormalMaterial side={DoubleSide} />
        </mesh>
      </group>
      <mesh ref={zoneMesh}>
        <boxBufferGeometry args={[4, 0.1, 4]} />
        <meshBasicMaterial
          color={contact ? '#cc0058' : '#00cc00'}
          transparent={true}
          opacity={0.5}
        />
      </mesh>
      <mesh ref={targetMesh}>
        <sphereBufferGeometry args={[0.1]} />
        <meshBasicMaterial color={'#3a7ac8'} visible={!keyboard} />
      </mesh>
      <mesh ref={distHeightMesh} rotation={[-Math.PI / 2, 0, 0]}>
        <ringBufferGeometry args={[heightField.radius - 0.05, heightField.radius, 32]} />
        <meshBasicMaterial color={'#cc0000'} transparent={true} opacity={0.5} />
      </mesh>

      <mesh ref={blockMesh} castShadow={true}>
        <boxBufferGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color={'#3a7ac8'} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow={true}>
        <planeBufferGeometry args={[25, 25]} />
        <meshStandardMaterial color={'#cccccc'} />
      </mesh>
    </>
  );
}

export default function DroneSteeringApproach() {
  const camera = { fov: 35, near: 0.1, far: 1000, position: [10, 10, 15] };

  return (
    <CanvasContainer>
      <ThreeCanvas camera={camera} clearColor={'#0a1e29'}>
        <OrbitControls />
        <Lights />
        <Suspense fallback={<>Hi!</>}>
          <PhysicLayer />
        </Suspense>
      </ThreeCanvas>
    </CanvasContainer>
  );
}
