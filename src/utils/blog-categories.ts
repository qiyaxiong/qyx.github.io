export const CANONICAL_BLOG_CATEGORIES = [
  'agent-engineering',
  'llm-systems',
  'ai-quant',
  'software-engineering',
  'data-product'
] as const

export type BlogCategory = (typeof CANONICAL_BLOG_CATEGORIES)[number]

const CATEGORY_LABELS: Record<BlogCategory, { zh: string; en: string }> = {
  'agent-engineering': { zh: 'Agent 工程', en: 'Agent Engineering' },
  'llm-systems': { zh: 'LLM 系统', en: 'LLM Systems' },
  'ai-quant': { zh: 'AI 量化', en: 'AI Quant' },
  'software-engineering': { zh: '软件工程', en: 'Software Engineering' },
  'data-product': { zh: '数据产品', en: 'Data Product' }
}

export function isCanonicalBlogCategory(category: string | undefined): category is BlogCategory {
  return CANONICAL_BLOG_CATEGORIES.includes(category as BlogCategory)
}

export function getCategoryLabel(category: string | undefined, locale: 'zh' | 'en' = 'zh'): string {
  if (!isCanonicalBlogCategory(category)) {
    return category || ''
  }

  return CATEGORY_LABELS[category][locale]
}

export function compareBlogCategories(a: string, b: string): number {
  const aIndex = CANONICAL_BLOG_CATEGORIES.indexOf(a as BlogCategory)
  const bIndex = CANONICAL_BLOG_CATEGORIES.indexOf(b as BlogCategory)

  if (aIndex !== -1 || bIndex !== -1) {
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  }

  return a.localeCompare(b)
}
