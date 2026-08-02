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

  assert.equal(controller.settled, true)

  for (const id of [
    'ParamAngleX',
    'ParamAngleY',
    'ParamAngleZ',
    'ParamBodyAngleX',
    'ParamBodyAngleY',
    'ParamBodyAngleZ',
    'ParamBodyAngleZ2',
    'ParamBodyAngleZ3',
    'ParamBreath',
    'ParamEyeBallX',
    'ParamEyeBallY',
    'ParamMouthForm'
  ]) {
    assert.equal(target.values.get(id), 0)
  }
})

test('an inactive controller leaves the model idle motion parameters untouched', () => {
  const target = new ParameterTarget()
  const controller = new SpeechMotionController()
  target.values.set('ParamAngleX', 7)
  target.values.set('ParamBodyAngleZ', -3)

  controller.update(target, { timeSeconds: 1, energy: 0, speaking: false })

  assert.equal(target.values.get('ParamAngleX'), 7)
  assert.equal(target.values.get('ParamBodyAngleZ'), -3)
})

test('speech energy creates a visible emphasis pose instead of only changing the mouth', () => {
  const target = new ParameterTarget()
  const controller = new SpeechMotionController()

  for (let frame = 0; frame < 180; frame += 1) {
    controller.update(target, { timeSeconds: frame / 60, energy: 0.12, speaking: true })
  }

  const before = {
    headX: target.values.get('ParamAngleX') || 0,
    headTilt: target.values.get('ParamAngleZ') || 0,
    bodyTilt: target.values.get('ParamBodyAngleZ') || 0
  }
  let largestPoseChange = 0

  for (let frame = 180; frame < 198; frame += 1) {
    controller.update(target, { timeSeconds: frame / 60, energy: 0.95, speaking: true })
    largestPoseChange = Math.max(
      largestPoseChange,
      Math.abs((target.values.get('ParamAngleX') || 0) - before.headX) +
        Math.abs((target.values.get('ParamAngleZ') || 0) - before.headTilt) +
        Math.abs((target.values.get('ParamBodyAngleZ') || 0) - before.bodyTilt)
    )
  }

  assert.ok(largestPoseChange > 2.4)
})

test('ambient mode keeps the character breathing and shifting weight between replies', () => {
  const target = new ParameterTarget()
  const controller = new SpeechMotionController()
  const bodySamples: number[] = []
  const breathSamples: number[] = []

  for (let frame = 0; frame < 60 * 12; frame += 1) {
    controller.update(target, {
      timeSeconds: frame / 60,
      energy: 0,
      speaking: false,
      ambient: true
    })
    if (frame % 30 === 0) {
      bodySamples.push(target.values.get('ParamBodyAngleZ') || 0)
      breathSamples.push(target.values.get('ParamBreath') || 0)
    }
  }

  assert.ok(Math.max(...bodySamples) - Math.min(...bodySamples) > 1.2)
  assert.ok(Math.max(...breathSamples) - Math.min(...breathSamples) > 0.12)
})

test('ambient gaze uses smooth micro-saccades instead of a continuous mechanical sweep', () => {
  const target = new ParameterTarget()
  const controller = new SpeechMotionController()
  let previous = 0
  let largestStep = 0
  let stillFrames = 0
  let transitionBursts = 0
  let moving = false

  for (let frame = 0; frame < 60 * 12; frame += 1) {
    controller.update(target, {
      timeSeconds: frame / 60,
      energy: 0,
      speaking: false,
      ambient: true
    })
    const current = target.values.get('ParamEyeBallX') || 0
    const step = Math.abs(current - previous)
    largestStep = Math.max(largestStep, step)
    if (step < 0.001) stillFrames += 1
    if (step > 0.006 && !moving) {
      transitionBursts += 1
      moving = true
    } else if (step < 0.001) {
      moving = false
    }
    previous = current
  }

  assert.ok(largestStep > 0.01)
  assert.ok(largestStep < 0.08)
  assert.ok(stillFrames > 120)
  assert.ok(transitionBursts >= 3)
})

test('speech energy changes the mouth shape as well as opening the jaw', () => {
  const target = new ParameterTarget()
  const controller = new SpeechMotionController()

  for (let frame = 0; frame < 90; frame += 1) {
    controller.update(target, { timeSeconds: frame / 60, energy: 0.08, speaking: true })
  }
  const quietShape = target.values.get('ParamMouthForm') || 0

  for (let frame = 90; frame < 120; frame += 1) {
    controller.update(target, { timeSeconds: frame / 60, energy: 0.92, speaking: true })
  }
  const energeticShape = target.values.get('ParamMouthForm') || 0

  assert.ok(energeticShape - quietShape > 0.12)
})

test('ambient motion leaves an authored neutral mouth shape untouched', () => {
  const target = new ParameterTarget()
  const controller = new SpeechMotionController()
  target.values.set('ParamMouthForm', -0.4)

  for (let frame = 0; frame < 120; frame += 1) {
    controller.update(target, {
      timeSeconds: frame / 60,
      energy: 0,
      speaking: false,
      ambient: true
    })
  }

  assert.equal(target.values.get('ParamMouthForm'), -0.4)
})
