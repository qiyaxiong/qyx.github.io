import type { APIRoute } from 'astro'

import { getNotionPageContent } from '../../../../lib/notion'
import {
  getBlogCollection,
  getBlogCollectionEn,
  getNotesCollection,
  getNotesCollectionEn,
  type BlogCollectionEntry,
  type NoteEntry
} from '../../../../utils/server'

export const prerender = false

interface CatalogDocument {
  document_id: string
  title: string
  href: string
  content: string
  description: string
  language: string
  category?: string
  tags: string[]
  headings: string[]
}

interface CatalogPayload {
  version: string
  generated_at: string
  documents: CatalogDocument[]
}

let cached: { expiresAt: number; payload: CatalogPayload } | undefined

function authorized(request: Request): boolean {
  const token = import.meta.env.PI_AGENT_CATALOG_TOKEN
  if (!token) return !import.meta.env.PROD
  return request.headers.get('x-pi-agent-catalog-token') === token
}

function headings(content: string): string[] {
  return [...content.matchAll(/^#{1,6}\s+(.+)$/gm)]
    .map((match) => match[1].trim())
    .slice(0, 100)
}

function localBody(entry: BlogCollectionEntry): string {
  const value = entry as BlogCollectionEntry & { body?: unknown }
  return typeof value.body === 'string' ? value.body : ''
}

async function blogDocument(entry: BlogCollectionEntry, language: 'zh' | 'en') {
  const sourcePageId = 'sourcePageId' in entry ? entry.sourcePageId : undefined
  const content = sourcePageId ? await getNotionPageContent(sourcePageId) : localBody(entry)
  return {
    document_id: `blog:${language}:${entry.id}`,
    title: entry.data.title,
    href: `/${language === 'en' ? 'en/' : ''}blog/${entry.id}`,
    content: content.slice(0, 180_000),
    description: entry.data.description,
    language,
    category: entry.data.category,
    tags: entry.data.tags,
    headings: headings(content)
  } satisfies CatalogDocument
}

async function noteDocument(entry: NoteEntry) {
  const content = entry.sourcePageId
    ? await getNotionPageContent(entry.sourcePageId)
    : entry.markdown || entry.description || ''
  return {
    document_id: `note:${entry.lang}:${entry.path || 'root'}`,
    title: entry.title,
    href: `/${entry.lang === 'en' ? 'en/' : ''}notes${entry.path ? `/${entry.path}` : ''}`,
    content: content.slice(0, 180_000),
    description: entry.description || entry.title,
    language: entry.lang,
    category: 'notes',
    tags: [],
    headings: headings(content)
  } satisfies CatalogDocument
}

async function buildCatalog(): Promise<CatalogPayload> {
  const [posts, postsEn, notes, notesEn] = await Promise.all([
    getBlogCollection(),
    getBlogCollectionEn(),
    getNotesCollection(),
    getNotesCollectionEn()
  ])
  const documents = await Promise.all([
    ...posts.map((entry) => blogDocument(entry, 'zh')),
    ...postsEn.map((entry) => blogDocument(entry, 'en')),
    ...notes.map(noteDocument),
    ...notesEn.map(noteDocument)
  ])
  const generatedAt = new Date().toISOString()
  return { version: generatedAt, generated_at: generatedAt, documents }
}

export const GET: APIRoute = async ({ request }) => {
  if (!authorized(request)) {
    return Response.json({ error: 'catalog authentication required' }, { status: 401 })
  }
  const now = Date.now()
  if (!cached || cached.expiresAt <= now) {
    cached = { expiresAt: now + 10 * 60_000, payload: await buildCatalog() }
  }
  return Response.json(cached.payload, {
    headers: {
      'Cache-Control': 'private, max-age=300',
      'X-Pi-Agent-Catalog-Version': cached.payload.version
    }
  })
}
