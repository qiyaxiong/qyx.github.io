import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import test from 'node:test'

import {
  getProgrammingThoughtsChapterSessions,
  programmingThoughtsChapters,
  programmingThoughtsSessions
} from '../src/utils/programming-thoughts-sessions.ts'
import { getChapterProgram } from '../src/scripts/programming-thoughts-chapter-samples.mjs'
import { programmingThoughtsLegacySlugs, programmingThoughtsRedirects } from '../src/utils/programming-thoughts-redirects.mjs'
import { getProgrammingThoughtsUmlSpec, programmingThoughtsUmlSpecs } from '../src/scripts/programming-thoughts-uml-specs.mjs'

const root = process.cwd()
const courseDir = path.join(root, 'src/content/notes/programming-thoughts/course')

test('46 video pages are covered exactly once by 15 progressive chapters', () => {
  assert.equal(programmingThoughtsSessions.length, 46)
  assert.equal(programmingThoughtsChapters.length, 15)
  const covered = programmingThoughtsChapters.flatMap((chapter) =>
    getProgrammingThoughtsChapterSessions(chapter).map((session) => session.page)
  )
  assert.deepEqual(covered, Array.from({ length: 46 }, (_, index) => index + 1))
  assert.equal(new Set(programmingThoughtsChapters.map((chapter) => chapter.slug)).size, 15)
})

test('course directory contains only the index and 15 thematic articles', async () => {
  const markdownFiles = (await readdir(courseDir)).filter((name) => name.endsWith('.md')).sort()
  assert.equal(markdownFiles.length, 16)
  assert.deepEqual(
    markdownFiles,
    ['index.md', ...programmingThoughtsChapters.map((chapter) => `${chapter.slug}.md`)].sort()
  )
})

test('every chapter follows a progressive explanation and keeps source mappings', async () => {
  for (const chapter of programmingThoughtsChapters) {
    const article = await readFile(path.join(courseDir, `${chapter.slug}.md`), 'utf8')
    const sessions = getProgrammingThoughtsChapterSessions(chapter)
    assert.match(article, new RegExp(`title: P${chapter.startPage}–P${chapter.endPage}：`))
    assert.match(article, /## 先看完整推导路线/)
    assert.match(article, /## 起点：先写最直接、能工作的版本/)
    assert.match(article, /轮需求：先解决问题，最后再叫它/)
    assert.match(article, /### 这一轮只做一个设计动作/)
    assert.match(article, /## 演进完成后的 Python 实现/)
    assert.match(article, /## 用真实业务结果验证/)
    assert.match(article, /## 容易走偏的地方/)
    assert.match(article, /## 练习：把视频推导重新走一遍/)
    assert.ok(article.length >= 4500, `${chapter.slug} is too short: ${article.length}`)
    assert.equal((article.match(/```python/g) || []).length, 3)
    assert.equal((article.match(/\/diagrams\//g) || []).length, 3)
    assert.match(article, new RegExp(`chapter-${chapter.slug}-uml\\.svg`))
    for (const session of sessions) assert.match(article, new RegExp(`P${session.page}(?:\\D|$)`))
  }
})

test('every chapter keeps an editable Excalidraw UML source and SVG export', async () => {
  assert.equal(Object.keys(programmingThoughtsUmlSpecs).length, 15)
  for (const chapter of programmingThoughtsChapters) {
    const [sourceText, svg] = await Promise.all([
      readFile(path.join(root, 'docs/diagrams/programming-thoughts', `${chapter.slug}.excalidraw`), 'utf8'),
      readFile(path.join(root, 'public/images/notes/programming-thoughts/diagrams', `chapter-${chapter.slug}-uml.svg`), 'utf8')
    ])
    const source = JSON.parse(sourceText)
    const spec = getProgrammingThoughtsUmlSpec(chapter.slug)
    assert.equal(source.type, 'excalidraw')
    assert.equal(source.version, 2)
    assert.ok(source.elements.length >= spec.nodes.length * 2 + spec.edges.length)
    for (const node of spec.nodes) {
      const shape = source.elements.find((element) => element.id === node[0])
      const text = source.elements.find((element) => element.id === `${node[0]}-text`)
      assert.equal(shape.type, 'rectangle')
      assert.equal(text.containerId, node[0])
      assert.ok(shape.boundElements.some((binding) => binding.id === text.id))
      assert.match(svg, new RegExp(node[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    }
    assert.match(svg, new RegExp(spec.kind))
  }
})

test('every chapter final implementation and business test execute in Python', () => {
  for (const chapter of programmingThoughtsChapters) {
    const result = spawnSync('python3', ['-c', getChapterProgram(chapter.slug)], { encoding: 'utf8' })
    assert.equal(result.status, 0, `${chapter.slug}: ${result.stderr || result.stdout}`)
  }
})

test('every retired lesson route redirects to exactly one merged chapter', () => {
  assert.equal(programmingThoughtsLegacySlugs.length, 46)
  assert.equal(Object.keys(programmingThoughtsRedirects).length, 46)
  for (const session of programmingThoughtsSessions) {
    const oldPath = `/notes/programming-thoughts/course/${session.slug}`
    assert.match(programmingThoughtsRedirects[oldPath], /^\/notes\/programming-thoughts\/course\//)
  }
})

test('all 46 source diagrams remain reproducible', async () => {
  for (const session of programmingThoughtsSessions) {
    const diagramName = `p${String(session.page).padStart(2, '0')}-${session.slug}.svg`
    const diagram = await readFile(path.join(root, 'public/images/notes/programming-thoughts/diagrams', diagramName), 'utf8')
    assert.match(diagram, new RegExp(`PROGRAMMING THOUGHT · P${session.page}`))
  }
})
