import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('the reading layout is opt-in and preserves specialised readers and directories', async () => {
  const layout = await readFile('src/layouts/ContentLayout.astro', 'utf8')
  const notes = await readFile('src/components/pages/NotesView.astro', 'utf8')
  assert.match(layout, /readingLayout = false/)
  assert.match(notes, /Boolean\(html\) && childNodes.length === 0 && !cs229ReaderConfig/)
  assert.match(notes, /meta=\{\{ title, description \}\}/)
  assert.match(notes, /!readingLayout && <p[^>]*>\{description\}/)
})

test('navigation and course resources are native collapsed details', async () => {
  const layout = await readFile('src/layouts/ContentLayout.astro', 'utf8')
  const guide = await readFile('src/components/pages/ProgrammingThoughtsSessionGuide.astro', 'utf8')
  assert.match(layout, /<details class='reader-navigation' data-reader-navigation>/)
  assert.match(layout, /aria-controls='sidebar'/)
  assert.match(layout, /event.key !== 'Escape'/)
  assert.match(guide, /<details\s+class='reader-course-guide[^>]*>/)
  assert.doesNotMatch(guide, /data-programming-thoughts-chapter=[^>]*\bopen/)
  assert.doesNotMatch(guide, /编程思想课程前后章节/)
})

test('chapter navigation is rendered after the article, without changing source URLs', async () => {
  const notes = await readFile('src/components/pages/NotesView.astro', 'utf8')
  const navigation = await readFile(
    'src/components/pages/ProgrammingThoughtsChapterNavigation.astro',
    'utf8'
  )
  assert.ok(
    notes.indexOf('<ProgrammingThoughtsChapterNavigation ') >
      notes.indexOf('<Fragment set:html={html}')
  )
  assert.match(navigation, /data-chapter-navigation/)
  assert.match(navigation, /previous\.slug/)
  assert.match(navigation, /next\.slug/)
  assert.match(navigation, /\/notes\/programming-thoughts\/course/)
})

test('text is constrained independently from figures, code and tables', async () => {
  const css = await readFile('src/assets/styles/reader.css', 'utf8')
  assert.match(css, /max-width: 45rem/)
  assert.match(css, /max-width: 55rem/)
  assert.match(css, /p:has\(> img\)/)
  assert.match(css, /font-size: 1\.125rem/)
  assert.match(css, /overflow-x: auto/)
  assert.match(css, /\.not-prose/)
})
