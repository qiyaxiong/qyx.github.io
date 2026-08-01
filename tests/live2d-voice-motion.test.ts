import assert from 'node:assert/strict'
import test from 'node:test'

import {
  applyAvatarSway,
  applySpeechSway,
  resetAvatarSway,
  resetSpeechSway
} from '../src/components/live2d/voice-motion.ts'

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
  applySpeechSway(target, 1)

  assert.equal(target.values.get('ParamAngleZ'), firstAngle)
  assert.equal(target.values.get('ParamBodyAngleX'), firstBodyAngle)
  assert.ok(Math.abs(firstAngle || 0) <= 6)
  assert.ok(Math.abs(firstBodyAngle || 0) <= 4)
})

test('avatar sway visibly moves the whole body around its center without accumulating', () => {
  const avatar = { position: { x: 100 }, rotation: 0 }
  const elapsed = Math.PI / (2 * 1.7)

  applyAvatarSway(avatar, 100, elapsed)
  assert.equal(avatar.position.x, 110)
  assert.ok(Math.abs(avatar.rotation) > 0.01)

  applyAvatarSway(avatar, 100, elapsed)
  assert.equal(avatar.position.x, 110)

  resetAvatarSway(avatar, 100)
  assert.deepEqual(avatar, { position: { x: 100 }, rotation: 0 })
})

test('speech sway returns to a neutral pose when playback stops', () => {
  const target = new ParameterTarget()

  applySpeechSway(target, 1)
  resetSpeechSway(target)

  assert.equal(target.values.get('ParamAngleZ'), 0)
  assert.equal(target.values.get('ParamBodyAngleX'), 0)
})
