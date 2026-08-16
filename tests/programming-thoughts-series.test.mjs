import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

import { programmingThoughtsSessions } from '../src/utils/programming-thoughts-sessions.ts'

const root = process.cwd()

test('the course maps exactly 46 unique Bilibili pages', () => {
  assert.equal(programmingThoughtsSessions.length, 46)
  assert.deepEqual(
    programmingThoughtsSessions.map((session) => session.page),
    Array.from({ length: 46 }, (_, index) => index + 1)
  )
  assert.equal(new Set(programmingThoughtsSessions.map((session) => session.cid)).size, 46)
  assert.equal(new Set(programmingThoughtsSessions.map((session) => session.slug)).size, 46)
})

test('every session has an article, diagram, source metadata and lesson structure', async () => {
  for (const session of programmingThoughtsSessions) {
    const articlePath = path.join(
      root,
      'src/content/notes/programming-thoughts/course',
      `${session.slug}.md`
    )
    const diagramName = `p${String(session.page).padStart(2, '0')}-${session.slug}.svg`
    const diagramPath = path.join(
      root,
      'public/images/notes/programming-thoughts/diagrams',
      diagramName
    )
    const [article, diagram] = await Promise.all([
      readFile(articlePath, 'utf8'),
      readFile(diagramPath, 'utf8')
    ])

    assert.match(article, new RegExp(`title: P${session.page}：`))
    assert.match(article, new RegExp(`/diagrams/${diagramName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
    assert.match(article, /## 最小代码例子/)
    assert.match(article, /## 什么时候值得使用/)
    assert.match(article, /## 什么时候先不要用/)
    assert.match(article, /## 动手练习/)
    assert.match(article, /```python/)
    assert.doesNotMatch(article, /```(?:ts|typescript|java|javascript)/)
    assert.match(diagram, new RegExp(`PROGRAMMING THOUGHT · P${session.page}`))
    assert.match(diagram, /看见问题/)
    assert.match(diagram, /换成 Python 结构/)
    assert.match(diagram, /得到什么/)
  }
})
