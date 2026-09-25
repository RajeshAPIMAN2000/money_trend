import { resolveMediaUrl, extractImagePath, extractAuthorName } from './media.js'
import { prepareRichHtml, stripHtml } from './html.js'

const BLOG_CATEGORY_COLORS = {
  Beginners: 'bg-secondary',
  Investing: 'bg-accent',
  'Tax & Savings': 'bg-amber-500',
  'Mutual Funds': 'bg-teal-500',
  'FD & RD': 'bg-blue-500',
  Tax: 'bg-amber-500',
}

const NEWS_CATEGORY_TONES = {
  Markets: 'blue',
  Economy: 'amber',
  'Mutual Funds': 'green',
  Banking: 'slate',
  Tax: 'red',
  Commodities: 'amber',
  Products: 'blue',
}

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatReadTime(item) {
  const minutes = item.read_time_minutes ?? item.read_time ?? item.readTime
  if (minutes != null && minutes !== '') return `${minutes} min`
  if (item.read_time_label) return item.read_time_label
  if (typeof item.read === 'string') return item.read
  return ''
}

function getCategoryColor(category) {
  return BLOG_CATEGORY_COLORS[category] || 'bg-secondary'
}

function getCategoryTone(category) {
  return NEWS_CATEGORY_TONES[category] || 'slate'
}

function mapArticleItem(item, type = 'blog') {
  const category = item.category ?? item.cat ?? item.category_name ?? 'General'
  const author = extractAuthorName(item, 'MoneyTrend')
  const updatedAt = item.updated_at ?? item.updatedAt ?? item.created_at ?? ''

  const rawDescription = item.description ?? item.excerpt ?? item.summary ?? ''
  const rawContent = item.content ?? item.body ?? item.html_content ?? ''
  const descriptionHtml = prepareRichHtml(rawDescription)
  const contentHtml = prepareRichHtml(rawContent)
  const tagCount = (value) => (String(value).match(/<[a-z][^>]*>/gi) || []).length
  const bodyHtml = tagCount(contentHtml) >= tagCount(descriptionHtml)
    ? (contentHtml || descriptionHtml)
    : descriptionHtml

  return {
    id: item.id,
    title: stripHtml(prepareRichHtml(item.title ?? item.heading ?? item.name ?? '')) || 'Untitled',
    excerpt: stripHtml(descriptionHtml || contentHtml),
    content: bodyHtml,
    category,
    author,
    source: item.source ?? item.publisher ?? author,
    date: formatDate(item.published_at ?? item.publishedAt ?? item.created_at ?? item.date),
    read: formatReadTime(item),
    image: resolveMediaUrl(extractImagePath(item), { cacheKey: updatedAt }),
    views: item.views ?? item.view_count ?? null,
    tags: Array.isArray(item.tags) ? item.tags : [],
    color: getCategoryColor(category),
    tone: getCategoryTone(category),
    type,
  }
}

export function parseArticleList(payload, type = 'blog') {
  const root = unwrap(payload)
  const items = root.items
    ?? root.articles
    ?? (type === 'blog' ? root.blogs : root.news)
    ?? (Array.isArray(root) ? root : [])

  return {
    items: items.map((item) => mapArticleItem(item, type)),
    total: root.total ?? items.length,
    limit: root.limit ?? items.length,
    offset: root.offset ?? 0,
  }
}

export function parseArticleDetail(payload, type = 'blog') {
  const root = unwrap(payload)
  const item = root.article
    ?? root.blog
    ?? root.news
    ?? root.item
    ?? root

  // Avoid treating a list payload as a single article
  if (Array.isArray(item)) {
    return mapArticleItem(item[0] || {}, type)
  }

  return mapArticleItem(item, type)
}

export { BLOG_CATEGORY_COLORS, NEWS_CATEGORY_TONES }
