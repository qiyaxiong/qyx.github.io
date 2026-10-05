import pageData from '../data/manga/oregairu-pages.json'
import catalogData from '../data/manga/oregairu.json'

export const mangaCatalog = catalogData
export const mangaPages = pageData.chapters as Record<string, string[]>
export const mangaAssetBase = (
  import.meta.env.PUBLIC_MANGA_ASSET_BASE_URL || 'https://qiqi-manga-assets.pages.dev'
).replace(/\/+$/, '')

export function mangaChapterPath(id: number, english = false) {
  return `${english ? '/en' : ''}/manga/${mangaCatalog.id}/${id}`
}

export function mangaPageUrl(chapterId: number, filename: string) {
  const paddedChapter = String(chapterId).padStart(3, '0')
  return `${mangaAssetBase}/${mangaCatalog.id}/${paddedChapter}/${filename}`
}
