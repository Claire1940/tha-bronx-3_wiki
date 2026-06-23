import { getAllContent, CONTENT_TYPES } from '@/lib/content'
import type { Language, ContentItem } from '@/lib/content'

export interface ArticleLink {
  url: string
  title: string
}

export type ModuleLinkMap = Record<string, ArticleLink | null>

interface ArticleWithType extends ContentItem {
  contentType: string
}

// Module sub-field mapping: moduleKey -> { field, nameKey }
// field = 该模块下用于匹配的子项数组字段名；nameKey = 子项数组元素的名称字段
const MODULE_FIELDS: Record<string, { field: string; nameKey: string }> = {
  thaBronx3Codes: { field: 'cards', nameKey: 'label' },
  thaBronx3BeginnerGuide: { field: 'steps', nameKey: 'title' },
  thaBronx3MoneyAndJobs: { field: 'methods', nameKey: 'method' },
  thaBronx3WeaponsTierList: { field: 'tiers', nameKey: 'tierLabel' },
  thaBronx3StoreGuide: { field: 'passes', nameKey: 'name' },
  thaBronx3MapGuide: { field: 'locations', nameKey: 'name' },
  thaBronx3CarsAndStorage: { field: 'vehicles', nameKey: 'name' },
  thaBronx3OfficialLinks: { field: 'panels', nameKey: 'label' },
}

// Extra semantic keywords per module to boost matching for h2 titles
// These supplement the module title text when matching against articles
const MODULE_EXTRA_KEYWORDS: Record<string, string[]> = {
  thaBronx3Codes: ['codes', 'rewards', 'redeem', 'store boosts', 'reward systems', 'gems'],
  thaBronx3BeginnerGuide: ['beginner', 'starter', 'guide', 'tips', 'walkthrough', 'tutorial'],
  thaBronx3MoneyAndJobs: ['money', 'jobs', 'cash', 'grinding', 'money grinding', 'income'],
  thaBronx3WeaponsTierList: ['weapons', 'guns', 'tier list', 'best', 'ranking', 'arsenal'],
  thaBronx3StoreGuide: ['gamepasses', 'store', 'robux', 'passes', 'gamepass', 'store boosts'],
  thaBronx3MapGuide: ['map', 'locations', 'places', 'landmarks', 'zones', 'map landmarks'],
  thaBronx3CarsAndStorage: ['cars', 'vehicles', 'storage', 'garage', 'ride', 'transport'],
  thaBronx3OfficialLinks: ['updates', 'official', 'links', 'discord', 'community', 'server'],
}

const FILLER_WORDS = ['tha', 'bronx', '2026', '2025', 'complete', 'the', 'and', 'for', 'how', 'with', 'our', 'this', 'your', 'all', 'from', 'learn', 'master', 'guide']

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSignificantTokens(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter(w => w.length > 2 && !FILLER_WORDS.includes(w))
}

function matchScore(queryText: string, article: ArticleWithType, extraKeywords?: string[]): number {
  const normalizedQuery = normalize(queryText)
  const normalizedTitle = normalize(article.frontmatter.title)
  const normalizedDesc = normalize(article.frontmatter.description || '')
  const normalizedSlug = article.slug.replace(/-/g, ' ').toLowerCase()

  let score = 0

  // Exact phrase match in title after stripping the current site title.
  const strippedQuery = normalizedQuery.replace(/tha\s+bronx\s*3\s*/g, '').trim()
  const strippedTitle = normalizedTitle.replace(/tha\s+bronx\s*3\s*/g, '').trim()
  if (strippedQuery.length > 3 && strippedTitle.includes(strippedQuery)) {
    score += 100
  }

  // Token overlap from query text
  const queryTokens = getSignificantTokens(queryText)
  for (const token of queryTokens) {
    if (normalizedTitle.includes(token)) score += 20
    if (normalizedDesc.includes(token)) score += 5
    if (normalizedSlug.includes(token)) score += 15
  }

  // Extra keywords scoring (for module h2 titles)
  if (extraKeywords) {
    for (const kw of extraKeywords) {
      const normalizedKw = normalize(kw)
      if (normalizedTitle.includes(normalizedKw)) score += 15
      if (normalizedDesc.includes(normalizedKw)) score += 5
      if (normalizedSlug.includes(normalizedKw)) score += 10
    }
  }

  return score
}

function findBestMatch(
  queryText: string,
  articles: ArticleWithType[],
  extraKeywords?: string[],
  threshold = 20,
): ArticleLink | null {
  let bestScore = 0
  let bestArticle: ArticleWithType | null = null

  for (const article of articles) {
    const score = matchScore(queryText, article, extraKeywords)
    if (score > bestScore) {
      bestScore = score
      bestArticle = article
    }
  }

  if (bestScore >= threshold && bestArticle) {
    return {
      url: `/${bestArticle.contentType}/${bestArticle.slug}`,
      title: bestArticle.frontmatter.title,
    }
  }

  return null
}

export async function buildModuleLinkMap(locale: Language): Promise<ModuleLinkMap> {
  // 1. Load all articles across all content types
  const allArticles: ArticleWithType[] = []
  for (const contentType of CONTENT_TYPES) {
    const items = await getAllContent(contentType, locale)
    for (const item of items) {
      allArticles.push({ ...item, contentType })
    }
  }

  // 2. Load module data from en.json (use English for keyword matching)
  const enMessages = (await import('../locales/en.json')).default as any

  const linkMap: ModuleLinkMap = {}

  // 3. For each module, match h2 title and sub-items
  for (const [moduleKey, fieldConfig] of Object.entries(MODULE_FIELDS)) {
    const moduleData = enMessages.modules?.[moduleKey]
    if (!moduleData) continue

    // Match module h2 title (use extra keywords + lower threshold for broader matching)
    const moduleTitle = moduleData.title as string
    if (moduleTitle) {
      const extraKw = MODULE_EXTRA_KEYWORDS[moduleKey] || []
      linkMap[moduleKey] = findBestMatch(moduleTitle, allArticles, extraKw, 15)
    }

    // Match sub-items
    const subItems = moduleData[fieldConfig.field] as any[]
    if (Array.isArray(subItems)) {
      for (let i = 0; i < subItems.length; i++) {
        const itemName = subItems[i]?.[fieldConfig.nameKey] as string
        if (itemName) {
          const key = `${moduleKey}::${fieldConfig.field}::${i}`
          linkMap[key] = findBestMatch(itemName, allArticles)
        }
      }
    }
  }

  return linkMap
}
