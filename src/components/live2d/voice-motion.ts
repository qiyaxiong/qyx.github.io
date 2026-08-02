export interface VoiceMotionTarget {
  setParameterValueById(id: string, value: number): void
}

export interface SpeechMotionFrame {
  timeSeconds: number
  energy: number
  speaking: boolean
}

interface MotionValues {
  headX: number
  headY: number
  headTilt: number
  bodyYaw: number
  bodyTilt: number
}

const neutralValues = (): MotionValues => ({
  headX: 0,
  headY: 0,
  headTilt: 0,
  bodyYaw: 0,
  bodyTilt: 0
})

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))

const damp = (current: number, target: number, rate: number, deltaSeconds: number) =>
  current + (target - current) * (1 - Math.exp(-rate * deltaSeconds))

export class SpeechMotionController {
  private lastTimeSeconds: number | undefined
  private activity = 0
  private values = neutralValues()
  private ownsParameters = false

  get settled(): boolean {
    return !this.ownsParameters
  }

  update(target: VoiceMotionTarget, frame: SpeechMotionFrame): void {
    if (frame.speaking) this.ownsParameters = true
    if (!this.ownsParameters) {
      this.lastTimeSeconds = undefined
      return
    }

    const deltaSeconds =
      this.lastTimeSeconds === undefined
        ? 1 / 60
        : clamp(frame.timeSeconds - this.lastTimeSeconds, 0, 0.05)
    this.lastTimeSeconds = frame.timeSeconds

    const activityTarget = frame.speaking ? 1 : 0
    const activityRate = frame.speaking ? 3.2 : 5.2
    this.activity = damp(this.activity, activityTarget, activityRate, deltaSeconds)

    const time = frame.timeSeconds
    const energy = clamp(frame.energy, 0, 1)
    const energyScale = 0.86 + energy * 0.18
    const bodyTiltTarget =
      this.activity *
      energyScale *
      (Math.sin(time * 0.74) * 2.25 +
        Math.sin(time * 0.31 + 1.2) * 1.05 +
        Math.sin(time * 0.13 + 0.4) * 0.55)
    const bodyYawTarget =
      this.activity * (Math.sin(time * 0.47 + 0.8) * 1.15 + Math.sin(time * 1.03 + 2.1) * 0.48)
    const headTiltTarget =
      this.activity *
      (bodyTiltTarget * 0.38 +
        Math.sin(time * 1.11 + 0.65) * 1.35 +
        Math.sin(time * 0.39 + 2.4) * 0.72 +
        energy * Math.sin(time * 2.35) * 0.38)
    const headXTarget =
      this.activity *
      (Math.sin(time * 0.61 + 1.7) * 1.8 +
        Math.sin(time * 0.23 + 0.2) * 0.85 +
        energy * Math.sin(time * 1.73 + 0.5) * 0.42)
    const headYTarget =
      this.activity * (Math.sin(time * 0.43 + 0.35) * 0.9 + Math.sin(time * 0.17 + 2.2) * 0.38)

    this.values.bodyTilt = damp(this.values.bodyTilt, bodyTiltTarget, 4.2, deltaSeconds)
    this.values.bodyYaw = damp(this.values.bodyYaw, bodyYawTarget, 3.8, deltaSeconds)
    this.values.headTilt = damp(this.values.headTilt, headTiltTarget, 5.1, deltaSeconds)
    this.values.headX = damp(this.values.headX, headXTarget, 4.6, deltaSeconds)
    this.values.headY = damp(this.values.headY, headYTarget, 4, deltaSeconds)

    if (!frame.speaking && this.isNearNeutral()) {
      this.activity = 0
      this.values = neutralValues()
      this.write(target)
      this.ownsParameters = false
      this.lastTimeSeconds = undefined
      return
    }

    this.write(target)
  }

  reset(target: VoiceMotionTarget): void {
    if (!this.ownsParameters) return
    this.lastTimeSeconds = undefined
    this.activity = 0
    this.values = neutralValues()
    this.write(target)
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
    target.setParameterValueById('ParamBodyAngleZ', this.values.bodyTilt)
  }
}
