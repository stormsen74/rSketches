import {
  BufferGeometry,
  Color,
  DoubleSide,
  EllipseCurve,
  Euler,
  Line,
  LineBasicMaterial,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PlaneBufferGeometry,
  Vector3,
} from 'three'
import { useThree } from '@react-three/fiber'
import { mapRange } from '../../../utils/math'

// https://codepen.io/prisoner849/pen/vYBVddL

export default function Shell() {
  const { gl, scene, camera, size } = useThree()

  // profile
  var curve = new EllipseCurve(0, 0, 0.5, 0.5, 0, 2 * Math.PI, false, 0)
  var profilePoints = curve.getPoints(20)
  profilePoints = profilePoints.map(p => {
    return new Vector3().copy(p).setZ(0)
  })
  profilePoints.forEach(p => {
    p.applyEuler(new Euler(MathUtils.degToRad(90), 0, 0))
  })
  scene.add(new Line(new BufferGeometry().setFromPoints(profilePoints), new LineBasicMaterial({ color: 'red' })))

  // spiral
  var shellPoints = []
  var shellIndex = []

  var spiralPoints = []
  spiralPoints.push(new Vector3())
  var sResolution = 150
  var sTurns = 2
  var alpha = MathUtils.degToRad(80)
  var radiusVector = new Vector3(1, 0, 0)
  var axis = new Vector3(0, 0, 1)
  var euler = new Euler()
  for (let i = 0; i <= sResolution; i++) {
    const theta = mapRange(i, 0, sResolution, 0, Math.PI * 2 * sTurns)
    const rad = Math.exp(theta / Math.tan(alpha)) // cos / sin = cotangent = 1 / tan

    const theta2 = theta + Math.PI * 2
    const rad2 = Math.exp(theta2 / Math.tan(alpha))

    const midRad = (rad + rad2) * 0.5

    const scale = rad2 - rad

    const p = new Vector3().copy(radiusVector).multiplyScalar(rad).applyAxisAngle(axis, theta)
    spiralPoints.push(p)

    const c = new Vector3().copy(p).setLength(midRad)

    const segCurrent = i * profilePoints.length
    const segNext = (i + 1) * profilePoints.length

    profilePoints.forEach((p, idx) => {
      const pShell = new Vector3()
        .copy(p)
        .setX(p.x * scale)
        .setZ(p.z * scale * 1)
        .applyEuler(euler.set(0, 0, theta))
        .add(c)
      shellPoints.push(pShell)

      if (i < sResolution && idx < profilePoints.length - 1) {
        shellIndex.push(segCurrent + idx + 1, segCurrent + idx, segNext + idx)
        shellIndex.push(segCurrent + idx + 1, segNext + idx, segNext + idx + 1)
      }
    })
  }

  var spiralGeom = new BufferGeometry().setFromPoints(spiralPoints)
  var spiralMat = new LineBasicMaterial({ color: 'yellow' })
  var spiral = new Line(spiralGeom, spiralMat)
  scene.add(spiral)

  var shellGeom = new BufferGeometry().setFromPoints(shellPoints)
  shellGeom.setIndex(shellIndex)
  shellGeom.computeVertexNormals()
  var shellMat = new MeshStandardMaterial({
    flatShading: true,
    side: DoubleSide,
    // wireframe: true,
    roughness: 0.5,
  })

  const s = 0.2
  var shell = new Mesh(shellGeom, shellMat)
  shell.scale.set(s, s, s)
  shell.rotation.set(1.4, 0.6, 0)
  shell.castShadow = true
  scene.add(shell)

  // ground
  const planeGeom = new PlaneBufferGeometry(20, 20)
  const plane = new Mesh(
    planeGeom,
    new MeshStandardMaterial({
      color: new Color(0xffffff),
      side: DoubleSide,
      roughness: 0.5,
    })
  )
  plane.rotation.set(-Math.PI / 2, 0, 0)
  plane.position.set(0, -3.5, 0)
  plane.receiveShadow = true

  scene.add(plane)

  return null
}
