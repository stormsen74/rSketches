import React from 'react';
import ThreeCanvas from 'three/ThreeCanvas';
import styled from 'styled-components';
import { Tree } from './Tree';
import TreeGeometry from './TreeGeometry';
import { BufferGeometry, DoubleSide, Mesh, MeshNormalMaterial } from 'three';
import { OrbitControls } from '@react-three/drei';
import { TreeHelper } from './TreeHelper';
import { useTweaks } from 'use-tweaks';
import { useHideTweaks } from 'utils/hooks';

const Container = styled.div`
  width: 100%;
  height: 100vh;
`;

// https://github.com/mattatz/THREE.Tree

function Box() {
  useHideTweaks();

  const { generations, length, radius, radiusSegments, heightSegments } = useTweaks({
    generations: { value: 4, min: 1, max: 4, step: 1 },
    length: { value: 4, min: 1, max: 10, step: 1 },
    radius: { value: 0.2, min: 0.1, max: 1, step: 0.01 },
    radiusSegments: { value: 8, min: 3, max: 50, step: 1 },
    heightSegments: { value: 8, min: 2, max: 50, step: 1 },

    // eslint-disable-next-line no-console
    // ...makeButton('log()', () => console.log('... ' + Date.now())),
  });

  const tree = new Tree({
    generations: generations, // # for branch' hierarchy
    length: length, // length of root branch
    uvLength: 16.0, // uv.v ratio against geometry length (recommended is generations * length)
    radius: radius, // radius of root branch
    radiusSegments: radiusSegments, // # of radius segments for each branch geometry
    heightSegments: heightSegments, // # of height segments for each branch geometry
  });

  const geometry = new TreeGeometry().build(tree);
  const bufferGeometry = new BufferGeometry().fromGeometry(geometry);

  const treeMesh = new Mesh(
    bufferGeometry,
    new MeshNormalMaterial({
      side: DoubleSide,
      transparent: false,
      opacity: 1,
    }),
  );

  const helper = new TreeHelper(tree);
  helper.position.set(10, 0, 0);
  helper.showLine();

  return (
    <>
      <group position={[0, -5, 0]}>
        <primitive object={treeMesh} />;
        <primitive object={helper} />;
      </group>
    </>
  );
}

export default function TreeTest() {
  const camera = { fov: 75, near: 0.1, far: 1000, position: [0, 0, 10] };
  return (
    <Container>
      <ThreeCanvas camera={camera}>
        <OrbitControls />
        <axesHelper args={[5]} position={[0, -5, 0]} />
        <Box />
      </ThreeCanvas>
    </Container>
  );
}
