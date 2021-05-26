import React, { Suspense, useEffect, useRef, useState } from 'react'
import { CanvasContainer } from '../../../common/styles'
import ThreeCanvas from '../../../three/ThreeCanvas'
import { OrbitControls } from '@react-three/drei'
import Vehicle from './Vehicle'
import { useHideTweaks, useKeyPress } from '../../../utils/hooks'
import { useTweaks } from 'use-tweaks'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, DoubleSide, Line, LineBasicMaterial, Raycaster, Vector3 } from 'three'
import { mapRange } from '../../../utils/math'

function PhysicLayer() {
  useHideTweaks()
  const { keyboard, droneDebug } = useTweaks({
    keyboard: true,
    droneDebug: true,
  })

  const cubeMesh = useRef(null)
  const targetMesh = useRef(null)
  const collisionMesh = useRef(null)
  const vehicle = useRef(new Vehicle())
  const forceDirection = useRef(1)
  const angularDirection = useRef(1)

  const raycaster = useRef(new Raycaster())
  const [rayLine, setRayLine] = useState(null)
  const [collision, setCollision] = useState(false)

  const setRayHelper = () => {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(new Float32Array([0.0, 0.0, 0.0, 10.0, 0.0, 0.0]), 3))
    const line = new Line(geometry, new LineBasicMaterial({ color: '#cc13ec' }))
    line.frustumCulled = false
    setRayLine(line)
  }

  useEffect(() => {
    console.log('init PhysicLayer!')
    // https://gist.github.com/nickjanssen/de388ae1090a16bb43ce

    vehicle.current.init(cubeMesh.current)
    setRayHelper()

    return () => {
      vehicle.current.dispose()
    }
  }, [])

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

  if (forward) forceDirection.current = 1
  if (backward) forceDirection.current = -1
  if (left) angularDirection.current = 1
  if (right) angularDirection.current = -1

  function updateTargetPosition(e) {
    targetMesh.current.position.set(e.point.x, 0, e.point.z)
  }

  const updateOnTarget = () => {
    vehicle.current.seek(targetMesh.current.position)
  }

  const updateOnKeyboard = () => {
    if (left || right) {
      vehicle.current.rotate(angularDirection.current)
    }

    if (forward || backward) {
      vehicle.current.move(forceDirection.current)
    } else {
      vehicle.current.break()
    }
  }

  const updateVehicle = () => {
    vehicle.current.update()
    cubeMesh.current.quaternion.slerp(vehicle.current.quaternion, 0.15)
    cubeMesh.current.position.set(vehicle.current.location.x, vehicle.current.location.y, vehicle.current.location.z)
  }

  const updateRayHelper = rayDirection => {
    const copy = vehicle.current.location.clone().add(rayDirection.clone().multiplyScalar(1))

    const posArray = rayLine.geometry.attributes.position.array
    posArray[0] = vehicle.current.location.x
    posArray[1] = vehicle.current.location.y
    posArray[2] = vehicle.current.location.z
    posArray[3] = copy.x
    posArray[4] = copy.y
    posArray[5] = copy.z

    rayLine.geometry.attributes.position.needsUpdate = true
  }

  const updateCollision = () => {
    const rayDirection = new Vector3(0, 0, 1).applyQuaternion(cubeMesh.current.quaternion)
    updateRayHelper(rayDirection)
    raycaster.current.set(vehicle.current.location, rayDirection)
    const intersect = raycaster.current.intersectObject(collisionMesh.current)
    if (intersect.length > 0 && intersect[0].distance < 1) {
      setCollision(true)
      const raycastNormal = intersect[0].face.normal
      const force = raycastNormal.clone().multiplyScalar(mapRange(intersect[0].distance, 1, 0, 0, 2))
      vehicle.current.applyForce(force)
    } else {
      setCollision(false)
    }
  }

  useFrame(() => {
    keyboard ? updateOnKeyboard() : updateOnTarget()
    updateVehicle()
    updateCollision()
  })

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

      <mesh rotation={[-Math.PI / 2, 0, 0]} onPointerMove={!keyboard ? updateTargetPosition : null} visible={false}>
        <planeBufferGeometry args={[30, 30]} />
        <meshNormalMaterial side={DoubleSide} />
      </mesh>

      <mesh ref={collisionMesh} position={[10, 0, 0]} rotation={[0, 0, 0]}>
        <boxBufferGeometry args={[5, 5, 5]} />
        <meshBasicMaterial
          color={!collision ? '#35db0c' : '#e30b50'}
          // color={'#35db0c'}
          transparent={false}
          opacity={0.5}
          wireframe={false}
        />
      </mesh>

      {rayLine && <primitive object={rayLine} />}
    </>
  )
}

export default function DroneVehicle() {
  const camera = { fov: 35, near: 0.1, far: 1000, position: [10, 10, 15] }
  const orbitControls = useRef(null)

  return (
    <CanvasContainer>
      <ThreeCanvas camera={camera} clearColor={'#0a1e29'}>
        <OrbitControls ref={orbitControls} />
        <Suspense fallback={<>Hi!</>}>
          <PhysicLayer orbitControls={orbitControls} />
        </Suspense>
      </ThreeCanvas>
    </CanvasContainer>
  )
}
