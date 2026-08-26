import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PerformanceRuntime,
  type PerformanceProfile,
  type PerformanceTarget
} from '../src/components/live2d/performance-runtime.ts'

class ParameterTarget {
  readonly values = new Map<string, number>()
  setParameterValueById(id: string, value: number): void { this.values.set(id, value) }
}

const channels: Record<string, string> = {
  head_x: 'ParamAngleX', head_y: 'ParamAngleY', head_tilt: 'ParamAngleZ',
  body_pitch: 'ParamBodyAngleY', body_tilt: 'ParamBodyAngleZ', breath: 'ParamBreath',
  gaze_x: 'ParamEyeBallX', gaze_y: 'ParamEyeBallY', eye_left_open: 'ParamEyeLOpen',
  eye_right_open: 'ParamEyeROpen', eye_left_smile: 'ParamEyeLSmile',
  eye_right_smile: 'ParamEyeRSmile', brow_left_y: 'ParamBrowLY',
  brow_right_y: 'ParamBrowRY', brow_left_form: 'ParamBrowLForm',
  brow_right_form: 'ParamBrowRForm', cheek: 'ParamCheek',
  mouth_open: 'ParamMouthOpenY', mouth_form: 'ParamMouthForm'
}
const profile: PerformanceProfile = {
  schemaVersion: 1,
  modelFingerprint: '1234567890abcdef',
  parameterMap: Object.fromEntries(Object.entries(channels).map(([key, id]) => [key, { id, mode: 'add', scale: 1, min: -30, max: 30 }])),
  nativeExpressionMap: {}, nativeMotionMap: {}, ownership: {}, smoothing: {}, motionStyle: {}, limits: {}, capabilities: Object.keys(channels)
}
const target: PerformanceTarget = {
  label: 'happy', vad: { valence: 0.8, arousal: 0.6, dominance: 0.3 }, intensity: 0.8,
  confidence: 1, transition_ms: 420, hold_ms: 1600, seed: 42, source_sequence: 1
}

function configured(): PerformanceRuntime {
  const runtime = new PerformanceRuntime()
  runtime.setProfile(profile, profile.modelFingerprint)
  runtime.setTarget(target)
  return runtime
}

test('performance runtime rejects a mismatched model profile', () => {
  const runtime = new PerformanceRuntime()
  assert.throws(() => runtime.setProfile(profile, 'different'), /incompatible/)
})

test('VAD target converges smoothly and stays within profile limits', () => {
  const runtime = configured()
  const model = new ParameterTarget()
  let previous = 0
  let largestStep = 0
  for (let frame = 0; frame < 240; frame += 1) {
    runtime.update(model, { timeSeconds: frame / 60, energy: 0, speaking: false, reducedMotion: false })
    const value = model.values.get('ParamMouthForm') || 0
    largestStep = Math.max(largestStep, Math.abs(value - previous)); previous = value
  }
  assert.ok(previous > 0.3)
  assert.ok(largestStep < 0.2)
  assert.ok([...model.values.values()].every((value) => value >= -30 && value <= 30))
})

test('positive and angry targets produce distinct brows, eyes, cheeks and mouth shapes', () => {
  const happy = configured(); const happyModel = new ParameterTarget()
  const angry = new PerformanceRuntime(); const angryModel = new ParameterTarget()
  angry.setProfile(profile, profile.modelFingerprint)
  angry.setTarget({ ...target, label: 'angry', vad: { valence: -0.9, arousal: 0.85, dominance: 0.55 } })
  for (let frame = 0; frame < 180; frame += 1) {
    const input = { timeSeconds: frame / 60, energy: 0, speaking: false, reducedMotion: false }
    happy.update(happyModel, input); angry.update(angryModel, input)
  }
  assert.ok((happyModel.values.get('ParamMouthForm') || 0) > 0.5)
  assert.ok((happyModel.values.get('ParamEyeLSmile') || 0) > 0.4)
  assert.ok((happyModel.values.get('ParamCheek') || 0) > 0.2)
  assert.ok((angryModel.values.get('ParamMouthForm') || 0) < -0.4)
  assert.ok((angryModel.values.get('ParamBrowLY') || 0) < -0.4)
  assert.ok((angryModel.values.get('ParamBrowLForm') || 0) < -0.4)
})

test('seeded idle motion is deterministic', () => {
  const first = configured(); const second = configured()
  const a = new ParameterTarget(); const b = new ParameterTarget()
  for (let frame = 0; frame < 300; frame += 1) {
    const input = { timeSeconds: frame / 60, energy: 0, speaking: false, reducedMotion: false }
    first.update(a, input); second.update(b, input)
  }
  assert.deepEqual(a.values, b.values)
})

test('speech energy owns mouth opening and adds a visible pose', () => {
  const runtime = configured(); const model = new ParameterTarget()
  for (let frame = 0; frame < 180; frame += 1) runtime.update(model, { timeSeconds: frame / 60, energy: 0.85, speaking: true, reducedMotion: false })
  assert.ok((model.values.get('ParamMouthOpenY') || 0) > 0.8)
  assert.ok(Math.abs(model.values.get('ParamAngleZ') || 0) > 0.2)
})

test('reduced motion preserves lip sync while reducing body movement', () => {
  const runtime = configured(); const model = new ParameterTarget()
  for (let frame = 0; frame < 120; frame += 1) runtime.update(model, { timeSeconds: frame / 60, energy: 0.7, speaking: true, reducedMotion: true })
  assert.ok((model.values.get('ParamMouthOpenY') || 0) > 0.6)
  assert.ok(Math.abs(model.values.get('ParamBodyAngleZ') || 0) < 0.1)
})

test('native cues own parameters until their blend and hold window expires', () => {
  const runtime = configured(); const model = new ParameterTarget()
  runtime.setCue({ expression: 'happy', priority: 90, blend_in_ms: 0, hold_ms: 100, blend_out_ms: 0 }, 0)
  runtime.update(model, { timeSeconds: 0.05, energy: 0, speaking: false, reducedMotion: false })
  assert.equal(model.values.size, 0)
  runtime.update(model, { timeSeconds: 0.2, energy: 0, speaking: false, reducedMotion: false })
  assert.ok(model.values.size > 0)
})
