import React, { useMemo } from 'react'
import { WEBGL } from 'three/examples/jsm/WebGL'
import { Canvas } from '@react-three/fiber'
import { Color } from 'three'
import styled from 'styled-components'

const CanvasWrapper = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  touch-action: none;
`

const defaultCamera = { fov: 75, near: 0.1, far: 1000, z: 5, position: [0, 0, 10] }

export default function ThreeCanvas({ camera, clearColor = '#000000', children }) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const gl2 = useMemo(() => {
    return WEBGL.isWebGL2Available()
  }, [])

  console.log('gl2', gl2, 'isMobile', isMobile)

  return (
    <CanvasWrapper onContextMenu={e => e.preventDefault()}>
      <Canvas
        linear
        dpr={Math.min(2, isMobile ? window.devicePixelRatio : 1)}
        resize={{ polyfill: ResizeObserver }}
        frameloop={'always'}
        webgl1={!gl2}
        shadows={false}
        camera={camera || defaultCamera}
        onCreated={({ gl }) => {
          gl.setClearColor(new Color(clearColor))
          // eslint-disable-next-line no-console
          console.log('created', gl)
        }}
      >
        {children}
      </Canvas>
    </CanvasWrapper>
  )
}
