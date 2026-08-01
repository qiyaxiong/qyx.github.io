import assert from 'node:assert/strict'
import test from 'node:test'

import { applySpeechSway, resetSpeechSway } from '../src/components/live2d/voice-motion.ts'

class ParameterTarget {
  readonly values = new Map<string, number>()

  setParameterValueById(id: string, value: number): void {
    this.values.set(id, value)
  }
}

test('speech sway writes a bounded pose instead of accumulating every frame', () => {
  const target = new ParameterTarget()

  applySpeechSway(target, 1)
  const firstAngle = target.values.get('ParamAngleZ')
  const firstBodyAngle = target.values.get('ParamBodyAngleX')
  const firstBodyTilt = target.values.get('ParamBodyAngleZ')
  applySpeechSway(target, 1)

  assert.equal(target.values.get('ParamAngleZ'), firstAngle)
  assert.equal(target.values.get('ParamBodyAngleX'), firstBodyAngle)
  assert.equal(target.values.get('ParamBodyAngleZ'), firstBodyTilt)
  assert.ok(Math.abs(firstAngle || 0) <= 4)
  assert.ok(Math.abs(firstBodyAngle || 0) <= 2.5)
  assert.ok(Math.abs(firstBodyTilt || 0) <= 6)
})

test('speech sway returns to a neutral pose when playback stops', () => {
  const target = new ParameterTarget()

  applySpeechSway(target, 1)
  resetSpeechSway(target)

  assert.equal(target.values.get('ParamAngleZ'), 0)
  assert.equal(target.values.get('ParamBodyAngleX'), 0)
  assert.equal(target.values.get('ParamBodyAngleZ'), 0)
})
