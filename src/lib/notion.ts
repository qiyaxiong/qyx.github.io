import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Client } from '@notionhq/client'
import type {
  PageObjectResponse,
  QueryDataSourceResponse
} from '@notionhq/client/build/src/api-endpoints'
import { NotionToMarkdown } from 'notion-to-md'

export type NotionRegistryType = 'Post' | 'Page' | 'Link' | 'Project' | 'Note'
export type NotionLang = 'zh' | 'en'

export interface NotionPost {
  notionId: string
  title: string
  description?: string
  type: 'Post'
  lang: NotionLang
  slug: string
  sourcePageId: string
  date: Date
  tags: string[]
  category?: string
  image?: string
}

export interface NotionPageEntry {
  notionId: string
  title: string
  type: 'Page'
  lang: NotionLang
  slug: string
  sourcePageId: string
}

export interface NotionNoteEntry {
  notionId: string
  title: string
  type: 'Note'
  lang: NotionLang
  slug: string
  sourcePageId: string
}

export interface NotionLink {
  notionId: string
  title: string
  type: 'Link'
  lang: NotionLang
  url: string
  description?: string
  avatar?: string
  order?: number
}

export interface NotionProject {
  notionId: string
  title: string
  type: 'Project'
  lang: NotionLang
  description?: string
  image?: string
  order?: number
  site?: string
  github?: string
  doc?: string
  release?: string
}

let envFileCache: Record<string, string> | undefined
const NOTION_API_KEY = getRequiredEnv('NOTION_API_KEY')
const NOTION_DATABASE_ID = getRequiredEnv('NOTION_DATABASE_ID', ['NOTION_REGISTRY_DATABASE_ID'])

const notion = new Client({ auth: NOTION_API_KEY })
const dataSourceIdCache = new Map<NotionRegistryType, Promise<string | null>>()
const queryCache = new Map<string, Promise<PageObjectResponse[]>>()
const markdownCache = new Map<string, Promise<string>>()
const invalidPageWarnings = new Set<string>()

type NotionMapper<T> = (page: PageObjectResponse) => T | undefined

function loadEnvFile(): Record<string, string> {
  if (envFileCache) {
    return envFileCache
  }

  const envFilePath = resolve(process.cwd(), '.env')
  if (!existsSync(envFilePath)) {
    envFileCache = {}
    return envFileCache
  }

  const content = readFileSync(envFilePath, 'utf8')
  envFileCache = content.split(/\r?\n/).reduce<Record<string, string>>((acc, line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      return acc
    }

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) {
      return acc
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')

    if (key) {
      acc[key] = value
    }

    return acc
  }, {})

  return envFileCache
}

function getRequiredEnv(
  name: 'NOTION_API_KEY' | 'NOTION_DATABASE_ID',
  fallbackNames: string[] = []
): string {
  const env = loadEnvFile()
  const candidates = [name, ...fallbackNames]

  for (const candidate of candidates) {
    const value = process.env[candidate] || import.meta.env?.[candidate] || env[candidate]
    if (value) {
      return value
    }
  }

  if (!candidates.length) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  const expectedNames = candidates.join(' or ')
  throw new Error(`Missing required environment variable: ${expectedNames}`)
}

function normalizeId(value: string): string {
  return value.replace(/-/g, '').toLowerCase()
}

export function extractPageId(url: string): string {
  const match = url.match(/[0-9a-fA-F]{32}|[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}/)

  if (!match) {
    throw new Error(`Unable to extract Notion page ID from URL: ${url}`)
  }

  return normalizeId(match[0])
}

function isFullPage(
  result: QueryDataSourceResponse['results'][number]
): result is PageObjectResponse {
  return result.object === 'page' && 'properties' in result
}

function getProperty(page: PageObjectResponse, names: string | string[]) {
  const aliases = Array.isArray(names) ? names : [names]
  for (const name of aliases) {
    const property = page.properties[name]
    if (property) {
      return property
    }
  }

  throw new Error(`Missing property "${aliases.join('" or "')}" on Notion page ${page.id}`)
}

function getTitleValue(page: PageObjectResponse, names: string | string[]): string {
  const property = getProperty(page, names)
  if (property.type !== 'title') {
    throw new Error(
      `Property "${Array.isArray(names) ? names.join('" or "') : names}" on Notion page ${page.id} is not a title field`
    )
  }
  return property.title
    .map((item) => item.plain_text)
    .join('')
    .trim()
}

function getRequiredTitleValue(page: PageObjectResponse, names: string | string[]): string {
  const value = getTitleValue(page, names)
  if (!value) {
    throw new Error(
      `Property "${Array.isArray(names) ? names.join('" or "') : names}" on Notion page ${page.id} is empty`
    )
  }
  return value
}

function getRichTextValue(page: PageObjectResponse, names: string | string[]): string {
  const property = getProperty(page, names)
  if (property.type !== 'rich_text') {
    throw new Error(
      `Property "${Array.isArray(names) ? names.join('" or "') : names}" on Notion page ${page.id} is not a rich_text field`
    )
  }
  return property.rich_text
    .map((item) => item.plain_text)
    .join('')
    .trim()
}

function getRequiredRichTextValue(page: PageObjectResponse, names: string | string[]): string {
  const value = getRichTextValue(page, names)
  if (!value) {
    throw new Error(
      `Property "${Array.isArray(names) ? names.join('" or "') : names}" on Notion page ${page.id} is empty`
    )
  }
  return value
}

function getOptionalRichTextValue(
  page: PageObjectResponse,
  names: string | string[]
): string | undefined {
  const aliases = Array.isArray(names) ? names : [names]
  const property = aliases.map((name) => page.properties[name]).find(Boolean)
  if (!property) return undefined
  if (property.type !== 'rich_text') {
    throw new Error(
      `Property "${aliases.join('" or "')}" on Notion page ${page.id} is not a rich_text field`
    )
  }

  const value = property.rich_text
    .map((item) => item.plain_text)
    .join('')
    .trim()
  return value || undefined
}

function getSelectValue(page: PageObjectResponse, names: string | string[]): string {
  const property = getProperty(page, names)
  if (property.type !== 'select') {
    throw new Error(
      `Property "${Array.isArray(names) ? names.join('" or "') : names}" on Notion page ${page.id} is not a select field`
    )
  }
  if (!property.select?.name) {
    throw new Error(
      `Property "${Array.isArray(names) ? names.join('" or "') : names}" on Notion page ${page.id} is empty`
    )
  }
  return property.select.name
}

function getOptionalSelectValue(
  page: PageObjectResponse,
  names: string | string[]
): string | undefined {
  const aliases = Array.isArray(names) ? names : [names]
  const property = aliases.map((name) => page.properties[name]).find(Boolean)
  if (!property) return undefined
  if (property.type !== 'select') {
    throw new Error(
      `Property "${aliases.join('" or "')}" on Notion page ${page.id} is not a select field`
    )
  }
  return property.select?.name || undefined
}

function getMultiSelectValues(page: PageObjectResponse, names: string | string[]): string[] {
  const property = getProperty(page, names)
  if (property.type !== 'multi_select') {
    throw new Error(
      `Property "${Array.isArray(names) ? names.join('" or "') : names}" on Notion page ${page.id} is not a multi_select field`
    )
  }
  return property.multi_select.map((item) => item.name)
}

function getUrlValue(page: PageObjectResponse, names: string | string[]): string {
  const property = getProperty(page, names)
  if (property.type !== 'url') {
    throw new Error(
      `Property "${Array.isArray(names) ? names.join('" or "') : names}" on Notion page ${page.id} is not a url field`
    )
  }
  if (!property.url) {
    throw new Error(
      `Property "${Array.isArray(names) ? names.join('" or "') : names}" on Notion page ${page.id} is empty`
    )
  }
  return property.url
}

function getOptionalUrlValue(
  page: PageObjectResponse,
  names: string | string[]
): string | undefined {
  const aliases = Array.isArray(names) ? names : [names]
  const property = aliases.map((name) => page.properties[name]).find(Boolean)
  if (!property) return undefined
  if (property.type !== 'url') {
    throw new Error(
      `Property "${aliases.join('" or "')}" on Notion page ${page.id} is not a url field`
    )
  }
  return property.url || undefined
}

function getOptionalNumberValue(
  page: PageObjectResponse,
  names: string | string[]
): number | undefined {
  const aliases = Array.isArray(names) ? names : [names]
  const property = aliases.map((name) => page.properties[name]).find(Boolean)
  if (!property) return undefined
  if (property.type !== 'number') {
    throw new Error(
      `Property "${aliases.join('" or "')}" on Notion page ${page.id} is not a number field`
    )
  }
  return property.number ?? undefined
}

function getDateValue(page: PageObjectResponse, names: string | string[]): Date {
  const property = getProperty(page, names)
  if (property.type !== 'date') {
    throw new Error(
      `Property "${Array.isArray(names) ? names.join('" or "') : names}" on Notion page ${page.id} is not a date field`
    )
  }
  if (!property.date?.start) {
    throw new Error(
      `Property "${Array.isArray(names) ? names.join('" or "') : names}" on Notion page ${page.id} is empty`
    )
  }
  return new Date(property.date.start)
}

function getOptionalFileOrUrlValue(
  page: PageObjectResponse,
  names: string | string[]
): string | undefined {
  const aliases = Array.isArray(names) ? names : [names]
  const property = aliases.map((name) => page.properties[name]).find(Boolean)
  if (!property) return undefined

  if (property.type === 'url') {
    return property.url || undefined
  }

  if (property.type === 'files') {
    const firstFile = property.files[0]
    if (!firstFile) return undefined
    return firstFile.type === 'external' ? firstFile.external.url : firstFile.file.url
  }

  throw new Error(
    `Property "${aliases.join('" or "')}" on Notion page ${page.id} must be a url or files field`
  )
}

function getCoverUrl(page: PageObjectResponse): string | undefined {
  if (!page.cover) return undefined
  return page.cover.type === 'external' ? page.cover.external.url : page.cover.file.url
}

function getLangValue(page: PageObjectResponse): NotionLang {
  const lang = getSelectValue(page, 'Lang')
  const normalizedLang = lang.toLowerCase()
  if (normalizedLang !== 'zh' && normalizedLang !== 'en') {
    throw new Error(`Unsupported Lang value "${lang}" on Notion page ${page.id}`)
  }
  return normalizedLang
}

function isNoteTypeValue(value?: string): boolean {
  const normalizedValue = value?.trim().toLowerCase()
  return normalizedValue === 'note' || normalizedValue === 'notes'
}

function getPageWarningLabel(page: PageObjectResponse): string {
  const titleProperty = page.properties.Title
  if (titleProperty?.type !== 'title') {
    return page.id
  }

  const title = titleProperty.title
    .map((item) => item.plain_text)
    .join('')
    .trim()
  return title ? `${page.id} "${title}"` : page.id
}

function collectValidNotionPages<T>(
  type: NotionRegistryType,
  pages: PageObjectResponse[],
  mapper: NotionMapper<T>
): T[] {
  const entries: T[] = []

  for (const page of pages) {
    try {
      const entry = mapper(page)
      if (entry) {
        entries.push(entry)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const warningKey = `${type}:${page.id}:${message}`
      if (!invalidPageWarnings.has(warningKey)) {
        invalidPageWarnings.add(warningKey)
        console.warn(
          `[notion] Skipping invalid Published ${type} page ${getPageWarningLabel(page)} (${page.url}): ${message}`
        )
      }
    }
  }

  return entries
}

async function findDataSourceId(type: NotionRegistryType): Promise<string | null> {
  if (!dataSourceIdCache.has(type)) {
    dataSourceIdCache.set(
      type,
      (async () => {
        const database = await notion.databases.retrieve({
          database_id: NOTION_DATABASE_ID
        })

        if (!('data_sources' in database) || !database.data_sources.length) {
          throw new Error(`No data source found for Notion database: ${NOTION_DATABASE_ID}`)
        }

        const nameMap: Record<NotionRegistryType, string[]> = {
          Post: ['astro-blog', 'post'],
          Page: ['page'],
          Link: ['link'],
          Project: ['project'],
          Note: ['note', 'notes']
        }

        const candidates = nameMap[type]
        const dataSource = database.data_sources.find((item) =>
          candidates.some((candidate) => item.name.toLowerCase() === candidate)
        )

        return dataSource?.id ?? null
      })()
    )
  }

  return dataSourceIdCache.get(type)!
}

async function getDataSourceId(type: NotionRegistryType): Promise<string> {
  const dataSourceId = await findDataSourceId(type)

  if (!dataSourceId) {
    throw new Error(`No data source matched "${type}" in Notion database ${NOTION_DATABASE_ID}`)
  }

  return dataSourceId
}

export async function queryNotionDB(type: string): Promise<PageObjectResponse[]> {
  const cacheKey = type.trim()
  if (queryCache.has(cacheKey)) {
    return queryCache.get(cacheKey)!
  }

  const request = (async () => {
    let dataSourceId: string
    try {
      dataSourceId = await getDataSourceId(cacheKey as NotionRegistryType)
    } catch (error) {
      // Allow progressive setup: if a data source is not configured yet, return empty results.
      if (error instanceof Error && error.message.includes('No data source matched')) {
        console.warn(`[notion] ${error.message}. Returning empty list for "${cacheKey}".`)
        return []
      }
      throw error
    }

    const results: PageObjectResponse[] = []
    let cursor: string | undefined

    do {
      const response = await notion.dataSources.query({
        data_source_id: dataSourceId,
        start_cursor: cursor,
        filter: {
          property: 'Status',
          select: { equals: 'Published' }
        }
      })

      results.push(...response.results.filter(isFullPage))
      cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
    } while (cursor)

    return results
  })()

  queryCache.set(cacheKey, request)
  return request
}

export async function getNotionPosts(): Promise<NotionPost[]> {
  const pages = await queryNotionDB('Post')

  return collectValidNotionPages('Post', pages, (page) => ({
    notionId: normalizeId(page.id),
    title: getRequiredTitleValue(page, 'Title'),
    type: 'Post',
    lang: getLangValue(page),
    slug: getRequiredRichTextValue(page, 'Slug'),
    description: getOptionalRichTextValue(page, 'Description'),
    sourcePageId: extractPageId(getUrlValue(page, 'Source Page')),
    date: getDateValue(page, ['Date', 'Data']),
    tags: getMultiSelectValues(page, ['Tags', 'Tag']),
    category: getOptionalSelectValue(page, 'Category'),
    image: getOptionalFileOrUrlValue(page, ['Image', 'Hero Image', 'Cover']) || getCoverUrl(page)
  }))
}

export async function getNotionPages(): Promise<NotionPageEntry[]> {
  const pages = await queryNotionDB('Page')

  return collectValidNotionPages('Page', pages, (page) => {
    if (isNoteTypeValue(getOptionalSelectValue(page, 'Type'))) {
      return undefined
    }

    return {
      notionId: normalizeId(page.id),
      title: getRequiredTitleValue(page, 'Title'),
      type: 'Page',
      lang: getLangValue(page),
      slug: getRequiredRichTextValue(page, 'Slug'),
      sourcePageId: extractPageId(getUrlValue(page, 'Source Page'))
    }
  })
}

function normalizeNoteSlug(slug: string): string {
  const normalized = slug.trim().replace(/^\/+|\/+$/g, '')

  if (!normalized || normalized === 'notes') {
    return ''
  }

  if (normalized.startsWith('notes/')) {
    return normalized.slice('notes/'.length)
  }

  return normalized
}

export async function getNotionNotes(): Promise<NotionNoteEntry[]> {
  const noteDataSourceId = await findDataSourceId('Note')

  if (noteDataSourceId) {
    const pages = await queryNotionDB('Note')

    return collectValidNotionPages('Note', pages, (page) => ({
      notionId: normalizeId(page.id),
      title: getRequiredTitleValue(page, 'Title'),
      type: 'Note',
      lang: getLangValue(page),
      slug: normalizeNoteSlug(getRichTextValue(page, 'Slug')),
      sourcePageId: extractPageId(getUrlValue(page, 'Source Page'))
    }))
  }

  return collectValidNotionPages('Note', await queryNotionDB('Page'), (page) => {
    const pageType = getOptionalSelectValue(page, 'Type')
    const slug = getRichTextValue(page, 'Slug')
    if (!isNoteTypeValue(pageType) && slug !== 'notes' && !slug.startsWith('notes/')) {
      return undefined
    }

    return {
      notionId: normalizeId(page.id),
      title: getRequiredTitleValue(page, 'Title'),
      type: 'Note' as const,
      lang: getLangValue(page),
      slug: normalizeNoteSlug(slug),
      sourcePageId: extractPageId(getUrlValue(page, 'Source Page'))
    }
  })
}

export async function getNotionLinks(): Promise<NotionLink[]> {
  const pages = await queryNotionDB('Link')

  return collectValidNotionPages('Link', pages, (page) => ({
    notionId: normalizeId(page.id),
    title: getRequiredTitleValue(page, 'Title'),
    type: 'Link',
    lang: getLangValue(page),
    url: getUrlValue(page, ['URL', 'userDefined:URL']),
    description: getOptionalRichTextValue(page, 'Description'),
    avatar: getOptionalFileOrUrlValue(page, 'Avatar'),
    order: getOptionalNumberValue(page, 'Order')
  }))
}

export async function getNotionProjects(): Promise<NotionProject[]> {
  const pages = await queryNotionDB('Project')

  return collectValidNotionPages('Project', pages, (page) => ({
    notionId: normalizeId(page.id),
    title: getRequiredTitleValue(page, 'Title'),
    type: 'Project',
    lang: getLangValue(page),
    description: getOptionalRichTextValue(page, 'Description'),
    image: getOptionalFileOrUrlValue(page, 'Image'),
    order: getOptionalNumberValue(page, 'Order'),
    site: getOptionalUrlValue(page, 'Site'),
    github: getOptionalUrlValue(page, 'GitHub'),
    doc: getOptionalUrlValue(page, 'Doc'),
    release: getOptionalUrlValue(page, 'Release')
  }))
}

export async function getNotionPageContent(pageId: string): Promise<string> {
  const normalizedPageId = normalizeId(pageId)

  if (markdownCache.has(normalizedPageId)) {
    return markdownCache.get(normalizedPageId)!
  }

  const request = (async () => {
    const n2m = new NotionToMarkdown({ notionClient: notion })
    const mdBlocks = await n2m.pageToMarkdown(normalizedPageId)
    const markdown = n2m.toMarkdownString(mdBlocks)

    return typeof markdown === 'string' ? markdown : (markdown.parent ?? '')
  })()

  markdownCache.set(normalizedPageId, request)
  return request
}
