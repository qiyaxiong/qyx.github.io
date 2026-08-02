export interface VoiceMotionTarget {
  setParameterValueById(id: string, value: number): void
}

export interface SpeechMotionFrame {
  timeSeconds: number
  energy: number
  speaking: boolean
  ambient?: boolean
}

interface MotionValues {
  headX: number
  headY: number
  headTilt: number
  bodyYaw: number
  bodyPitch: number
  bodyTilt: number
  bodyTiltSecondary: number
  bodyTiltTertiary: number
  breath: number
  eyeX: number
  eyeY: number
  mouthForm: number
}

const neutralValues = (): MotionValues => ({
  headX: 0,
  headY: 0,
  headTilt: 0,
  bodyYaw: 0,
  bodyPitch: 0,
  bodyTilt: 0,
  bodyTiltSecondary: 0,
  bodyTiltTertiary: 0,
  breath: 0,
  eyeX: 0,
  eyeY: 0,
  mouthForm: 0
})

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))

const damp = (current: number, target: number, rate: number, deltaSeconds: number) =>
  current + (target - current) * (1 - Math.exp(-rate * deltaSeconds))

const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed) * 43_758.5453
  return value - Math.floor(value)
}

export class SpeechMotionController {
  private lastTimeSeconds: number | undefined
  private activity = 0
  private values = neutralValues()
  private ownsParameters = false
  private energyBaseline = 0
  private emphasis = 0
  private emphasisDirection = 1
  private lastEmphasisAt = Number.NEGATIVE_INFINITY
  private gazeX = 0
  private gazeY = 0
  private nextGazeAt = 0
  private ownsMouthForm = false

  get settled(): boolean {
    return !this.ownsParameters || (this.activity <= 0.68 && this.emphasis < 0.025)
  }

  update(target: VoiceMotionTarget, frame: SpeechMotionFrame): void {
    const ambient = frame.ambient === true
    if (frame.speaking || ambient) this.ownsParameters = true
    if (frame.speaking) this.ownsMouthForm = true
    if (!this.ownsParameters) {
      this.lastTimeSeconds = undefined
      return
    }

    const deltaSeconds =
      this.lastTimeSeconds === undefined
        ? 1 / 60
        : clamp(frame.timeSeconds - this.lastTimeSeconds, 0, 0.05)
    this.lastTimeSeconds = frame.timeSeconds

    const activityTarget = frame.speaking ? 1 : ambient ? 0.62 : 0
    const activityRate = frame.speaking ? 3.2 : ambient ? 1.8 : 5.2
    this.activity = damp(this.activity, activityTarget, activityRate, deltaSeconds)

    const time = frame.timeSeconds
    const energy = clamp(frame.energy, 0, 1)
    if (time >= this.nextGazeAt) {
      this.gazeX = (pseudoRandom(time * 3.17 + 4.2) * 2 - 1) * 0.36
      this.gazeY = (pseudoRandom(time * 2.31 + 8.7) * 2 - 1) * 0.22
      const pause = frame.speaking ? 0.75 : 1.45
      const variation = frame.speaking ? 1.15 : 2.25
      this.nextGazeAt = time + pause + pseudoRandom(time * 1.73 + 2.4) * variation
    }
    this.energyBaseline = damp(this.energyBaseline, energy, frame.speaking ? 2.2 : 6, deltaSeconds)
    this.emphasis = damp(this.emphasis, 0, frame.speaking ? 2.4 : 7, deltaSeconds)
    const energySpike = clamp((energy - this.energyBaseline) * 1.8, 0, 1)
    if (
      frame.speaking &&
      this.activity > 0.65 &&
      energySpike > 0.42 &&
      time - this.lastEmphasisAt > 0.58
    ) {
      this.emphasis = 1
      this.emphasisDirection = Math.sin(time * 1.37 + 0.8) >= 0 ? 1 : -1
      this.lastEmphasisAt = time
    }

    const emphasis = this.emphasis * this.activity
    const ambientAccent =
      ambient && !frame.speaking ? Math.pow(Math.max(0, Math.sin(time * 0.51 + 1.1)), 6) : 0
    const ambientDirection = Math.sin(time * 0.17 + 2) >= 0 ? 1 : -1
    const energyScale = 0.92 + energy * 0.24
    const bodyTiltTarget =
      this.activity *
      energyScale *
        (Math.sin(time * 0.74) * 2.7 +
          Math.sin(time * 0.31 + 1.2) * 1.2 +
          Math.sin(time * 0.13 + 0.4) * 0.6) +
      emphasis * this.emphasisDirection * 2.6 +
      ambientAccent * ambientDirection * 1.2
    const bodyYawTarget =
      this.activity *
        (Math.sin(time * 0.47 + 0.8) * 1.45 + Math.sin(time * 1.03 + 2.1) * 0.58) -
      emphasis * this.emphasisDirection * 1.5 -
      ambientAccent * ambientDirection * 0.8
    const bodyPitchTarget =
      this.activity *
        (Math.sin(time * 0.52 + 1.4) * 0.85 + Math.sin(time * 0.19) * 0.38) +
      emphasis * 1.7 +
      ambientAccent * 0.5
    const headTiltTarget =
      this.activity *
        (bodyTiltTarget * 0.42 +
          Math.sin(time * 1.11 + 0.65) * 1.7 +
          Math.sin(time * 0.39 + 2.4) * 0.82 +
          energy * Math.sin(time * 2.35) * 0.52) +
      emphasis * this.emphasisDirection * 3.8 +
      ambientAccent * ambientDirection * 2.2
    const headXTarget =
      this.activity *
        (Math.sin(time * 0.61 + 1.7) * 2.25 +
          Math.sin(time * 0.23 + 0.2) * 1.05 +
          energy * Math.sin(time * 1.73 + 0.5) * 0.58) -
      emphasis * this.emphasisDirection * 2.2 -
      ambientAccent * ambientDirection * 1.4
    const headYTarget =
      this.activity *
        (Math.sin(time * 0.43 + 0.35) * 1.05 + Math.sin(time * 0.17 + 2.2) * 0.44) +
      emphasis * 1.25 +
      ambientAccent * 0.6
    const bodyTiltSecondaryTarget =
      bodyTiltTarget * 0.55 + emphasis * this.emphasisDirection * 1.1
    const bodyTiltTertiaryTarget =
      -bodyTiltTarget * 0.34 + emphasis * this.emphasisDirection * 0.75
    const breathTarget =
      this.activity * (0.48 + Math.sin(time * 1.65 + 0.4) * 0.26 + energy * 0.18)
    const eyeXTarget =
      this.activity * (this.gazeX - headXTarget * 0.025) +
      emphasis * this.emphasisDirection * 0.12
    const eyeYTarget = this.activity * this.gazeY + emphasis * 0.08
    const mouthFormTarget = frame.speaking ? this.activity * (0.04 + energy * 0.34) : 0

    this.values.bodyTilt = damp(this.values.bodyTilt, bodyTiltTarget, 4.2, deltaSeconds)
    this.values.bodyYaw = damp(this.values.bodyYaw, bodyYawTarget, 3.8, deltaSeconds)
    this.values.bodyPitch = damp(this.values.bodyPitch, bodyPitchTarget, 3.6, deltaSeconds)
    this.values.bodyTiltSecondary = damp(
      this.values.bodyTiltSecondary,
      bodyTiltSecondaryTarget,
      3.8,
      deltaSeconds
    )
    this.values.bodyTiltTertiary = damp(
      this.values.bodyTiltTertiary,
      bodyTiltTertiaryTarget,
      3.4,
      deltaSeconds
    )
    this.values.headTilt = damp(this.values.headTilt, headTiltTarget, 5.1, deltaSeconds)
    this.values.headX = damp(this.values.headX, headXTarget, 4.6, deltaSeconds)
    this.values.headY = damp(this.values.headY, headYTarget, 4, deltaSeconds)
    this.values.breath = damp(this.values.breath, breathTarget, 3, deltaSeconds)
    this.values.eyeX = damp(this.values.eyeX, eyeXTarget, 9, deltaSeconds)
    this.values.eyeY = damp(this.values.eyeY, eyeYTarget, 8, deltaSeconds)
    if (this.ownsMouthForm) {
      this.values.mouthForm = damp(this.values.mouthForm, mouthFormTarget, 8, deltaSeconds)
    }

    if (!frame.speaking && !ambient && this.isNearNeutral()) {
      this.activity = 0
      this.values = neutralValues()
      this.write(target)
      this.ownsMouthForm = false
      this.ownsParameters = false
      this.lastTimeSeconds = undefined
      return
    }

    this.write(target)
    if (!frame.speaking && this.ownsMouthForm && Math.abs(this.values.mouthForm) < 0.003) {
      this.values.mouthForm = 0
      target.setParameterValueById('ParamMouthForm', 0)
      this.ownsMouthForm = false
    }
  }

  reset(target: VoiceMotionTarget): void {
    if (!this.ownsParameters) return
    this.lastTimeSeconds = undefined
    this.activity = 0
    this.energyBaseline = 0
    this.emphasis = 0
    this.lastEmphasisAt = Number.NEGATIVE_INFINITY
    this.gazeX = 0
    this.gazeY = 0
    this.nextGazeAt = 0
    this.values = neutralValues()
    this.write(target)
    this.ownsMouthForm = false
    this.ownsParameters = false
  }

  private isNearNeutral(): boolean {
    return (
      this.activity < 0.002 &&
      Object.values(this.values).every((value) => Math.abs(value) < 0.02)
    )
  }

  private write(target: VoiceMotionTarget): void {
    target.setParameterValueById('ParamAngleX', this.values.headX)
    target.setParameterValueById('ParamAngleY', this.values.headY)
    target.setParameterValueById('ParamAngleZ', this.values.headTilt)
    target.setParameterValueById('ParamBodyAngleX', this.values.bodyYaw)
    target.setParameterValueById('ParamBodyAngleY', this.values.bodyPitch)
    target.setParameterValueById('ParamBodyAngleZ', this.values.bodyTilt)
    target.setParameterValueById('ParamBodyAngleZ2', this.values.bodyTiltSecondary)
    target.setParameterValueById('ParamBodyAngleZ3', this.values.bodyTiltTertiary)
    target.setParameterValueById('ParamBreath', this.values.breath)
    target.setParameterValueById('ParamEyeBallX', this.values.eyeX)
    target.setParameterValueById('ParamEyeBallY', this.values.eyeY)
    if (this.ownsMouthForm) {
      target.setParameterValueById('ParamMouthForm', this.values.mouthForm)
    }
  }
}
