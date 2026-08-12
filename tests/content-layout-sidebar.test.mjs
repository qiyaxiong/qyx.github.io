import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('notes collapse nested knowledge-map topics instead of the whole sidebar', async () => {
  const layout = await readFile('src/layouts/ContentLayout.astro', 'utf8')
  const tree = await readFile('src/components/pages/NotesTree.astro', 'utf8')
  const programmingThoughtsTree = await readFile(
    'src/components/pages/ProgrammingThoughtsSidebarTree.astro',
    'utf8'
  )

  assert.match(tree, /data-knowledge-topic/)
  assert.match(tree, /data-current-topic/)
  assert.match(tree, /<details/)
  assert.match(tree, /ProgrammingThoughtsSidebarTree/)
  assert.match(tree, /<Astro\.self/)
  assert.match(programmingThoughtsTree, /programmingThoughtsPhases\.map/)
  assert.match(programmingThoughtsTree, /data-topic-phase/)
  assert.match(programmingThoughtsTree, /open=\{isCurrentPhase\}/)
  assert.doesNotMatch(layout, /id='sidebar-toggle'/)
  assert.doesNotMatch(layout, /id='sidebar-expand-toggle'/)
})
