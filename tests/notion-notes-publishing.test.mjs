import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  markdownToBlocks,
  normalizeNotionEmbeds,
  parseFrontmatter
} from '../src/scripts/publish-notion-markdown.mjs'

test('Notion note publishing preserves frontmatter body and creates native image blocks', async () => {
  const source = await readFile(
    'src/content/notes/programming-thoughts/course/programming-thoughts-introduction.md',
    'utf8'
  )
  const { metadata, body } = parseFrontmatter(source)
  const blocks = markdownToBlocks(normalizeNotionEmbeds(body))

  assert.equal(metadata.title, 'P1：编程思想：先控制变化，再选择模式')
  assert.equal(blocks.filter((block) => block.type === 'image').length, 1)
  assert.equal(blocks.filter((block) => block.type === 'code').length, 1)
  assert.equal(blocks.find((block) => block.type === 'image').image.type, 'external')
})
