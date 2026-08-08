import assert from 'node:assert/strict'
import test from 'node:test'

import { SpeechSegmenter } from '../src/components/live2d/speech-segments.ts'

test('segments reply deltas at sentence boundaries without repeating completed text', () => {
  const segmenter = new SpeechSegmenter()

  assert.deepEqual(segmenter.push('你好，我是绘梦。接下来'), ['你好，我是绘梦。'])
  assert.deepEqual(segmenter.push('继续介绍！'), ['接下来继续介绍！'])
  assert.deepEqual(segmenter.finish('你好，我是绘梦。接下来继续介绍！'), [])
})

test('keeps comma-delimited phrases in one request', () => {
  const segmenter = new SpeechSegmenter()

  assert.deepEqual(segmenter.push('先介绍实现思路，然后继续。'), ['先介绍实现思路，然后继续。'])
})

test('bounds latency for replies without punctuation', () => {
  const segmenter = new SpeechSegmenter(120)
  const text = '好'.repeat(121)

  assert.deepEqual(segmenter.push(text), ['好'.repeat(120)])
  assert.deepEqual(segmenter.finish(text), ['好'])
})

test('rejects an invalid segment length instead of entering a non-progressing loop', () => {
  assert.throws(() => new SpeechSegmenter(0), RangeError)
})

test('never splits an emoji surrogate pair at the maximum length', () => {
  const segmenter = new SpeechSegmenter(2)

  assert.deepEqual(segmenter.push('好😀呀'), ['好😀'])
  assert.deepEqual(segmenter.finish(), ['呀'])
})

test('does not send emoji-only or punctuation-only segments to TTS', () => {
  const segmenter = new SpeechSegmenter()

  assert.deepEqual(segmenter.push('回答到这里。😉\n继续回答！✨'), ['回答到这里。', '继续回答！'])
  assert.deepEqual(segmenter.finish(), [])
})
