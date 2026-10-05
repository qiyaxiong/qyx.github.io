import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const archive = process.argv.find((arg) => arg.startsWith('--out='))?.slice('--out='.length)
if (!archive || !path.isAbsolute(archive)) throw new Error('Pass --out=/absolute/archive/directory')

const strict = process.argv.includes('--strict')
const catalog = JSON.parse(await readFile(path.join(root, 'src/data/manga/oregairu.json'), 'utf8'))
const chapters = {}
let totalPages = 0

for (const chapter of catalog.chapters) {
  const chapterDir = path.join(archive, catalog.id, String(chapter.id).padStart(3, '0'))
  const manifestPath = path.join(chapterDir, 'manifest.json')
  if (!existsSync(manifestPath)) {
    if (strict) throw new Error(`Missing chapter ${chapter.id}`)
    continue
  }
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  if (
    manifest.series !== catalog.id ||
    manifest.chapter !== chapter.id ||
    manifest.pageCount !== manifest.pages.length ||
    !manifest.pageCount
  ) {
    throw new Error(`Invalid manifest for chapter ${chapter.id}`)
  }
  const files = manifest.pages.map((page, index) => {
    if (page.index !== index + 1 || !/^[0-9]{3}\.(webp|png|jpg)$/.test(page.file)) {
      throw new Error(`Invalid page ${index + 1} in chapter ${chapter.id}`)
    }
    if (!existsSync(path.join(chapterDir, page.file)))
      throw new Error(`Missing image ${chapter.id}/${page.file}`)
    return page.file
  })
  chapters[chapter.id] = files
  totalPages += files.length
}

const destination = path.join(root, 'src/data/manga/oregairu-pages.json')
await writeFile(destination, JSON.stringify({ series: catalog.id, chapters }, null, 2) + '\n')
console.log(
  `${Object.keys(chapters).length}/${catalog.chapters.length} chapters, ${totalPages} pages -> ${destination}`
)
