import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const catalog = JSON.parse(await readFile(path.join(root, 'src/data/manga/oregairu.json'), 'utf8'))
const options = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const match = arg.match(/^--([^=]+)=(.*)$/)
    if (!match) throw new Error(`Expected --name=value, got ${arg}`)
    return [match[1], match[2]]
  })
)
const output = options.out
if (!output || !path.isAbsolute(output)) throw new Error('Pass --out=/absolute/archive/directory')
const start = Number(options.start || 1)
const end = Number(options.end || catalog.chapters.length)
if (
  !Number.isInteger(start) ||
  !Number.isInteger(end) ||
  start < 1 ||
  end > catalog.chapters.length ||
  start > end
) {
  throw new Error(`Expected chapter range 1..${catalog.chapters.length}`)
}
const proxy = options.proxy || process.env.HTTPS_PROXY || process.env.https_proxy
const retries = Math.max(1, Number(options.retries || 8))

function fileExtension(mime) {
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/jpeg') return 'jpg'
  throw new Error(`Unexpected image MIME type: ${mime}`)
}

async function loadImage(locator) {
  await locator.scrollIntoViewIfNeeded({ timeout: 15000 })
  return locator.evaluate(
    async (image) => {
      const deadline = Date.now() + 20000
      while (
        (!image.src.startsWith('blob:') || !image.complete || image.naturalWidth === 0) &&
        Date.now() < deadline
      ) {
        await new Promise((resolve) => setTimeout(resolve, 180))
      }
      if (!image.src.startsWith('blob:') || image.naturalWidth === 0)
        throw new Error('Image did not load')
      const blob = await (await fetch(image.src)).blob()
      return {
        mime: blob.type,
        data: await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result).split(',')[1])
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(blob)
        })
      }
    },
    undefined,
    { timeout: 25000 }
  )
}

async function crawlChapter(context, chapter) {
  const chapterDir = path.join(output, catalog.id, String(chapter.id).padStart(3, '0'))
  await mkdir(chapterDir, { recursive: true })
  const manifestPath = path.join(chapterDir, 'manifest.json')
  if (existsSync(manifestPath)) {
    const old = JSON.parse(await readFile(manifestPath, 'utf8'))
    if (
      old.pages.length > 0 &&
      old.pages.every((entry) => existsSync(path.join(chapterDir, entry.file)))
    ) {
      console.log(`[${chapter.id}/${end}] already complete (${old.pages.length} pages)`)
      return old
    }
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    const page = await context.newPage()
    try {
      await page.goto(chapter.sourceUrl, { waitUntil: 'domcontentloaded', timeout: 45000 })
      await page
        .locator('#chapter-images img')
        .first()
        .waitFor({ state: 'attached', timeout: 25000 })
      await page.waitForTimeout(450)
      const imageCount = await page.locator('#chapter-images img').count()
      if (imageCount < 1 || imageCount > 300) throw new Error(`Unusual page count: ${imageCount}`)
      const pages = []
      for (let index = 0; index < imageCount; index++) {
        const base = String(index + 1).padStart(3, '0')
        const existing = (await readdir(chapterDir)).find(
          (name) => name.startsWith(`${base}.`) && /\.(webp|png|jpg)$/.test(name)
        )
        let file = existing
        let mime = existing
          ? `image/${existing.split('.').at(-1).replace('jpg', 'jpeg')}`
          : undefined
        let bytes
        let sha256
        if (!existing) {
          const locator = page.locator('#chapter-images img').nth(index)
          const image = await loadImage(locator).catch((error) => {
            throw new Error(`Image ${index + 1}: ${error.message}`)
          })
          mime = image.mime
          file = `${base}.${fileExtension(mime)}`
          const buffer = Buffer.from(image.data, 'base64')
          if (buffer.byteLength < 5000) throw new Error(`Image ${index + 1} is unexpectedly small`)
          bytes = buffer.byteLength
          sha256 = createHash('sha256').update(buffer).digest('hex')
          await writeFile(path.join(chapterDir, file), buffer)
        } else {
          const buffer = await readFile(path.join(chapterDir, existing))
          bytes = buffer.byteLength
          sha256 = createHash('sha256').update(buffer).digest('hex')
        }
        pages.push({ index: index + 1, file, mime, bytes, sha256 })
      }
      const manifest = {
        series: catalog.id,
        chapter: chapter.id,
        title: chapter.title,
        sourceUrl: chapter.sourceUrl,
        pageCount: pages.length,
        pages
      }
      const temporary = `${manifestPath}.tmp`
      await writeFile(temporary, JSON.stringify(manifest, null, 2) + '\n')
      await rename(temporary, manifestPath)
      const mb = (pages.reduce((sum, image) => sum + image.bytes, 0) / 1024 / 1024).toFixed(1)
      console.log(`[${chapter.id}/${end}] ${pages.length} pages, ${mb} MiB`)
      await page.close()
      return manifest
    } catch (error) {
      console.error(`[${chapter.id}/${end}] attempt ${attempt}/${retries}: ${error.message}`)
      await page.close()
      if (attempt === retries) throw error
      await new Promise((resolve) => setTimeout(resolve, attempt * 1800))
    }
  }
}

await mkdir(output, { recursive: true })
const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ...(proxy ? { proxy: { server: proxy } } : {}),
  args: ['--no-sandbox']
})
const context = await browser.newContext({ ignoreHTTPSErrors: true })
const failures = []
try {
  for (const chapter of catalog.chapters.filter((item) => item.id >= start && item.id <= end)) {
    try {
      await crawlChapter(context, chapter)
    } catch (error) {
      failures.push(chapter.id)
      console.error(`[${chapter.id}/${end}] incomplete: ${error.message}`)
    }
    await new Promise((resolve) => setTimeout(resolve, 350))
  }
} finally {
  await browser.close()
}
if (failures.length) throw new Error(`Incomplete chapters: ${failures.join(', ')}`)
