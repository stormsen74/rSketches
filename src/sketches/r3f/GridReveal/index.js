import React, { Suspense, useEffect, useRef, useState } from 'react'
import ThreeCanvas from 'three/ThreeCanvas'
import { useFrame, useLoader } from '@react-three/fiber'
import { CanvasContainer } from 'common/styles'
import { OrbitControls } from '@react-three/drei'
import gridDefault from './gridDefault.png'
import gridHighlight from './gridHighlight.png'
import bottom from './bottom.png'
import radial_texture from './radial.png'
import ProjectedMaterial from 'three/ProjectedMaterial/ProjectedMaterial'
import { useHideTweaks } from '../../../utils/hooks'
import { useTweaks } from 'use-tweaks'
import {
  CameraHelper,
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  NearestFilter,
  PerspectiveCamera,
  PlaneBufferGeometry,
  RepeatWrapping,
  TextureLoader,
  Vector3,
} from 'three'

function Scene() {
  useHideTweaks()
  const { showCamHelper, animate } = useTweaks({
    showCamHelper: false,
    animate: false,
  })

  const [projectedTexture, gridDefaultTexture, gridHighlightTexture, bottomTexture] = useLoader(TextureLoader, [
    radial_texture,
    gridDefault,
    gridHighlight,
    bottom,
  ])

  const [projectedMaterial, setProjectedMaterial] = useState()
  const [projectionPlane, setProjectionPlane] = useState()
  const [highlightPlane, setHighlightPlane] = useState()
  const [bottomPlane, setBottomPlane] = useState()
  const [camHelper, setCamHelper] = useState()
  const planeRef = useRef()

  const t = useRef(0)
  const [animator] = useState(new Vector3(0, 10, 0))

  const setupProjectionCam = () => {
    const projectionCamera = new PerspectiveCamera(45, 1, 0.01, 5)
    setProjectedMaterial(
      new ProjectedMaterial({
        camera: projectionCamera,
        texture: projectedTexture,
        textureScale: 2,
        transparent: true,
        // color: '#37E140',
        side: DoubleSide,
        map: gridDefaultTexture,
        metalness: 1,
        roughness: 0.75,
      })
    )
  }

  useEffect(() => {
    if (projectedMaterial) {
      setCamHelper(new CameraHelper(projectedMaterial.camera))
      const planeGeometry = new PlaneBufferGeometry(50, 50)
      const mesh = new Mesh(planeGeometry, projectedMaterial)
      mesh.rotateX(-Math.PI / 2)
      setProjectionPlane(mesh)

      const highlightMaterial = new MeshStandardMaterial({
        transparent: true,
        map: gridHighlightTexture,
        emissive: '#00ff00',
        envMapIntensity: 2,
        emissiveMap: gridHighlightTexture,
        premultipliedAlpha: false,
      })
      const highlightMesh = new Mesh(planeGeometry, highlightMaterial)
      highlightMesh.rotateX(-Math.PI / 2).translateZ(-0.01)
      setHighlightPlane(highlightMesh)

      const bottomMaterial = new MeshStandardMaterial({
        metalness: 1,
        roughness: 0.5,
        map: bottomTexture,
      })
      const bottomMesh = new Mesh(planeGeometry, bottomMaterial)
      bottomMesh.rotateX(-Math.PI / 2).translateZ(-0.02)
      setBottomPlane(bottomMesh)
    }
  }, [projectedMaterial])

  useEffect(() => {
    projectedTexture.magFilter = NearestFilter
    projectedTexture.minFilter = NearestFilter
    projectedTexture.anisotropy = 2

    gridDefaultTexture.wrapS = gridDefaultTexture.wrapT = RepeatWrapping
    gridDefaultTexture.repeat.set(15, 15)

    gridHighlightTexture.wrapS = gridHighlightTexture.wrapT = RepeatWrapping
    gridHighlightTexture.repeat.set(15, 15)

    setupProjectionCam()
  }, [])

  useFrame((_, dt) => {
    if (projectionPlane) {
      // => update projectedMaterial
      projectedMaterial.project(projectionPlane)

      if (animate) {
        t.current += dt * 0.5
        animator.set(5 * Math.sin(t.current), 10, 5 * Math.cos(t.current))
      }

      projectedMaterial.camera.position.copy(animator)
      projectedMaterial.camera.lookAt(animator.clone().setY(0))
      projectedMaterial.uniforms.alphaBlend.value = 1
    }
  })

  return (
    <>
      {camHelper && showCamHelper && <primitive object={camHelper} />}
      {projectionPlane && <primitive ref={planeRef} object={projectionPlane} />}
      {highlightPlane && <primitive object={highlightPlane} />}
      {/*{bottomPlane && <primitive object={bottomPlane} />}*/}
      {/*<mesh>*/}
      {/*  <boxBufferGeometry />*/}
      {/*  <meshBasicMaterial color={'#393939'} />*/}
      {/*</mesh>*/}
    </>
  )
}

export default function GridReveal() {
  const camera = { fov: 35, near: 0.1, far: 1000, position: [0, 1, 10] }

  return (
    <CanvasContainer>
      <ThreeCanvas camera={camera} clearColor={'#343434'}>
        <Suspense fallback={<>Hi!</>}>
          <OrbitControls />
          {/*<axesHelper args={[1]} />*/}
          <directionalLight position={[1, 1, 1]} intensity={0.5} />
          {/*<directionalLight position={[-1, 2, -5]} intensity={0.5} />*/}
          <Scene />
          {/*<Effects />*/}
        </Suspense>
      </ThreeCanvas>
    </CanvasContainer>
  )
}
