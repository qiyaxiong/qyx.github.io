import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  markdownToBlocks,
  normalizeNotionEmbeds,
  parseFrontmatter
} from '../src/scripts/publish-notion-markdown.mjs'

test('DeepSeek Harness article publishes its diagrams as Notion embed markers', () => {
  const source = `---
title: Agent Harness 深度解析：DeepSeek Harness、oh-my-pi 与 Python Pi Agent
publishDate: 2026-08-13
description: DeepSeek Harness architecture
category: agent-engineering
language: zh
---

{{deepseek-harness-architecture}}
{{deepseek-harness-loop}}`
  const { metadata, body } = parseFrontmatter(source)
  const normalized = normalizeNotionEmbeds(body)
  const blocks = markdownToBlocks(normalized)

  assert.equal(metadata.title, 'Agent Harness 深度解析：DeepSeek Harness、oh-my-pi 与 Python Pi Agent')
  assert.match(normalized, /\{\{deepseek-harness-architecture\}\}/)
  assert.match(normalized, /\{\{deepseek-harness-loop\}\}/)
  assert.ok(
    blocks.some(
      (block) =>
        block.type === 'paragraph' &&
        block.paragraph.rich_text[0]?.text.content.includes('{{deepseek-harness-architecture}}')
    )
  )
})

test('Notion embed renderer contains both DeepSeek Harness visual replacements', async () => {
  const source = await readFile('src/utils/notion-embeds.ts', 'utf8')

  assert.match(source, /DEEPSEEK_HARNESS_ARCHITECTURE_MARKER/)
  assert.match(source, /DEEPSEEK_HARNESS_LOOP_MARKER/)
  assert.match(source, /notion-harness-architecture/)
  assert.match(source, /notion-harness-loop/)
  assert.match(source, /DEEPSEEK_HARNESS_ARCHITECTURE_HTML/)
  assert.match(source, /DEEPSEEK_HARNESS_LOOP_HTML/)
})
