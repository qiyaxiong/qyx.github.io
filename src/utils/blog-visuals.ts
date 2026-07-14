import { getCategoryLabel, isCanonicalBlogCategory, type BlogCategory } from './blog-categories'

type BlogVisual = {
  accent: string
  accentSoft: string
  bgA: string
  bgB: string
  grid: string
}

const BLOG_VISUALS: Record<BlogCategory, BlogVisual> = {
  'agent-engineering': {
    accent: '#2f8f86',
    accentSoft: 'rgba(47, 143, 134, 0.22)',
    bgA: '#0f2f31',
    bgB: '#102226',
    grid: 'rgba(117, 222, 212, 0.16)'
  },
  'llm-systems': {
    accent: '#4f7cff',
    accentSoft: 'rgba(79, 124, 255, 0.22)',
    bgA: '#111f3a',
    bgB: '#101826',
    grid: 'rgba(139, 171, 255, 0.16)'
  },
  'ai-quant': {
    accent: '#d69b2d',
    accentSoft: 'rgba(214, 155, 45, 0.22)',
    bgA: '#2d2614',
    bgB: '#161c1b',
    grid: 'rgba(244, 197, 90, 0.16)'
  },
  'software-engineering': {
    accent: '#8a7cf6',
    accentSoft: 'rgba(138, 124, 246, 0.22)',
    bgA: '#211d3a',
    bgB: '#161827',
    grid: 'rgba(176, 166, 255, 0.16)'
  },
  'data-product': {
    accent: '#d46f5d',
    accentSoft: 'rgba(212, 111, 93, 0.22)',
    bgA: '#312019',
    bgB: '#152025',
    grid: 'rgba(236, 151, 130, 0.16)'
  }
}

const FALLBACK_VISUAL: BlogVisual = {
  accent: '#2f8f86',
  accentSoft: 'rgba(47, 143, 134, 0.22)',
  bgA: '#102a2b',
  bgB: '#111820',
  grid: 'rgba(146, 211, 203, 0.16)'
}

export function getBlogVisualStyle(category: string | undefined): string {
  const visual = isCanonicalBlogCategory(category) ? BLOG_VISUALS[category] : FALLBACK_VISUAL

  return [
    '--blog-visual-accent: ' + visual.accent,
    '--blog-visual-accent-soft: ' + visual.accentSoft,
    '--blog-visual-bg-a: ' + visual.bgA,
    '--blog-visual-bg-b: ' + visual.bgB,
    '--blog-visual-grid: ' + visual.grid,
    '--preview-highlight: ' + visual.accent,
    '--preview-highlight-bg: ' + visual.accentSoft
  ].join(';')
}

export function getBlogVisualLabel(
  category: string | undefined,
  locale: 'zh' | 'en' = 'zh'
): string {
  return getCategoryLabel(category, locale) || (locale === 'en' ? 'Blog' : '文章')
}
