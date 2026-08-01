import assert from 'node:assert/strict'
import test from 'node:test'

import { SpeechMotionController } from '../src/components/live2d/voice-motion.ts'

class ParameterTarget {
  readonly values = new Map<string, number>()

  setParameterValueById(id: string, value: number): void {
    this.values.set(id, value)
  }
}

test('speech motion stays smooth and bounded while avoiding a single pendulum rhythm', () => {
  const target = new ParameterTarget()
  const controller = new SpeechMotionController()
  const bodySamples: number[] = []
  let largestStep = 0
  let previousBodyTilt = 0

  for (let frame = 0; frame < 60 * 20; frame += 1) {
    controller.update(target, {
      timeSeconds: frame / 60,
      energy: 0.45,
      speaking: true
    })
    const bodyTilt = target.values.get('ParamBodyAngleZ') || 0
    largestStep = Math.max(largestStep, Math.abs(bodyTilt - previousBodyTilt))
    previousBodyTilt = bodyTilt
    if (frame % 60 === 0) bodySamples.push(bodyTilt)
  }

  assert.ok(largestStep < 0.2)
  assert.ok(Math.max(...bodySamples) - Math.min(...bodySamples) > 2)
  assert.ok(Math.max(...bodySamples.map(Math.abs)) < 5)
  assert.notEqual(bodySamples[0], bodySamples[8])
})

test('speech motion eases out and resets every controlled parameter', () => {
  const target = new ParameterTarget()
  const controller = new SpeechMotionController()

  for (let frame = 0; frame < 120; frame += 1) {
    controller.update(target, { timeSeconds: frame / 60, energy: 0.8, speaking: true })
  }
  for (let frame = 120; frame < 240; frame += 1) {
    controller.update(target, { timeSeconds: frame / 60, energy: 0, speaking: false })
  }

  assert.ok(Math.abs(target.values.get('ParamBodyAngleZ') || 0) < 0.25)
  controller.reset(target)

  for (const id of [
    'ParamAngleX',
    'ParamAngleY',
    'ParamAngleZ',
    'ParamBodyAngleX',
    'ParamBodyAngleZ'
  ]) {
    assert.equal(target.values.get(id), 0)
  }
})
