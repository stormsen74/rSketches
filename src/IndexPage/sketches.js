import SketchParticlesSetup from '../sketches/p5/ParticlesSetup'
import ThreeFiberSetup from '../sketches/r3f/ThreeFiberSetup'
import SketchWaveform from '../sketches/p5/waveform/SketchWaveform'
import SketchField from '../sketches/p5/CoulombField'
import SketchEquationsRK from '../sketches/p5/EquationsRK'
import SketchNoiseField from '../sketches/p5/NoiseField'
import SketchNoiseFieldImage from '../sketches/p5/NoiseFieldImage'
import ProceduralGeomSketch from '../sketches/r3f/ProceduralGeom'
import Platonics from '../sketches/r3f/Platonics'
import DroneSteeringApproach from '../sketches/r3f/DroneSteeringApproach'
import DroneHeightMap from '../sketches/r3f/DroneHeightMap'
import DroneVehicle from '../sketches/r3f/DroneVehicle'
import SketchSpirals from '../sketches/p5/Spirals'
import TextureProjection from '../sketches/r3f/TextureProjection'
import CurveAnimation from '../sketches/r3f/CurveAnimation'

export const sketchTypes = {
  p5: 'p5',
  r3f: 'r3f',
}

export const sketches = [
  {
    type: sketchTypes.p5,
    title: 'Setup-Particles',
    description: '... description',
    route: '/SketchParticles',
    component: SketchParticlesSetup,
  },
  {
    type: sketchTypes.p5,
    title: 'Coulomb-Field',
    description: '... description',
    route: '/SketchField',
    component: SketchField,
  },
  {
    type: sketchTypes.p5,
    title: 'Equations-RK',
    description: '... description',
    route: '/EquationsRK',
    component: SketchEquationsRK,
  },
  {
    type: sketchTypes.p5,
    title: 'Noise-Field',
    description: '... description',
    route: '/NoiseField',
    component: SketchNoiseField,
  },
  {
    type: sketchTypes.p5,
    title: 'Noise-Field-Image',
    description: '... description',
    route: '/NoiseFieldImage',
    component: SketchNoiseFieldImage,
  },
  {
    type: sketchTypes.p5,
    title: 'Waveform Test',
    description: '... description',
    route: '/SketchWaveform',
    component: SketchWaveform,
  },
  {
    type: sketchTypes.r3f,
    title: 'ThreeFiberSetup',
    description: '... description',
    route: '/ThreeFiberSetup',
    component: ThreeFiberSetup,
  },

  {
    type: sketchTypes.r3f,
    title: 'Procedural',
    description: '... description',
    route: '/Procedural',
    component: ProceduralGeomSketch,
  },
  {
    type: sketchTypes.r3f,
    title: 'Platonics',
    description: '... description',
    route: '/Platonics',
    component: Platonics,
  },
  {
    type: sketchTypes.r3f,
    title: 'Drone-Steering(cannon-es)',
    description: '... description',
    route: '/Drone-Approach',
    component: DroneSteeringApproach,
  },
  {
    type: sketchTypes.r3f,
    title: 'Drone-Steering(cannon-es) + HeightMap',
    description: '... description',
    route: '/DroneHeightMap',
    component: DroneHeightMap,
  },
  {
    type: sketchTypes.r3f,
    title: 'Drone-Vehicle',
    description: '... description',
    route: '/DroneVehicle',
    component: DroneVehicle,
  },
  {
    type: sketchTypes.p5,
    title: 'Spirals',
    description: '... description',
    route: '/Spirals',
    component: SketchSpirals,
  },
  {
    type: sketchTypes.r3f,
    title: 'TextureProjection',
    description: '... description',
    route: '/TextureProjection',
    component: TextureProjection,
  },
  {
    type: sketchTypes.r3f,
    title: 'CurveAnimation',
    description: '... description',
    route: '/CurveAnimation',
    component: CurveAnimation,
  },
]
