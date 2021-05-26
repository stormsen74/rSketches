import React, { useRef } from 'react';
import { CanvasContainer } from 'common/styles';
import ThreeCanvas from 'three/ThreeCanvas';
import { PLATONIC_TYPE, types } from './PlatonicTypes';
import {
  BufferGeometry,
  DirectionalLight,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  PolyhedronGeometry,
  Vector3,
} from 'three';
import { Html, OrbitControls } from '@react-three/drei';
import { useTweaks } from 'use-tweaks';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { useHideTweaks } from 'utils/hooks';
import { useFrame } from '@react-three/fiber';
import styled from 'styled-components';

const StyledPlate = styled.div`
  font-size: 20px;
  font-weight: bold;
  text-transform: uppercase;
  transform: translateY(-18vh);
  color: #618688;
`;

function Platonic({ position = undefined, type = undefined }) {
  const tweakable = type === undefined;
  useHideTweaks(!tweakable);
  const { selectedType, detail, flatShading } = useTweaks({
    selectedType: {
      value: PLATONIC_TYPE.TETRAHEDRON,
      options: [
        PLATONIC_TYPE.TETRAHEDRON,
        PLATONIC_TYPE.OCTAHEDRON,
        PLATONIC_TYPE.HEXAHEDRON,
        PLATONIC_TYPE.ICOSAHEDRON,
        PLATONIC_TYPE.DODECAHEDRON,
      ],
    },
    detail: { value: 0, min: 0, max: 5, step: 1 },
    flatShading: true,
  });

  const pType = tweakable ? types[selectedType] : types[type];
  const platonicGeometry = new PolyhedronGeometry(pType.vertices, pType.indices, 1, detail);
  platonicGeometry.computeFaceNormals();
  platonicGeometry.computeVertexNormals();
  const _platonicBufferGeometry = new BufferGeometry().fromGeometry(platonicGeometry);
  const platonicBufferGeometry = BufferGeometryUtils.mergeVertices(_platonicBufferGeometry);
  // const material = new MeshNormalMaterial({ flatShading: flatShading });
  const material = new MeshStandardMaterial({
    roughness: 0.5,
    metalness: 0.3,
    wireframe: false,
    flatShading: flatShading,
  });
  const platonicMesh = new Mesh(platonicBufferGeometry, material);
  platonicMesh.castShadow = true;
  const edges = new EdgesGeometry(platonicBufferGeometry);
  const edgeLines = new LineSegments(edges, new LineBasicMaterial({ color: '#050f15' }));
  const vertexNormalsHelper = new VertexNormalsHelper(platonicMesh, 0.25, '#13f1d9');

  // let angleX = 0;
  let angleY = 0;
  useFrame((_, delta) => {
    // angleX += 0.15 * delta;
    angleY += 0 * delta;
    if (!tweakable) {
      // groupRef.current.rotation.x = angleX;
      groupRef.current.rotation.y = angleY;
    }
  });

  const groupRef = useRef();

  return (
    <>
      <group ref={groupRef} position={position || [0, 0, 0]}>
        <Html center={true}>{/*<StyledPlate>{type}</StyledPlate>*/}</Html>
        <primitive object={platonicMesh} />
        <primitive object={edgeLines} />
        {tweakable && <primitive object={vertexNormalsHelper} />}
      </group>
    </>
  );
}

function PlatonicSolids() {
  function Lights() {
    const dirLight = new DirectionalLight('#ffffff', 1);
    dirLight.lookAt(new Vector3(0, 0, 0));
    dirLight.position.set(0, 10, 0);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.right = 7;
    dirLight.shadow.camera.left = -7;
    dirLight.shadow.camera.top = 3;
    dirLight.shadow.camera.bottom = -3;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 30;

    const indirLight = new DirectionalLight('#ffffff', 0.3);
    indirLight.lookAt(new Vector3(0, 0, 0));
    indirLight.position.set(5, 5, 10);

    // const dirLightHelper = new CameraHelper(dirLight.shadow.camera);

    return (
      <>
        <ambientLight color={'#bcbcbc'} intensity={0.1} />
        <primitive object={dirLight} />
        <primitive object={indirLight} />
        {/*<primitive object={dirLightHelper} />*/}
      </>
    );
  }

  return (
    <>
      <Lights />
      <group position={[0, 0, 0]}>
        <Platonic position={[-5, 0, 0]} type={PLATONIC_TYPE.TETRAHEDRON} />
        <Platonic position={[-2.5, 0, 0]} type={PLATONIC_TYPE.HEXAHEDRON} />
        <Platonic position={[0, 0, 0]} type={PLATONIC_TYPE.OCTAHEDRON} />
        <Platonic position={[2.5, 0, 0]} type={PLATONIC_TYPE.DODECAHEDRON} />
        <Platonic position={[5, 0, 0]} type={PLATONIC_TYPE.ICOSAHEDRON} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow={true}>
        <planeBufferGeometry args={[20, 20]} />
        <meshStandardMaterial color={'#082a41'} />
      </mesh>
    </>
  );
}

export default function Platonics() {
  const camera = { fov: 35, near: 0.1, far: 1000, position: [0, 1, 13] };
  const showPlatonics = false;

  return (
    <CanvasContainer>
      <ThreeCanvas camera={camera} clearColor={'#0a1e29'}>
        <OrbitControls />
        {showPlatonics ? (
          <PlatonicSolids />
        ) : (
          <Platonic position={[0, 0, 0]} rotation={[0, 1, 0]} />
        )}
      </ThreeCanvas>
    </CanvasContainer>
  );
}
