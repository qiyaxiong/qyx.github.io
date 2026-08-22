import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Client } from '@notionhq/client'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import minimist from './libs/minimist.cjs'

const DATA_SOURCE_NAMES = ['post', 'astro-blog']
const MAX_TEXT_LENGTH = 2000
const APPEND_BATCH_SIZE = 50
const PUBLIC_SITE_URL = 'https://blog.qixiaoluo.dpdns.org'

const HELP_INFO = `Usage: astro-axi publish-markdown [options]

Required:
  --file <path>            Markdown or MDX file with frontmatter

Optional:
  --slug <slug>            Override the slug derived from the file directory
  --update-published       Update an existing Published Notion post
  --dry-run                Parse the article and print the Notion block summary
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
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]+|['"]+$/g, '')

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

export function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) throw new Error('The Markdown file must begin with YAML frontmatter')

  const metadata = {}
  let activeList

  for (const rawLine of match[1].split(/\r?\n/)) {
    const listItem = rawLine.match(/^\s+-\s+(.+)$/)
    if (listItem && activeList) {
      metadata[activeList].push(stripQuotes(listItem[1].trim()))
      continue
    }

    const property = rawLine.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/)
    if (!property) continue

    const [, key, rawValue] = property
    if (!rawValue) {
      metadata[key] = []
      activeList = key
      continue
    }

    metadata[key] = stripQuotes(rawValue.trim())
    activeList = undefined
  }

  return {
    metadata,
    body: source.slice(match[0].length).trim()
  }
}

function stripQuotes(value) {
  return value.replace(/^['"]+|['"]+$/g, '')
}

function splitText(value, length = MAX_TEXT_LENGTH) {
  if (!value) return ['']
  const chunks = []
  for (let index = 0; index < value.length; index += length) {
    chunks.push(value.slice(index, index + length))
  }
  return chunks
}

function textRichText(content, annotations = {}, link) {
  return splitText(content).map((chunk) => ({
    type: 'text',
    text: {
      content: chunk,
      link: link ? { url: normalizeLink(link) } : null
    },
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: 'default',
      ...annotations
    }
  }))
}

function normalizeLink(link) {
  if (link.startsWith('/')) return new URL(link, PUBLIC_SITE_URL).toString()
  return link
}

function richTextFromNodes(nodes, annotations = {}, link) {
  return nodes.flatMap((node) => {
    switch (node.type) {
      case 'text':
        return textRichText(node.value, annotations, link)
      case 'inlineCode':
        return textRichText(node.value, { ...annotations, code: true }, link)
      case 'inlineMath':
        return [
          {
            type: 'equation',
            equation: { expression: node.value },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default',
              ...annotations
            }
          }
        ]
      case 'strong':
        return richTextFromNodes(node.children, { ...annotations, bold: true }, link)
      case 'emphasis':
        return richTextFromNodes(node.children, { ...annotations, italic: true }, link)
      case 'delete':
        return richTextFromNodes(node.children, { ...annotations, strikethrough: true }, link)
      case 'link':
        return richTextFromNodes(node.children, annotations, node.url)
      case 'break':
        return textRichText('\n', annotations, link)
      case 'image':
        return textRichText(node.alt || node.url, annotations, node.url)
      default:
        return textRichText(node.value || '', annotations, link)
    }
  })
}

function plainText(node) {
  if (typeof node.value === 'string') return node.value
  if (!Array.isArray(node.children)) return ''
  return node.children.map(plainText).join('')
}

function paragraphBlock(node, type = 'paragraph') {
  return {
    object: 'block',
    type,
    [type]: {
      rich_text: richTextFromNodes(node.children || [])
    }
  }
}

function imageBlock(node) {
  return {
    object: 'block',
    type: 'image',
    image: {
      type: 'external',
      external: { url: normalizeLink(node.url) }
    }
  }
}

function paragraphOrImageBlocks(node) {
  const children = node.children || []
  if (!children.some((child) => child.type === 'image')) {
    return [paragraphBlock(node)]
  }

  const blocks = []
  let textChildren = []
  const flushText = () => {
    if (textChildren.length) {
      blocks.push(paragraphBlock({ children: textChildren }))
      textChildren = []
    }
  }

  for (const child of children) {
    if (child.type === 'image') {
      flushText()
      blocks.push(imageBlock(child))
    } else {
      textChildren.push(child)
    }
  }
  flushText()
  return blocks
}

function listItemBlock(node, ordered) {
  const [first, ...rest] = node.children || []
  const type = ordered ? 'numbered_list_item' : 'bulleted_list_item'
  const block = paragraphBlock(first || { children: [] }, type)
  const children = rest.flatMap(nodeToBlocks)
  if (children.length) block[type].children = children
  return block
}

function normalizeCodeLanguage(language) {
  const normalized = (language || 'plain text').toLowerCase()
  const aliases = {
    text: 'plain text',
    txt: 'plain text',
    ts: 'typescript',
    js: 'javascript',
    sh: 'shell',
    bash: 'shell'
  }
  return aliases[normalized] || normalized
}

function codeBlocks(node) {
  return splitText(node.value).map((content) => ({
    object: 'block',
    type: 'code',
    code: {
      rich_text: textRichText(content),
      language: normalizeCodeLanguage(node.lang)
    }
  }))
}

function tableBlock(node) {
  const width = Math.max(...node.children.map((row) => row.children.length))
  return {
    object: 'block',
    type: 'table',
    table: {
      table_width: width,
      has_column_header: true,
      has_row_header: false,
      children: node.children.map((row) => ({
        object: 'block',
        type: 'table_row',
        table_row: {
          cells: Array.from({ length: width }, (_, index) =>
            richTextFromNodes(row.children[index]?.children || [])
          )
        }
      }))
    }
  }
}

function nodeToBlocks(node) {
  switch (node.type) {
    case 'heading': {
      const type = `heading_${Math.min(node.depth, 3)}`
      return [
        {
          object: 'block',
          type,
          [type]: { rich_text: richTextFromNodes(node.children) }
        }
      ]
    }
    case 'paragraph':
      return paragraphOrImageBlocks(node)
    case 'list':
      return node.children.map((item) => listItemBlock(item, node.ordered))
    case 'blockquote':
      return node.children.map((child) => ({
        object: 'block',
        type: 'quote',
        quote: { rich_text: textRichText(plainText(child)) }
      }))
    case 'code':
      return codeBlocks(node)
    case 'math':
      return [
        {
          object: 'block',
          type: 'equation',
          equation: { expression: node.value }
        }
      ]
    case 'table':
      return [tableBlock(node)]
    case 'thematicBreak':
      return [{ object: 'block', type: 'divider', divider: {} }]
    case 'html':
      return [paragraphBlock({ children: [{ type: 'text', value: node.value }] })]
    case 'image':
      return [imageBlock(node)]
    default:
      return Array.isArray(node.children) ? node.children.flatMap(nodeToBlocks) : []
  }
}

export function markdownToBlocks(markdown) {
  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkMath).parse(markdown)
  return tree.children.flatMap(nodeToBlocks)
}

export function normalizeNotionEmbeds(markdown) {
  return markdown
    .replace(
      /^import AgentTurnTimeline from ['"]@\/components\/blog\/AgentTurnTimeline\.astro['"]\s*$/m,
      ''
    )
    .replace(/<AgentTurnTimeline\s*\/>/g, '{{agent-turn-timeline}}')
}

async function getPostDataSourceId(notion, databaseId) {
  const database = await notion.databases.retrieve({ database_id: databaseId })
  const dataSource = database.data_sources?.find((item) =>
    DATA_SOURCE_NAMES.includes(item.name.toLowerCase())
  )

  if (!dataSource) {
    throw new Error(`No post data source found in Notion database ${databaseId}`)
  }

  return dataSource.id
}

async function findExistingPostBySlug(notion, dataSourceId, slug) {
  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      property: 'Slug',
      rich_text: { equals: slug }
    }
  })

  return response.results.find((result) => result.object === 'page')
}

function getSelectProperty(page, name) {
  const property = page.properties?.[name]
  return property?.type === 'select' ? property.select?.name : undefined
}

async function clearPageChildren(notion, pageId) {
  const blockIds = []
  let cursor
  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100
    })

    blockIds.push(...response.results.map((block) => block.id))
    cursor = response.has_more ? response.next_cursor : undefined
  } while (cursor)

  for (const blockId of blockIds) {
    await notion.blocks.delete({ block_id: blockId })
  }
}

function buildDraftProperties(metadata, slug) {
  const required = ['title', 'publishDate', 'description', 'category', 'language']
  for (const key of required) {
    if (!metadata[key]) throw new Error(`Missing frontmatter property: ${key}`)
  }

  return {
    Title: {
      title: [{ type: 'text', text: { content: metadata.title } }]
    },
    Status: {
      select: { name: 'Draft' }
    },
    Lang: {
      select: { name: metadata.language }
    },
    Slug: {
      rich_text: [{ type: 'text', text: { content: slug } }]
    },
    Description: {
      rich_text: [{ type: 'text', text: { content: metadata.description } }]
    },
    'Source Page': {
      url: null
    },
    Date: {
      date: { start: metadata.publishDate }
    },
    Tags: {
      multi_select: (metadata.tags || []).map((name) => ({ name }))
    },
    Category: {
      select: { name: metadata.category }
    }
  }
}

function inferSlug(filePath) {
  const parts = resolve(filePath).split(/[\\/]/)
  return parts.at(-1)?.match(/^index\./) ? parts.at(-2) : parts.at(-1)?.replace(/\.[^.]+$/, '')
}

export default async function main(argv) {
  const args = minimist(argv, {
    string: ['file', 'slug'],
    boolean: ['dry-run', 'help', 'update-published'],
    alias: { h: 'help' }
  })

  if (args.help) {
    console.log(HELP_INFO)
    return
  }

  if (!args.file) throw new Error('Missing required option: --file')

  const filePath = resolve(process.cwd(), args.file)
  const source = readFileSync(filePath, 'utf8')
  const { metadata, body } = parseFrontmatter(source)
  const slug = args.slug || inferSlug(filePath)
  const blocks = markdownToBlocks(normalizeNotionEmbeds(body))
  const properties = buildDraftProperties(metadata, slug)
  const blockTypes = blocks.reduce((counts, block) => {
    counts[block.type] = (counts[block.type] || 0) + 1
    return counts
  }, {})

  if (args['dry-run']) {
    console.log(
      JSON.stringify(
        {
          title: metadata.title,
          slug,
          status: 'Draft → Published',
          category: metadata.category,
          tags: metadata.tags,
          sourceCharacters: [...body].length,
          blocks: blocks.length,
          blockTypes
        },
        null,
        2
      )
    )
    return
  }

  const token = getEnv('NOTION_API_KEY')
  const databaseId = getEnv('NOTION_DATABASE_ID', ['NOTION_REGISTRY_DATABASE_ID'])
  if (!token) throw new Error('Missing NOTION_API_KEY')
  if (!databaseId) throw new Error('Missing NOTION_DATABASE_ID or NOTION_REGISTRY_DATABASE_ID')

  const notion = new Client({ auth: token })
  const dataSourceId = await getPostDataSourceId(notion, databaseId)
  const existingPost = await findExistingPostBySlug(notion, dataSourceId, slug)

  if (
    existingPost &&
    getSelectProperty(existingPost, 'Status') !== 'Draft' &&
    !args['update-published']
  ) {
    throw new Error(`Post already exists for slug "${slug}": ${existingPost.id}`)
  }

  const page =
    existingPost ||
    (await notion.pages.create({
      parent: {
        type: 'data_source_id',
        data_source_id: dataSourceId
      },
      properties
    }))

  try {
    if (existingPost) {
      await clearPageChildren(notion, page.id)
      await notion.pages.update({
        page_id: page.id,
        properties
      })
    }

    for (let index = 0; index < blocks.length; index += APPEND_BATCH_SIZE) {
      await notion.blocks.children.append({
        block_id: page.id,
        children: blocks.slice(index, index + APPEND_BATCH_SIZE)
      })
    }

    await notion.pages.update({
      page_id: page.id,
      properties: {
        'Source Page': { url: page.url },
        Status: { select: { name: 'Published' } }
      }
    })
  } catch (error) {
    throw new Error(
      `Created Draft ${page.id}, but failed before publishing: ${error.code || error.message}`,
      { cause: error }
    )
  }

  console.log(
    JSON.stringify(
      {
        status: 'Published',
        pageId: page.id,
        sourcePageUrl: page.url,
        slug,
        blocks: blocks.length
      },
      null,
      2
    )
  )
}
