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
    'src/content/notes/programming-thoughts/course/change-cohesion-coupling-srp.md',
    'utf8'
  )
  const { metadata, body } = parseFrontmatter(source)
  const blocks = markdownToBlocks(normalizeNotionEmbeds(body))

  assert.match(metadata.title, /^P1–P4：/)
  assert.equal(blocks.filter((block) => block.type === 'image').length, 2)
  assert.equal(blocks.filter((block) => block.type === 'code').length, 3)
  assert.equal(blocks.find((block) => block.type === 'image').image.type, 'external')
})
