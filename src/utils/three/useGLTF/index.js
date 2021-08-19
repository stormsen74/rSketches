import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { useLoader } from '@react-three/fiber'

function extensions(useDraco, useMeshopt) {
  return loader => {
    if (useDraco) {
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath(typeof useDraco === 'string' ? useDraco : 'https://www.gstatic.com/draco/v1/decoders/')
      loader.setDRACOLoader(dracoLoader)
    }
    if (useMeshopt) {
      loader.setMeshoptDecoder(MeshoptDecoder)
    }
  }
}

export function useGLTF(path, useDraco = true, useMeshOpt = true) {
  return useLoader(GLTFLoader, path, extensions(useDraco, useMeshOpt))
}

useGLTF.preload = (path, useDraco = true, useMeshOpt = true) =>
  useLoader.preload(GLTFLoader, path, extensions(useDraco, useMeshOpt))
