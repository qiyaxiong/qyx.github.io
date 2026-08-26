export interface VADVector {
  valence: number
  arousal: number
  dominance: number
}

export interface PerformanceTarget {
  label: string
  vad: VADVector
  intensity: number
  confidence: number
  transition_ms: number
  hold_ms: number
  seed: number
  source_sequence: number
}

export interface PerformanceCue {
  expression?: string
  motion_group?: string
  motion_index?: number
  priority: number
  blend_in_ms: number
  hold_ms: number
  blend_out_ms: number
}

export interface ParameterBinding {
  id: string
  mode: 'add' | 'multiply' | 'overwrite'
  scale: number
  min: number
  max: number
}

export interface PerformanceProfile {
  schemaVersion: number
  modelFingerprint: string
  parameterMap: Record<string, ParameterBinding>
  nativeExpressionMap: Record<string, string>
  nativeMotionMap: Record<string, string>
  ownership: Record<string, string[]>
  smoothing: Record<string, number>
  motionStyle: Record<string, number>
  limits: Record<string, [number, number]>
  capabilities: string[]
}

export interface CubismParameterTarget {
  setParameterValueById(id: string, value: number): void
}

interface LayerValue {
  value: number
  priority: number
  weight: number
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))

const damp = (current: number, target: number, rate: number, delta: number) =>
  current + (target - current) * (1 - Math.exp(-rate * delta))

class SeededRandom {
  private state: number

  constructor(state: number) {
    this.state = state
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0
    let value = this.state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

class ParameterArbiter {
  private values = new Map<string, LayerValue>()

  offer(channel: string, value: number, priority: number, weight = 1): void {
    const current = this.values.get(channel)
    if (!current || priority > current.priority) {
      this.values.set(channel, { value, priority, weight })
    } else if (priority === current.priority) {
      const total = current.weight + weight
      current.value = (current.value * current.weight + value * weight) / total
      current.weight = total
    }
  }

  flush(
    target: CubismParameterTarget,
    profile: PerformanceProfile,
    ownedChannels: ReadonlySet<string>
  ): void {
    for (const [channel, candidate] of this.values) {
      if (ownedChannels.has(channel)) continue
      const binding = profile.parameterMap[channel]
      if (!binding) continue
      const limits = profile.limits[channel] || [binding.min, binding.max]
      const value = clamp(candidate.value * binding.scale, limits[0], limits[1])
      target.setParameterValueById(binding.id, value)
    }
    this.values.clear()
  }
}

class EmotionDynamics {
  current: VADVector = { valence: 0, arousal: -0.15, dominance: 0 }
  private target: VADVector = { ...this.current }
  private rate = 7

  setTarget(target: PerformanceTarget): void {
    this.target = target.vad
    this.rate = clamp(1000 / Math.max(80, target.transition_ms), 1.5, 14)
  }

  reset(): void {
    this.target = { valence: 0, arousal: -0.15, dominance: 0 }
  }

  update(delta: number): VADVector {
    this.current = {
      valence: damp(this.current.valence, this.target.valence, this.rate, delta),
      arousal: damp(this.current.arousal, this.target.arousal, this.rate, delta),
      dominance: damp(this.current.dominance, this.target.dominance, this.rate, delta)
    }
    return this.current
  }
}

class IdleController {
  private random = new SeededRandom(1)
  private nextGaze = 0
  private gazeX = 0
  private gazeY = 0
  private nextBlink = 1.5
  private blinkStarted = -1

  reseed(seed: number): void {
    this.random = new SeededRandom(seed || 1)
    this.nextGaze = 0
    this.nextBlink = 1.5 + this.random.next() * 2
  }

  update(time: number, reducedMotion: boolean, arbiter: ParameterArbiter): void {
    if (time >= this.nextGaze) {
      this.gazeX = (this.random.next() * 2 - 1) * (reducedMotion ? 0.12 : 0.34)
      this.gazeY = (this.random.next() * 2 - 1) * (reducedMotion ? 0.08 : 0.2)
      this.nextGaze = time + 1.2 + this.random.next() * 2.8
    }
    if (time >= this.nextBlink && this.blinkStarted < 0) this.blinkStarted = time
    let eyeOpen = 1
    if (this.blinkStarted >= 0) {
      const phase = (time - this.blinkStarted) / 0.16
      eyeOpen = phase < 0.5 ? 1 - phase * 2 : (phase - 0.5) * 2
      if (phase >= 1) {
        this.blinkStarted = -1
        this.nextBlink = time + 2 + this.random.next() * 4
        eyeOpen = 1
      }
    }
    arbiter.offer('gaze_x', this.gazeX, 10)
    arbiter.offer('gaze_y', this.gazeY, 10)
    arbiter.offer('eye_left_open', eyeOpen, 12)
    arbiter.offer('eye_right_open', eyeOpen, 12)
    arbiter.offer('breath', 0.5 + Math.sin(time * 1.7) * 0.32, 10)
    if (!reducedMotion) {
      arbiter.offer('head_x', Math.sin(time * 0.41) * 2.1, 10)
      arbiter.offer('head_tilt', Math.sin(time * 0.29 + 1.1) * 1.4, 10)
      arbiter.offer('body_tilt', Math.sin(time * 0.23 + 0.7) * 1.1, 10)
    }
  }
}

class FACSMapper {
  update(vad: VADVector, intensity: number, arbiter: ParameterArbiter): void {
    const positive = Math.max(0, vad.valence) * intensity
    const negative = Math.max(0, -vad.valence) * intensity
    const activation = Math.max(0, vad.arousal) * intensity
    const anger = negative * clamp(0.35 + activation * 0.9, 0, 1)
    const sadness = negative * (1 - clamp(activation * 0.75, 0, 0.8))
    const surprise = activation * (1 - negative * 0.55)

    arbiter.offer('mouth_form', positive - negative * 0.72, 30)
    arbiter.offer('eye_left_smile', positive * 0.9, 30)
    arbiter.offer('eye_right_smile', positive * 0.9, 30)
    arbiter.offer('cheek', positive * 0.5, 30)
    arbiter.offer('brow_left_y', positive * 0.12 + surprise * 0.28 - anger * 0.78 - sadness * 0.28, 30)
    arbiter.offer('brow_right_y', positive * 0.12 + surprise * 0.28 - anger * 0.78 - sadness * 0.28, 30)
    arbiter.offer('brow_left_form', sadness * 0.5 - anger * 0.88, 30)
    arbiter.offer('brow_right_form', sadness * 0.5 - anger * 0.88, 30)
    arbiter.offer('eye_left_open', 1 - anger * 0.38 - sadness * 0.16 + surprise * 0.2, 30)
    arbiter.offer('eye_right_open', 1 - anger * 0.38 - sadness * 0.16 + surprise * 0.2, 30)
    arbiter.offer('head_y', surprise * 3.6 - sadness * 2.2 - anger * 0.8, 30)
    arbiter.offer('head_tilt', sadness * 2.8 - anger * 1.8, 30)
    arbiter.offer('body_pitch', vad.dominance * intensity * 2.4 - sadness * 1.2, 30)
  }
}

class SpeechController {
  energy = 0
  speaking = false
  private baseline = 0
  private emphasis = 0

  update(time: number, delta: number, reducedMotion: boolean, arbiter: ParameterArbiter): void {
    const target = this.speaking ? clamp(this.energy, 0, 1) : 0
    this.baseline = damp(this.baseline, target, this.speaking ? 2.2 : 7, delta)
    const spike = Math.max(0, target - this.baseline)
    this.emphasis = damp(this.emphasis, spike > 0.2 ? 1 : 0, 6, delta)
    arbiter.offer('mouth_open', target, 70)
    if (this.speaking) arbiter.offer('mouth_form', 0.08 + target * 0.25, 60)
    if (this.speaking && !reducedMotion) {
      arbiter.offer('head_tilt', Math.sin(time * 1.3) * 1.8 + this.emphasis * 3.2, 50)
      arbiter.offer('head_x', Math.sin(time * 0.73) * 2.2, 50)
      arbiter.offer('body_tilt', Math.sin(time * 0.55) * 1.5, 50)
    }
  }
}

export interface RuntimeFrame {
  timeSeconds: number
  energy: number
  speaking: boolean
  reducedMotion: boolean
}

export class PerformanceRuntime {
  private arbiter = new ParameterArbiter()
  private dynamics = new EmotionDynamics()
  private facs = new FACSMapper()
  private idle = new IdleController()
  private speech = new SpeechController()
  private lastTime: number | undefined
  private intensity = 0
  private profile?: PerformanceProfile
  private suspended = false
  private cueOwnership = new Set<string>()
  private cueExpiresAt = 0

  setProfile(profile: PerformanceProfile, expectedFingerprint: string): void {
    if (profile.schemaVersion !== 1 || profile.modelFingerprint !== expectedFingerprint) {
      throw new Error('Live2D performance profile is incompatible with this model')
    }
    this.profile = profile
  }

  setTarget(target: PerformanceTarget): void {
    this.dynamics.setTarget(target)
    this.intensity = target.intensity
    this.idle.reseed(target.seed)
  }

  reset(): void {
    this.dynamics.reset()
    this.intensity = 0
  }

  setCue(cue: PerformanceCue, nowSeconds = performance.now() / 1000): void {
    if (!this.profile) return
    const keys = [
      cue.expression ? `expression:${cue.expression}` : undefined,
      cue.motion_group ? `motion:${cue.motion_group}` : undefined
    ].filter((value): value is string => Boolean(value))
    const configured = keys.flatMap((key) => this.profile?.ownership[key] || [])
    this.cueOwnership = new Set(
      configured.length ? configured : Object.keys(this.profile.parameterMap)
    )
    this.cueExpiresAt =
      nowSeconds + Math.max(0, cue.blend_in_ms + cue.hold_ms + cue.blend_out_ms) / 1000
  }

  suspend(value: boolean): void {
    this.suspended = value
    this.lastTime = undefined
  }

  update(target: CubismParameterTarget, frame: RuntimeFrame): void {
    if (this.suspended || !this.profile) return
    const delta = this.lastTime === undefined ? 1 / 60 : clamp(frame.timeSeconds - this.lastTime, 0, 0.05)
    this.lastTime = frame.timeSeconds
    const vad = this.dynamics.update(delta)
    this.idle.update(frame.timeSeconds, frame.reducedMotion, this.arbiter)
    this.facs.update(vad, this.intensity, this.arbiter)
    this.speech.energy = frame.energy
    this.speech.speaking = frame.speaking
    this.speech.update(frame.timeSeconds, delta, frame.reducedMotion, this.arbiter)
    if (frame.timeSeconds >= this.cueExpiresAt) this.cueOwnership.clear()
    this.arbiter.flush(target, this.profile, this.cueOwnership)
  }
}
