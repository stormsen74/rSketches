import React, { Suspense } from 'react'
import ThreeCanvas from 'three/ThreeCanvas'
import { CanvasContainer } from 'common/styles'
import { OrbitControls } from '@react-three/drei'
import {
  BoxBufferGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshNormalMaterial,
  Vector3,
} from 'three'
import { useFrame } from '@react-three/fiber'
import Effects from './Effects'
import { useTweaks } from 'use-tweaks'
import { useHideTweaks } from '../../../utils/hooks'
// import { Flow } from 'three/examples/jsm/modifiers/CurveModifier'

function Test() {
  useHideTweaks()
  const { progress } = useTweaks({
    progress: { value: 0, min: 0, max: 1, step: 0.001 },
  })

  const points = [new Vector3(-5, 0, 0), new Vector3(0, 2, -5), new Vector3(5, 0, 0)]
  const curve = new CatmullRomCurve3([points[0], points[1], points[2]])
  curve.tension = 0.5
  curve.curveType = 'catmullrom'

  const resolution = 15

  const curvePoints = curve.getPoints(resolution)
  const line = new Line(new BufferGeometry().setFromPoints(curvePoints), new LineBasicMaterial({ color: '#27cdee' }))

  const target = new Mesh(new BoxBufferGeometry(0.1), new MeshNormalMaterial())

  // const flow = new Flow(target)
  // flow.updateCurve(0, curve)

  useFrame(() => {
    const position = new Vector3()
    const tangent = new Vector3()
    const lookAt = new Vector3()

    position.copy(curve.getPointAt(progress))
    target.position.copy(position)
    tangent.copy(curve.getTangentAt(progress))
    target.lookAt(lookAt.copy(position).sub(tangent))
  })

  return (
    <>
      <primitive object={line} />
      <primitive object={target} />
    </>
  )
}

export default function CurveAnimation() {
  const camera = { fov: 35, near: 0.1, far: 1000, position: [-3, 5, 10] }

  return (
    <CanvasContainer>
      <ThreeCanvas camera={camera} clearColor={'#000000' /*'black'*/}>
        <Suspense fallback={<>Hi!</>}>
          <OrbitControls />
          <axesHelper args={[1]} />
          {/*<gridHelper />*/}
          {/*<directionalLight position={[1, 2, 2]} intensity={0.75} />*/}
          <Test />
          <Effects />
        </Suspense>
      </ThreeCanvas>
    </CanvasContainer>
  )
}
