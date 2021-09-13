import WaveformData from 'waveform-data'
import track from './02-the_black_keys-in_time_track.json'

export default function WF(p) {
  const animate = false
  let waveform = null
  let channel = null
  let t = 0

  const drawWave = () => {
    for (let x = 0; x < waveform.length; x++) {
      const val = channel.max_sample(x)
      p.stroke('white')
      p.line(x, 200, x, 200 - val)

      if (x % 187.5 < 1) {
        p.stroke('purple')
        p.line(x, 300, x, 200 - 100)
      }
    }
  }
  p.setup = () => {
    waveform = WaveformData.create(track)
    channel = waveform.channel(0)

    p.createCanvas(0, 0, p.P2D)
    p.frameRate(60)
    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.strokeWeight(1)
    onResize()

    if (!animate) drawWave()
  }

  const onResize = () => {
    p.clear()
    p.resizeCanvas(p.windowWidth, p.windowHeight)
    if (!animate) drawWave()
  }

  p.windowResized = () => {
    onResize()
  }

  p.draw = () => {
    if (!animate) return
    p.background('#000')
    t += p.deltaTime / 1000
    const tp = t * 187.5
    const value = channel.max_sample(Math.round(tp))
    const mappedValue = p.map(value, 0, 50, 50, 100)
    p.circle(p.windowWidth / 2, p.windowHeight / 2, mappedValue)
  }

  p.remove = () => {}
}
