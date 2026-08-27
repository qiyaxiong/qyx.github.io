#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import { Client } from '@notionhq/client'

import minimist from './libs/minimist.cjs'
import {
  markdownToBlocks,
  normalizeNotionEmbeds,
  parseFrontmatter
} from './publish-notion-markdown.mjs'
import { programmingThoughtsLegacySlugs } from '../utils/programming-thoughts-redirects.mjs'

const NOTE_DATA_SOURCE_NAMES = ['note', 'notes']
const APPEND_BATCH_SIZE = 50
const NOTES_ROOT = resolve(process.cwd(), 'src/content/notes')
const MAX_RETRIES = 4

const HELP_INFO = `Usage: node src/scripts/index.js publish-notes [options]

Required:
  --file <path>            Publish one local Notes Markdown file
  --dir <path>             Publish every Markdown file below a Notes directory

Optional:
  --update-published       Update existing Published Notion notes
  --unpublish-missing      After a directory publish succeeds, change missing notes below it to Draft
  --dry-run                Parse files and print the publish plan
  -h, --help               Show this help message
`

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) return {}

  return readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return acc

      const separatorIndex = trimmed.indexOf('=')
      if (separatorIndex === -1) return acc

      const key = trimmed.slice(0, separatorIndex).trim()
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]+|['"]+$/g, '')
      if (key) acc[key] = value
      return acc
    }, {})
}

function getEnv(name, aliases = []) {
  const env = loadEnvFile()
  for (const key of [name, ...aliases]) {
    const value = process.env[key] || env[key]
    if (value) return value
  }
  return undefined
}

function getNoteFiles(root) {
  const files = []

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = resolve(root, entry.name)
    if (entry.isDirectory()) {
      files.push(...getNoteFiles(path))
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      files.push(path)
    }
  }

  return files.sort()
}

function inferNoteSlug(filePath) {
  const relativePath = relative(NOTES_ROOT, resolve(filePath)).split(sep).join('/')
  const withoutExtension = relativePath.replace(/\.(md|mdx)$/, '')
  const segments = withoutExtension.split('/')
  if (segments.at(-1) === 'index') segments.pop()
  return segments.join('/')
}

function getDataSourceId(database) {
  const dataSource = database.data_sources?.find((item) =>
    NOTE_DATA_SOURCE_NAMES.includes(item.name.toLowerCase())
  )
  if (!dataSource) {
    throw new Error(`No Note data source found in Notion database ${database.id}`)
  }
  return dataSource.id
}

function isRetryable(error) {
  const status = error?.status ?? error?.statusCode
  return status == null || status === 408 || status === 429 || status >= 500
}

async function withRetry(label, operation) {
  let lastError

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (attempt === MAX_RETRIES || !isRetryable(error)) throw error
      const delay = 500 * 2 ** (attempt - 1)
      console.error(`[notion] ${label} failed; retrying in ${delay}ms (${attempt}/${MAX_RETRIES - 1})`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

async function findExistingNote(notion, dataSourceId, slug) {
  const response = await withRetry(`query ${slug}`, () =>
    notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: 'Slug', rich_text: { equals: slug } }
    })
  )
  return response.results.find((result) => result.object === 'page')
}

async function findPublishedNotesBelow(notion, dataSourceId, slugPrefix) {
  const pages = []
  let cursor
  do {
    const response = await withRetry(`query published notes below ${slugPrefix}`, () =>
      notion.dataSources.query({
        data_source_id: dataSourceId,
        start_cursor: cursor,
        page_size: 100,
        filter: {
          and: [
            { property: 'Status', select: { equals: 'Published' } },
            { property: 'Slug', rich_text: { starts_with: slugPrefix } }
          ]
        }
      })
    )
    pages.push(...response.results.filter((result) => result.object === 'page'))
    cursor = response.has_more ? response.next_cursor : undefined
  } while (cursor)
  return pages
}

function getRichTextProperty(page, name) {
  return page.properties?.[name]?.rich_text?.map((item) => item.plain_text).join('') || ''
}

async function unpublishMissingNotes({ notion, dataSourceId, directory, publishedSlugs }) {
  const relativeDirectory = relative(NOTES_ROOT, directory).split(sep).join('/').replace(/\/$/, '')
  if (!relativeDirectory || relativeDirectory.startsWith('..')) {
    throw new Error(`Refusing to unpublish outside Notes root: ${directory}`)
  }
  if (relativeDirectory !== 'programming-thoughts') {
    throw new Error('--unpublish-missing currently supports only the programming-thoughts migration allowlist')
  }
  const allowlist = new Set(programmingThoughtsLegacySlugs)
  const candidates = await findPublishedNotesBelow(notion, dataSourceId, `${relativeDirectory}/`)
  const missing = candidates.filter((page) => {
    const slug = getRichTextProperty(page, 'Slug')
    return allowlist.has(slug) && !publishedSlugs.has(slug)
  })
  for (const page of missing) {
    const slug = getRichTextProperty(page, 'Slug')
    await withRetry(`unpublish ${slug}`, () => notion.pages.update({
      page_id: page.id,
      properties: { Status: { select: { name: 'Draft' } } }
    }))
    console.error(`[notion] Drafted obsolete note ${slug}`)
  }
  return missing.map((page) => getRichTextProperty(page, 'Slug'))
}

async function clearPageChildren(notion, pageId) {
  const blockIds = []
  let archivedCount = 0
  let cursor
  do {
    const response = await withRetry(`list blocks ${pageId}`, () =>
      notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
        page_size: 100
      })
    )
    for (const block of response.results) {
      // Notion refuses to delete an archived block. Archived children are
      // already invisible, so leave them in place and replace the active
      // content below. This also makes repeated Note updates idempotent when
      // an earlier publish was interrupted after archiving a block.
      if (block.archived) {
        archivedCount += 1
      } else {
        blockIds.push(block.id)
      }
    }
    cursor = response.has_more ? response.next_cursor : undefined
  } while (cursor)

  for (const blockId of blockIds) {
    try {
      await withRetry(`delete block ${blockId}`, () => notion.blocks.delete({ block_id: blockId }))
    } catch (error) {
      // Some older Notion responses omit the archived flag from the list
      // payload. Treat the server's archived-block validation as equivalent
      // to an already-hidden child and continue replacing active content.
      if (error?.code === 'validation_error' && /archived/i.test(error?.message || '')) {
        archivedCount += 1
        continue
      }
      throw error
    }
  }

  if (archivedCount > 0) {
    console.error(`[notion] skipped ${archivedCount} archived block(s) on ${pageId}`)
  }
}

function buildNoteProperties(metadata, slug, status = 'Published') {
  if (!metadata.title) throw new Error('Missing frontmatter property: title')
  if (!metadata.language) throw new Error('Missing frontmatter property: language')

  return {
    Title: { title: [{ type: 'text', text: { content: metadata.title } }] },
    Status: { select: { name: status } },
    Lang: { select: { name: metadata.language } },
    Slug: { rich_text: [{ type: 'text', text: { content: slug } }] },
    'Source Page': { url: null }
  }
}

async function publishOne({ notion, dataSourceId, filePath, updatePublished, dryRun }) {
  const source = readFileSync(filePath, 'utf8')
  const { metadata, body } = parseFrontmatter(source)
  const slug = inferNoteSlug(filePath)
  const blocks = markdownToBlocks(normalizeNotionEmbeds(body))

  if (dryRun) {
    return {
      title: metadata.title,
      slug,
      file: relative(process.cwd(), filePath),
      blocks: blocks.length,
      status: 'Published'
    }
  }

  const existingNote = await findExistingNote(notion, dataSourceId, slug)
  if (existingNote && !updatePublished) {
    throw new Error(`Note already exists for slug "${slug}". Use --update-published to update it.`)
  }

  const page =
    existingNote ||
    (await withRetry(`create ${slug}`, () =>
      notion.pages.create({
        parent: { type: 'data_source_id', data_source_id: dataSourceId },
        properties: buildNoteProperties(metadata, slug, 'Draft')
      })
    ))

  if (existingNote) {
    await clearPageChildren(notion, page.id)
    await withRetry(`prepare ${slug}`, () =>
      notion.pages.update({
        page_id: page.id,
        properties: buildNoteProperties(metadata, slug, 'Draft')
      })
    )
  }

  for (let index = 0; index < blocks.length; index += APPEND_BATCH_SIZE) {
    await withRetry(`append ${slug} batch ${index / APPEND_BATCH_SIZE + 1}`, () =>
      notion.blocks.children.append({
        block_id: page.id,
        children: blocks.slice(index, index + APPEND_BATCH_SIZE)
      })
    )
  }

  await withRetry(`publish ${slug}`, () =>
    notion.pages.update({
      page_id: page.id,
      properties: {
        'Source Page': { url: page.url },
        Status: { select: { name: 'Published' } }
      }
    })
  )

  return {
    title: metadata.title,
    slug,
    pageId: page.id,
    sourcePageUrl: page.url,
    blocks: blocks.length,
    status: 'Published'
  }
}

export default async function main(argv) {
  const args = minimist(argv, {
    string: ['file', 'dir'],
    boolean: ['dry-run', 'help', 'update-published', 'unpublish-missing'],
    alias: { h: 'help' }
  })

  if (args.help) {
    console.log(HELP_INFO)
    return
  }

  if (!args.file && !args.dir) throw new Error('Provide --file or --dir')
  if (args.file && args.dir) throw new Error('Use only one of --file or --dir')
  if (args['unpublish-missing'] && !args.dir) throw new Error('--unpublish-missing requires --dir')

  const root = resolve(process.cwd(), args.dir || args.file)
  const files = statSync(root).isDirectory() ? getNoteFiles(root) : [root]
  if (!files.length) throw new Error(`No Markdown files found below ${root}`)

  if (args['dry-run']) {
    const plan = []
    for (const filePath of files) {
      plan.push(await publishOne({ filePath, dryRun: true }))
    }
    console.log(JSON.stringify({ dataSource: 'note', count: plan.length, notes: plan }, null, 2))
    return
  }

  const token = getEnv('NOTION_API_KEY')
  const databaseId = getEnv('NOTION_DATABASE_ID', ['NOTION_REGISTRY_DATABASE_ID'])
  if (!token) throw new Error('Missing NOTION_API_KEY')
  if (!databaseId) throw new Error('Missing NOTION_DATABASE_ID or NOTION_REGISTRY_DATABASE_ID')

  const notion = new Client({ auth: token })
  const database = await withRetry('retrieve registry database', () =>
    notion.databases.retrieve({ database_id: databaseId })
  )
  const dataSourceId = getDataSourceId(database)
  const results = []

  for (const filePath of files) {
    const result = await publishOne({
      notion,
      dataSourceId,
      filePath,
      updatePublished: Boolean(args['update-published']),
      dryRun: false
    })
    results.push(result)
    console.error(`[notion] Published ${result.slug}`)
  }

  const unpublished = args['unpublish-missing']
    ? await unpublishMissingNotes({
        notion,
        dataSourceId,
        directory: root,
        publishedSlugs: new Set(files.map(inferNoteSlug))
      })
    : []

  console.log(JSON.stringify({ dataSource: 'note', count: results.length, notes: results, unpublished }, null, 2))
}
