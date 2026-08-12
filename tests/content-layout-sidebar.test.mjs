import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('content layout exposes a desktop sidebar collapse control', async () => {
  const source = await readFile('src/layouts/ContentLayout.astro', 'utf8')

  assert.match(source, /id='sidebar-toggle'/)
  assert.match(source, /id='sidebar-expand-toggle'/)
  assert.match(source, /sidebar-collapsed/)
  assert.match(source, /localStorage/)
})
