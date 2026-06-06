import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { Client } from '@notionhq/client'

import minimist from './libs/minimist.cjs'

const DATA_SOURCE_NAMES = ['post', 'astro-blog']

const HELP_INFO = `Usage: astro-axi register-post [options]

Required:
  --title <title>          Blog title
  --slug <slug>            Blog route slug
  --source <url>           Notion source page URL
  --date <YYYY-MM-DD>      Publish date

Optional:
  --lang <zh|en>           Language (default: zh)
  --status <status>        Notion status (default: Published)
  --description <text>     Post summary shown under the title
  --category <category>    Category select value
  --tags <a,b,c>           Comma-separated tags
  --dry-run                Print payload without creating a Notion row
  -h, --help               Show this help message

Example:
  astro-axi register-post \\
    --title "用 AI 代理把文章写到 Notion 并发布：一套可复用流程" \\
    --slug ai-notion-publish-flow \\
    --description "用 Notion 管理摘要，用 Source Page 编写正文。" \\
    --source "https://www.notion.so/AI-Notion-377dc10b938a806191e2f70cee951365?source=copy_link" \\
    --date 2026-06-06 \\
    --tags "notion,ai-agent,publishing" \\
    --category tech
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
        .replace(/^['"]|['"]$/g, '')

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

function requiredString(args, name) {
  const value = args[name]
  if (typeof value === 'string' && value.trim()) return value.trim()

  throw new Error(`Missing required option: --${name}`)
}

function parseTags(value) {
  if (typeof value !== 'string') return []
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
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
      rich_text: {
        equals: slug
      }
    }
  })

  return response.results.find((result) => result.object === 'page')
}

function buildProperties({ title, status, lang, slug, description, source, date, tags, category }) {
  const properties = {
    Title: {
      title: [{ type: 'text', text: { content: title } }]
    },
    Status: {
      select: { name: status }
    },
    Lang: {
      select: { name: lang }
    },
    Slug: {
      rich_text: [{ type: 'text', text: { content: slug } }]
    },
    Description: {
      rich_text: description ? [{ type: 'text', text: { content: description } }] : []
    },
    'Source Page': {
      url: source
    },
    Date: {
      date: { start: date }
    },
    Tags: {
      multi_select: tags.map((name) => ({ name }))
    }
  }

  if (category) {
    properties.Category = {
      select: { name: category }
    }
  }

  return properties
}

export default async function main(argv) {
  const args = minimist(argv, {
    string: [
      'title',
      'slug',
      'source',
      'date',
      'lang',
      'status',
      'description',
      'category',
      'tags'
    ],
    boolean: ['dry-run', 'help'],
    alias: { h: 'help' },
    default: {
      lang: 'zh',
      status: 'Published',
      tags: ''
    }
  })

  if (args.help) {
    console.log(HELP_INFO)
    return
  }

  const post = {
    title: requiredString(args, 'title'),
    slug: requiredString(args, 'slug'),
    source: requiredString(args, 'source'),
    date: requiredString(args, 'date'),
    lang: requiredString(args, 'lang'),
    status: requiredString(args, 'status'),
    description: typeof args.description === 'string' ? args.description.trim() : '',
    category: typeof args.category === 'string' ? args.category.trim() : '',
    tags: parseTags(args.tags)
  }

  const properties = buildProperties(post)

  if (args['dry-run']) {
    console.log(JSON.stringify({ properties }, null, 2))
    return
  }

  const token = getEnv('NOTION_API_KEY')
  const databaseId = getEnv('NOTION_DATABASE_ID', ['NOTION_REGISTRY_DATABASE_ID'])

  if (!token) throw new Error('Missing NOTION_API_KEY')
  if (!databaseId) throw new Error('Missing NOTION_DATABASE_ID or NOTION_REGISTRY_DATABASE_ID')

  const notion = new Client({ auth: token })
  const dataSourceId = await getPostDataSourceId(notion, databaseId)
  const existingPost = await findExistingPostBySlug(notion, dataSourceId, post.slug)

  if (existingPost) {
    console.log(`Post already exists for slug "${post.slug}": ${existingPost.id}`)
    return
  }

  const created = await notion.pages.create({
    parent: {
      type: 'data_source_id',
      data_source_id: dataSourceId
    },
    properties
  })

  console.log(`Registered Notion post: ${created.id}`)
}
