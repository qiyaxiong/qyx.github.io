import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { copyFile, link, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const catalog = JSON.parse(await readFile(path.join(root, 'src/data/manga/oregairu.json'), 'utf8'))
const options = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const match = arg.match(/^--([^=]+)=(.*)$/)
    if (!match) throw new Error(`Expected --name=value, got ${arg}`)
    return [match[1], match[2]]
  })
)
const archive = options.out
const stage = options.stage
if (!archive || !stage || !path.isAbsolute(archive) || !path.isAbsolute(stage)) {
  throw new Error('Pass --out=/absolute/archive --stage=/absolute/empty/directory')
}
if (stage === archive || stage.startsWith(`${archive}${path.sep}`)) {
  throw new Error('Stage directory must be outside the archive')
}
if (existsSync(stage) && (await readdir(stage)).length) {
  throw new Error(`Stage directory must be empty: ${stage}`)
}
await mkdir(stage, { recursive: true })

let totalPages = 0
let totalBytes = 0
let completeChapters = 0
for (const chapter of catalog.chapters) {
  const chapterName = String(chapter.id).padStart(3, '0')
  const sourceDir = path.join(archive, catalog.id, chapterName)
  const manifestPath = path.join(sourceDir, 'manifest.json')
  if (!existsSync(manifestPath)) {
    if (options.strict === 'true') throw new Error(`Missing chapter ${chapter.id}`)
    continue
  }
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  if (
    manifest.series !== catalog.id ||
    manifest.chapter !== chapter.id ||
    !manifest.pageCount ||
    manifest.pageCount !== manifest.pages.length
  ) {
    throw new Error(`Invalid manifest for chapter ${chapter.id}`)
  }

  const targetDir = path.join(stage, catalog.id, chapterName)
  await mkdir(targetDir, { recursive: true })
  for (const [index, page] of manifest.pages.entries()) {
    if (
      page.index !== index + 1 ||
      !/^[0-9]{3}\.(webp|png|jpg)$/.test(page.file) ||
      !/^[0-9a-f]{64}$/.test(page.sha256)
    ) {
      throw new Error(`Invalid image entry in chapter ${chapter.id}, page ${index + 1}`)
    }
    const sourceFile = path.join(sourceDir, page.file)
    const fileStat = await stat(sourceFile)
    if (fileStat.size !== page.bytes || fileStat.size > 25 * 1024 * 1024) {
      throw new Error(`Invalid image size: ${sourceFile}`)
    }
    const data = await readFile(sourceFile)
    if (createHash('sha256').update(data).digest('hex') !== page.sha256) {
      throw new Error(`Checksum mismatch: ${sourceFile}`)
    }
    const destination = path.join(targetDir, page.file)
    try {
      await link(sourceFile, destination)
    } catch (error) {
      if (error?.code !== 'EXDEV') throw error
      await copyFile(sourceFile, destination)
    }
    totalPages++
    totalBytes += fileStat.size
  }
  completeChapters++
}

if (totalPages + 1 > 20_000)
  throw new Error(`Cloudflare Pages Free limit exceeded: ${totalPages} images`)
await writeFile(
  path.join(stage, 'index.html'),
  '<!doctype html><html lang="zh"><meta charset="utf-8"><title>漫画图片资源</title><body>漫画图片资源</body></html>\n'
)
console.log(
  `${completeChapters}/${catalog.chapters.length} chapters, ${totalPages} images, ${(totalBytes / 1024 / 1024).toFixed(1)} MiB staged in ${stage}`
)
