import React, { Suspense, useEffect, useRef, useState } from 'react'
import ThreeCanvas from 'three/ThreeCanvas'
import { useFrame, useLoader } from '@react-three/fiber'
import { CanvasContainer } from 'common/styles'
import { OrbitControls } from '@react-three/drei'
import {
  BoxBufferGeometry,
  CameraHelper,
  ConeGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PerspectiveCamera,
  RepeatWrapping,
  TextureLoader,
  Vector3,
} from 'three'
import cone_alpha from './cone_alpha.png'
import cone_map from './cone.png'
import uv_texture from './texture.jpg'
import radial_texture from './radial.png'
import ProjectedMaterial from 'three/ProjectedMaterial/ProjectedMaterial'
import { makeFolder, useTweaks } from 'use-tweaks'
import { useHideTweaks } from '../../../utils/hooks'
import { mapRange } from '../../../utils/math'

function Scene() {
  useHideTweaks()
  const { camx, camy, camz, tarx, tary, tarz, toggleAlpha, showCamHelper, showLightCone, animate } = useTweaks({
    ...makeFolder(
      'camera',
      {
        camx: { value: 0, min: -2, max: 2, step: 0.1 },
        camy: { value: 0, min: -2, max: 4, step: 0.1 },
        camz: { value: 3, min: 1.5, max: 10, step: 0.01 },
      },
      true
    ),
    ...makeFolder(
      'target',
      {
        tarx: { value: 0, min: -2, max: 2, step: 0.1 },
        tary: { value: 0, min: -2, max: 2, step: 0.1 },
        tarz: { value: 0, min: -1, max: 1, step: 0.01 },
      },
      true
    ),
    toggleAlpha: true,
    showCamHelper: false,
    showLightCone: true,
    animate: false,
  })

  const [projectedTexture, uvTexture, coneAlpha, coneMap] = useLoader(TextureLoader, [
    radial_texture,
    uv_texture,
    cone_alpha,
    cone_map,
  ])

  const [projectedMaterial, setProjectedMaterial] = useState()
  const [projectionBox, setProjectionBox] = useState()
  const [camHelper, setCamHelper] = useState()
  const [target] = useState(new Vector3(0, 0, 0))
  const [cone, setCone] = useState()
  const boxRef = useRef()
  const coneRef = useRef()

  const t = useRef(0)
  const [animator] = useState(new Vector3(0, 0, 0))

  const setupProjectionCam = () => {
    const projectionCamera = new PerspectiveCamera(45, 1, 0.01, 5)
    setProjectedMaterial(
      new ProjectedMaterial({
        camera: projectionCamera,
        texture: projectedTexture,
        transparent: true,
        // color: '#37E140',
        side: DoubleSide,
        map: uvTexture,
        metalness: 0,
        roughness: 0.5,
      })
    )
  }

  const setupLightCone = () => {
    const coneGeometry = new ConeGeometry(1, 1, 36, 1, true)
    coneGeometry
      .translate(0, -0.5, 0)
      .rotateX(Math.PI / 2)
      .rotateY(Math.PI)
    const material = new MeshBasicMaterial({
      color: '#35c4d2',
      transparent: true,
      opacity: 0.5,
      depthTest: true,
      depthWrite: false,
      map: coneMap,
      alphaMap: coneAlpha,
    })
    setCone(new Mesh(coneGeometry, material))
  }

  useEffect(() => {
    projectedTexture.magFilter = NearestFilter
    projectedTexture.minFilter = NearestFilter
    projectedTexture.anisotropy = 2
    coneMap.wrapS = coneMap.wrapT = RepeatWrapping
    coneMap.repeat.set(3, 1)

    setupProjectionCam()
    setupLightCone()
  }, [])

  useEffect(() => {
    if (projectedMaterial) {
      setCamHelper(new CameraHelper(projectedMaterial.camera))
      const geometry = new BoxBufferGeometry(2, 2, 2)
      setProjectionBox(new Mesh(geometry, projectedMaterial))
    }
  }, [projectedMaterial])

  useEffect(() => {
    if (projectedMaterial) projectedMaterial.transparent = !!toggleAlpha
  }, [toggleAlpha])

  useFrame((_, dt) => {
    if (projectionBox) {
      // => update projectedMaterial
      projectedMaterial.project(projectionBox)

      // => projectionCam
      if (animate) {
        t.current += dt * 0.5
        animator.set(2 * Math.sin(t.current), 2 * Math.cos(t.current), 2.5 + Math.sin(t.current))
        projectedMaterial.camera.position.copy(animator)
      } else {
        projectedMaterial.camera.position.set(camx, camy, camz)
      }
      if (target) target.set(tarx, tary, tarz)
      projectedMaterial.camera.lookAt(target)

      // => lightCone
      cone.position.copy(projectedMaterial.camera.position)
      cone.lookAt(target)
      const distanceToCubeWall = cone.position.distanceTo(projectionBox.position) - 0
      const radius = distanceToCubeWall * 0.25
      cone.scale.set(radius, radius, distanceToCubeWall)
      if (distanceToCubeWall > 5) {
        cone.material.opacity = 0
        projectedMaterial.uniforms.alphaBlend.value = 0.0
      } else {
        cone.material.opacity = Math.min(mapRange(distanceToCubeWall, 5, 4, 0, 0.5), 0.5)
        projectedMaterial.uniforms.alphaBlend.value = Math.min(mapRange(distanceToCubeWall, 5, 4, 0, 1), 1)
      }

      coneMap.offset.x += 0.005
    }
  })

  return (
    <>
      {camHelper && showCamHelper && <primitive object={camHelper} />}
      {projectionBox && <primitive ref={boxRef} object={projectionBox} />}
      {cone && showLightCone && <primitive ref={coneRef} object={cone} />}
      <mesh>
        <boxBufferGeometry />
        <meshNormalMaterial />
      </mesh>
    </>
  )
}

export default function TextureProjection() {
  const camera = { fov: 35, near: 0.1, far: 1000, position: [0, 1, 10] }

  return (
    <CanvasContainer>
      <ThreeCanvas camera={camera} clearColor={'#081a24'}>
        <Suspense fallback={<>Hi!</>}>
          <OrbitControls />
          {/*<axesHelper args={[5]} />*/}
          <directionalLight position={[1, 2, 2]} intensity={0.75} />
          <directionalLight position={[-1, 2, -5]} intensity={0.5} />
          <Scene />
        </Suspense>
      </ThreeCanvas>
    </CanvasContainer>
  )
}
