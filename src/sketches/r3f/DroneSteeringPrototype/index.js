import { CanvasContainer } from '../../../common/styles'
import ThreeCanvas from '../../../three/ThreeCanvas'
import React, { useEffect, useRef } from 'react'
import { DirectionalLight, MeshStandardMaterial, Vector3 } from 'three'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useKeyPress } from '../../../utils/hooks'
import { Physics, useBox, usePlane, useSphere } from '@react-three/cannon'
import simpleDrone from './simple-drone.glb'
import DES_Blockout from './DES_Blockout.glb'
import { mapRange } from '../../../utils/math'
import { useFrame } from '@react-three/fiber'

function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t
}

function Lights() {
  const dirLight = new DirectionalLight('#ffffff', 1)
  dirLight.lookAt(new Vector3(0, 0, 0))
  dirLight.position.set(0, 10, 0)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 512
  dirLight.shadow.mapSize.height = 512
  dirLight.shadow.camera.right = 25
  dirLight.shadow.camera.left = -25
  dirLight.shadow.camera.top = 25
  dirLight.shadow.camera.bottom = -25
  dirLight.shadow.camera.near = 1
  dirLight.shadow.camera.far = 11

  const indirLight = new DirectionalLight('#ffffff', 0.3)
  indirLight.lookAt(new Vector3(0, 0, 0))
  indirLight.position.set(5, 5, 10)

  return (
    <>
      <ambientLight color={'#5c8694'} intensity={1} />
      <primitive object={dirLight} />
      <primitive object={indirLight} />
    </>
  )
}

function Plane(props) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
  return (
    <mesh ref={ref} receiveShadow={true}>
      <planeBufferGeometry attach="geometry" args={[230, 230]} />
      <meshStandardMaterial color={'#cccccc'} />
    </mesh>
  )
}

function Blockout() {
  const { scene } = useGLTF(DES_Blockout)

  useEffect(() => {
    scene.traverse(object => {
      if (object.isMesh) {
        object.castShadow = true
        object.material = new MeshStandardMaterial({
          color: '#1a5b59',
          metalness: 1,
          roughness: 0.5,
        })
      }
    })
  }, [])

  return (
    <group>
      <primitive object={scene} scale={[4, 4, 4]} visible={true} />
    </group>
  )
}

function Drone(props) {
  const { scene } = useGLTF(simpleDrone, true)
  const droneRef = useRef()
  const [ref, api] = useSphere(() => ({
    type: 'Dynamic',
    mass: 1,
    fixedRotation: true,
    position: [0, 2.5, 15],
    ...props,
  }))

  const forwardAngle = useRef(0)
  const t_lerp_1 = useRef(0)
  const t_lerp_2 = useRef(0)
  let forceDirection = 1
  let angularDirection = 1
  const MAX_FORCE = 20
  const velocity = useRef([0, 0, 0])

  const w = useKeyPress('w')
  const a = useKeyPress('a')
  const s = useKeyPress('s')
  const d = useKeyPress('d')

  const arrowUp = useKeyPress('ArrowUp')
  const arrowLeft = useKeyPress('ArrowLeft')
  const arrowDown = useKeyPress('ArrowDown')
  const arrowRight = useKeyPress('ArrowRight')

  const forward = w || arrowUp
  const backward = s || arrowDown
  const left = a || arrowLeft
  const right = d || arrowRight

  if (forward) forceDirection = 1
  if (backward) forceDirection = -1
  if (left) angularDirection = 1
  if (right) angularDirection = -1

  useEffect(() => {
    scene.traverse(object => {
      if (object.isMesh) {
        object.castShadow = true
        object.material = new MeshStandardMaterial({
          color: '#12263e',
          metalness: 1,
          roughness: 0.5,
        })
      }
    })

    api.velocity.subscribe(v => (velocity.current = v))
  }, [])

  useFrame((state, delta) => {
    // const t = state.clock.getElapsedTime();
    // state.camera.lookAt(ref.current.position);
    // state.camera.updateProjectionMatrix();

    const direction = new Vector3()
    ref.current.getWorldDirection(direction)
    direction.multiplyScalar(forceDirection * MAX_FORCE)

    const getAngleFromVelocity = () => {
      const v = new Vector3(velocity.current[0], velocity.current[1], velocity.current[2])
      return mapRange(v.length(), 0, 9, 0, Math.PI / 6) //lerp?
    }

    if (forward || backward) {
      api.applyForce([direction.x, direction.y, direction.z], [0, 0, 0])

      // forwardAngle
      let angle = getAngleFromVelocity()
      angle *= forceDirection === -1 ? -1 : 1
      forwardAngle.current = angle
      t_lerp_2.current = 0
    } else {
      api.linearDamping.set(0.9)

      // forwardAngle
      if (t_lerp_2.current < 1) {
        t_lerp_2.current += 3 * delta
        const oldAngle = forwardAngle.current
        forwardAngle.current = lerp(oldAngle, 0, t_lerp_2.current)
      }
    }

    droneRef.current.rotation.x = forwardAngle.current

    if (left || right) {
      t_lerp_1.current += 4 * delta
      const r = Math.min(lerp(0, 1, t_lerp_1.current), 2)
      api.angularVelocity.set(0, r * angularDirection, 0)
    } else {
      t_lerp_1.current = 0
      api.angularDamping.set(0.9)
    }
  })

  return (
    <group ref={ref}>
      <axesHelper />
      <primitive ref={droneRef} object={scene} scale={[3, 3, 3]} rotation={[0, Math.PI, 0]} visible={true} />
      <mesh castShadow={true}>
        <sphereBufferGeometry attach="geometry" />
        <meshNormalMaterial wireframe={true} transparent={true} opacity={0.05} visible={true} />
      </mesh>
    </group>
  )
}

function Sphere({ radius, position }) {
  const [ref, api] = useSphere(() => ({ type: 'Static', args: radius, position }))
  useFrame(({ clock: { elapsedTime } }) => {
    api.position.set(position[0], position[1], position[2])
  })
  return (
    <mesh castShadow ref={ref}>
      <sphereBufferGeometry args={[radius, 8, 8]} />
      <meshNormalMaterial />
    </mesh>
  )
}

function Cube({ position }) {
  const size = [55, 20, 15]
  const [ref, api] = useBox(() => ({ type: 'Static', args: size }))
  useFrame(() => {
    api.position.set(position[0], position[1], position[2])
  })
  return (
    <mesh castShadow ref={ref}>
      <boxBufferGeometry args={size} />
      <meshNormalMaterial transparent={true} opacity={0.1} wireframe={true} />
    </mesh>
  )
}

export default function DroneSteeringPrototype() {
  const camera = { fov: 35, near: 0.1, far: 1000, position: [10, 30, 10] }

  return (
    <CanvasContainer>
      <ThreeCanvas camera={camera} clearColor={'#0a1e29'}>
        <OrbitControls />
        <Lights />
        <Physics
          allowSleep={false}
          gravity={[0, 0, 0]}
          tolerance={0.1}
          iterations={10}
          defaultContactMaterial={{
            friction: 0,
            restitution: 0,
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3,
            frictionEquationStiffness: 1e8,
          }}
        >
          <Drone />
          <Blockout />
          {/*<Sphere position={[10, 1, 0]} radius={4} />*/}
          <Cube position={[0, -3, 0]} />
          <Plane />
        </Physics>
      </ThreeCanvas>
    </CanvasContainer>
  )
}
