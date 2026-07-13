import { getCollection, type CollectionEntry } from 'astro:content'

import {
  getNotionNotes,
  getNotionPosts,
  type NotionLang,
  type NotionNoteEntry,
  type NotionPost
} from '../lib/notion'
import { compareBlogCategories, isCanonicalBlogCategory } from './blog-categories'

export interface BlogPostData {
  title: string
  description: string
  publishDate: Date
  updatedDate?: Date
  heroImage?: {
    src: string
    alt?: string
    inferSize?: boolean
    width?: number
    height?: number
    color?: string
  }
  tags: string[]
  category?: string
  language: NotionLang
  draft: boolean
  comment: boolean
  pixivLink?: string
}

export interface BlogPostEntry {
  id: string
  data: BlogPostData
  notionId?: string
  sourcePageId?: string
}

export type BlogCollectionEntry =
  | BlogPostEntry
  | CollectionEntry<'blog'>
  | CollectionEntry<'blogEn'>

export interface NoteEntry {
  id: string
  title: string
  lang: NotionLang
  path: string
  fullSlug: string
  source: 'notion' | 'local'
  notionId?: string
  sourcePageId?: string
  description?: string
  markdown?: string
  segments: string[]
}

export interface NoteTreeNode {
  segment: string
  path: string
  title: string
  depth: number
  page?: NoteEntry
  children: NoteTreeNode[]
}

export interface FlatNoteTreeNode {
  path: string
  title: string
  depth: number
  hasPage: boolean
  hasChildren: boolean
}

export const prod = import.meta.env.PROD

function normalizeBlogImageSource(src: string): string {
  try {
    const url = new URL(src)
    if (['qyxgithubio.vercel.app', 'qiqi7777777.github.io'].includes(url.hostname)) {
      return `${url.pathname}${url.search}`
    }
  } catch {
    return src
  }

  return src
}

function normalizeBlogTag(tag: string): string {
  const normalized = tag
    .trim()
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || tag.trim()
}

function normalizeBlogTags(tags: readonly string[] = []): string[] {
  return [...new Set(tags.map(normalizeBlogTag).filter(Boolean))]
}

function toBlogPostEntry(post: NotionPost): BlogPostEntry {
  const heroImageSrc = post.image ? normalizeBlogImageSource(post.image) : undefined

  return {
    id: post.slug,
    notionId: post.notionId,
    sourcePageId: post.sourcePageId,
    data: {
      title: post.title,
      description: post.description || post.title,
      publishDate: post.date,
      tags: normalizeBlogTags(post.tags),
      category: post.category,
      language: post.lang,
      ...(heroImageSrc
        ? {
            heroImage: {
              src: heroImageSrc,
              alt: post.title,
              width: 1200,
              height: 630,
              color: '#2f8f86'
            }
          }
        : {}),
      draft: false,
      comment: true
    }
  }
}

async function getPostsByLang(lang: NotionLang): Promise<BlogPostEntry[]> {
  return (await getNotionPosts()).filter((post) => post.lang === lang).map(toBlogPostEntry)
}

async function getLocalPostsByLang(lang: NotionLang): Promise<BlogCollectionEntry[]> {
  const isPublishableLocalPost = ({ data }: CollectionEntry<'blog'> | CollectionEntry<'blogEn'>) =>
    !data.draft && isCanonicalBlogCategory(data.category)

  const normalizeLocalPost = <T extends CollectionEntry<'blog'> | CollectionEntry<'blogEn'>>(
    post: T
  ): T =>
    ({
      ...post,
      id: post.id.replace(/\/index-en$/, '').replace(/\/index$/, ''),
      data: {
        ...post.data,
        tags: normalizeBlogTags(post.data.tags)
      }
    }) as T

  if (lang === 'en') {
    return (await getCollection('blogEn', isPublishableLocalPost)).map(normalizeLocalPost)
  }

  return (await getCollection('blog', isPublishableLocalPost)).map(normalizeLocalPost)
}

async function getAllPostsByLang(lang: NotionLang): Promise<BlogCollectionEntry[]> {
  const notionPosts = await getPostsByLang(lang)
  const localPosts = await getLocalPostsByLang(lang)
  const notionIds = new Set(notionPosts.map((post) => post.id))

  return [...notionPosts, ...localPosts.filter((post) => !notionIds.has(post.id))]
}

export async function getBlogCollection() {
  return await getAllPostsByLang('zh')
}

export async function getBlogCollectionEn() {
  return await getAllPostsByLang('en')
}

function splitNotePath(path: string) {
  return path ? path.split('/').filter(Boolean) : []
}

function humanizeNoteSegment(segment: string) {
  const decoded = decodeURIComponent(segment)
  const spaced = decoded.replace(/[-_]+/g, ' ').trim()

  if (!spaced) {
    return decoded
  }

  return /[A-Za-z]/.test(spaced) ? spaced.replace(/\b[a-z]/g, (char) => char.toUpperCase()) : spaced
}

function toNoteEntry(note: NotionNoteEntry): NoteEntry {
  const path = note.slug

  return {
    id: path || 'notes',
    title: note.title,
    lang: note.lang,
    path,
    fullSlug: note.slug,
    source: 'notion',
    notionId: note.notionId,
    sourcePageId: note.sourcePageId,
    segments: splitNotePath(path)
  }
}

function normalizeLocalNotePath(id: string): string {
  const path = id.replace(/\/index$/, '')
  return path === 'index' ? '' : path
}

function toLocalNoteEntry(note: CollectionEntry<'notes'>): NoteEntry {
  const path = normalizeLocalNotePath(note.id)
  const body = (note as CollectionEntry<'notes'> & { body?: string }).body || ''

  return {
    id: path || 'notes',
    title: note.data.title,
    lang: note.data.language,
    path,
    fullSlug: path,
    source: 'local',
    description: note.data.description,
    markdown: body,
    segments: splitNotePath(path)
  }
}

async function getLocalNotesByLang(lang: NotionLang): Promise<NoteEntry[]> {
  return (await getCollection('notes', ({ data }) => !data.draft && data.language === lang)).map(
    toLocalNoteEntry
  )
}

async function getNotesByLang(lang: NotionLang): Promise<NoteEntry[]> {
  const notionNotes = (await getNotionNotes()).filter((note) => note.lang === lang).map(toNoteEntry)

  const notionPaths = new Set(notionNotes.map((note) => note.path))
  const localNotes = (await getLocalNotesByLang(lang)).filter((note) => !notionPaths.has(note.path))

  return [...notionNotes, ...localNotes].sort((a, b) => a.path.localeCompare(b.path))
}

export async function getNotesCollection() {
  return await getNotesByLang('zh')
}

export async function getNotesCollectionEn() {
  return await getNotesByLang('en')
}

function sortNoteNodes(nodes: NoteTreeNode[]): NoteTreeNode[] {
  nodes.sort((a, b) => {
    const aLabel = a.page?.title || a.title
    const bLabel = b.page?.title || b.title
    return aLabel.localeCompare(bLabel)
  })

  nodes.forEach((node) => sortNoteNodes(node.children))
  return nodes
}

export function buildNoteTree(notes: NoteEntry[], rootTitle = 'Notes'): NoteTreeNode {
  const root: NoteTreeNode = {
    segment: '',
    path: '',
    title: rootTitle,
    depth: 0,
    children: []
  }

  for (const note of notes) {
    if (note.segments.length === 0) {
      root.page = note
      root.title = note.title || root.title
      continue
    }

    let current = root
    note.segments.forEach((segment, index) => {
      const nextPath = note.segments.slice(0, index + 1).join('/')
      let child = current.children.find((node) => node.segment === segment)

      if (!child) {
        child = {
          segment,
          path: nextPath,
          title: humanizeNoteSegment(segment),
          depth: index + 1,
          children: []
        }
        current.children.push(child)
      }

      current = child
    })

    current.page = note
    current.title = note.title || current.title
  }

  sortNoteNodes(root.children)
  return root
}

export function flattenNoteTree(root: NoteTreeNode): FlatNoteTreeNode[] {
  const flat: FlatNoteTreeNode[] = []

  function visit(node: NoteTreeNode) {
    flat.push({
      path: node.path,
      title: node.page?.title || node.title,
      depth: node.depth,
      hasPage: Boolean(node.page),
      hasChildren: node.children.length > 0
    })

    node.children.forEach(visit)
  }

  root.children.forEach(visit)
  return flat
}

export function getNoteNode(root: NoteTreeNode, path: string): NoteTreeNode | undefined {
  if (!path) {
    return root
  }

  const segments = splitNotePath(path)
  let current: NoteTreeNode | undefined = root

  for (const segment of segments) {
    current = current.children.find((node) => node.segment === segment)
    if (!current) {
      return undefined
    }
  }

  return current
}

export function getNoteAncestors(root: NoteTreeNode, path: string): NoteTreeNode[] {
  const ancestors: NoteTreeNode[] = [root]

  if (!path) {
    return ancestors
  }

  const segments = splitNotePath(path)
  let current: NoteTreeNode | undefined = root

  for (const segment of segments) {
    current = current.children.find((node) => node.segment === segment)
    if (!current) {
      break
    }
    ancestors.push(current)
  }

  return ancestors
}

export async function getPostCollections() {
  return await getCollection('postCollections')
}

export async function getPostsForCollection(
  collection: CollectionEntry<'postCollections'>,
  isEn: boolean = false
) {
  const allPosts = isEn ? await getBlogCollectionEn() : await getBlogCollection()
  const blogList = collection.data.bloglist || []

  const postMap = new Map<string, BlogCollectionEntry>()
  allPosts.forEach((post) => {
    postMap.set(post.id.toLowerCase(), post)
  })

  return blogList
    .map((itemId) => postMap.get(itemId.toLowerCase()))
    .filter((post): post is BlogCollectionEntry => post !== undefined)
}

function getYearFromCollection(collection: BlogCollectionEntry): number | undefined {
  const dateStr = collection.data.updatedDate ?? collection.data.publishDate
  return dateStr ? new Date(dateStr).getFullYear() : undefined
}

export function groupCollectionsByYear<T extends BlogCollectionEntry>(
  collections: T[]
): [number, T[]][] {
  const collectionsByYear = collections.reduce((acc, collection) => {
    const year = getYearFromCollection(collection)
    if (year !== undefined) {
      if (!acc.has(year)) {
        acc.set(year, [])
      }
      acc.get(year)!.push(collection)
    }
    return acc
  }, new Map<number, T[]>())

  return Array.from(collectionsByYear.entries()).sort((a, b) => b[0] - a[0])
}

export function sortMDByDate<T extends BlogCollectionEntry>(collections: T[]): T[] {
  return [...collections].sort((a, b) => {
    const aDate = new Date(a.data.updatedDate ?? a.data.publishDate).valueOf()
    const bDate = new Date(b.data.updatedDate ?? b.data.publishDate).valueOf()

    return bDate - aDate
  })
}

export function getAllTags(collections: BlogCollectionEntry[]) {
  return collections.flatMap((collection) => [...collection.data.tags])
}

export function getUniqueTags(collections: BlogCollectionEntry[]) {
  return [...new Set(getAllTags(collections))]
}

export function getUniqueTagsWithCount(collections: BlogCollectionEntry[]): [string, number][] {
  return [
    ...getAllTags(collections).reduce(
      (acc, tag) => acc.set(tag, (acc.get(tag) || 0) + 1),
      new Map<string, number>()
    )
  ].sort((a, b) => b[1] - a[1])
}

export function getAllCategories(collections: BlogCollectionEntry[]) {
  return collections
    .map((collection) => collection.data.category)
    .filter((category): category is string => category !== undefined)
}

export function getUniqueCategories(collections: BlogCollectionEntry[]) {
  return [...new Set(getAllCategories(collections))].sort(compareBlogCategories)
}

export function getUniqueCategoriesWithCount(
  collections: BlogCollectionEntry[]
): [string, number][] {
  return [
    ...getAllCategories(collections).reduce(
      (acc, category) => acc.set(category, (acc.get(category) || 0) + 1),
      new Map<string, number>()
    )
  ].sort((a, b) => compareBlogCategories(a[0], b[0]))
}

export function getCollectionsByCategory<T extends BlogCollectionEntry>(
  collections: T[],
  category: string
): T[] {
  return collections.filter((collection) => collection.data.category === category)
}
