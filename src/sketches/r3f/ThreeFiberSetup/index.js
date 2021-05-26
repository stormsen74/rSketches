import React, { useRef, useState } from 'react'
import ThreeCanvas from 'three/ThreeCanvas'
import { makeButton, makeMonitor, makeSeparator, useTweaks } from 'use-tweaks'
import { CanvasContainer } from 'common/styles'
import { useHideTweaks } from 'utils/hooks'
import { useFrame } from '@react-three/fiber'

function Box(props) {
  useHideTweaks()

  const { speed, position, color } = useTweaks({
    color: '#1f495f',
    position: { value: { x: 0, y: 0 }, min: { x: -1, y: -1 }, max: { x: 1, y: 1 } },
    speed: { label: 'rotationSpeed', value: 0.01, min: 0.001, max: 0.1, step: 0.001 },
    ...makeSeparator(),
    ...makeMonitor('fnMonitor', Math.random, {
      view: 'graph',
      min: -0.5,
      max: 1.5,
      interval: 100,
    }),
    // eslint-disable-next-line no-console
    ...makeButton('log()', () => console.log('... ' + Date.now())),
  })

  // This reference will give us direct access to the mesh
  const mesh = useRef()

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    mesh.current.rotation.x = mesh.current.rotation.y += speed
  })

  return (
    <mesh
      {...props}
      ref={mesh}
      position-x={position.x}
      position-y={position.y}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : color} />
    </mesh>
  )
}

export default function ThreeFiberSetup() {
  const camera = { fov: 35, near: 0.1, far: 1000, position: [0, 1, 10] }
  return (
    <CanvasContainer>
      <ThreeCanvas camera={camera} clearColor={'#0a1e29'}>
        <ambientLight />
        <axesHelper />
        <pointLight position={[10, 10, 10]} />
        <Box position={[0, 0, 0]} />
      </ThreeCanvas>
    </CanvasContainer>
  )
}
