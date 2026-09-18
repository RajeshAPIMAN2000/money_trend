import { resolveMediaUrl, extractImagePath } from './media.js'

const unwrap = (payload) => payload?.data ?? payload ?? {}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatStatus(status) {
  if (!status) return 'Draft'
  return String(status)
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function listKey(type) {
  return type === 'blog' ? 'blogs' : 'news'
}

function itemKey(type) {
  return type === 'blog' ? 'blog' : 'news'
}

function mapAdminArticleRow(item) {
  const status = item.status ?? item.status_label ?? 'draft'
  const title = item.title ?? item.heading ?? item.name ?? ''
  const category = item.category
    ?? item.category_name
    ?? item.cat
    ?? item.type_label
    ?? null

  return {
    id: item.id,
    title,
    category: category && String(category).trim() ? String(category) : '—',
    author: item.author ?? item.author_name ?? item.created_by_name ?? item.created_by ?? '—',
    // views: item.views ?? item.view_count ?? '—',
    published: formatDateTime(item.published_at ?? item.created_at ?? item.updated_at),
    status: formatStatus(status),
    statusValue: String(status).toLowerCase(),
    description: item.description ?? item.excerpt ?? item.summary ?? '',
    content: item.content ?? item.body ?? item.description ?? '',
    image: resolveMediaUrl(extractImagePath(item)),
    raw: item,
  }
}

function extractItems(root, type) {
  const key = listKey(type)
  if (Array.isArray(root)) return root
  return root[key] ?? root.items ?? root.articles ?? (Array.isArray(root.data) ? root.data : [])
}

export function parseAdminArticleList(payload, type = 'news') {
  const root = unwrap(payload)
  const items = extractItems(root, type).map(mapAdminArticleRow)
  const published = items.filter((item) => item.statusValue === 'published').length
  const drafts = items.filter((item) => item.statusValue === 'draft').length
  // const totalViews = items.reduce((sum, item) => {
  //   const views = Number(item.views)
  //   return sum + (Number.isNaN(views) ? 0 : views)
  // }, 0)

  return {
    count: root.count ?? root.total ?? items.length,
    items,
    stats: [
      { label: 'Published', value: String(published) },
      { label: 'Drafts', value: String(drafts) },
      { label: 'Total', value: String(root.count ?? root.total ?? items.length) },
      // { label: 'Total Views', value: totalViews.toLocaleString('en-IN') },
    ],
  }
}

export function parseAdminArticleDetail(payload, type = 'news') {
  const root = unwrap(payload)
  const item = root[itemKey(type)] ?? root.article ?? root.item ?? root
  return mapAdminArticleRow(item)
}

export function buildArticleFormData(fields) {
  const fd = new FormData()
  const title = fields.title ?? fields.heading ?? ''
  fd.append('title', title)
  fd.append('heading', title)
  fd.append('description', fields.description ?? '')
  fd.append('content', fields.content ?? fields.description ?? '')
  fd.append('category', fields.category ?? '')
  fd.append('status', fields.status ?? 'draft')

  const file = fields.image
  if (file instanceof File) {
    fd.append('image', file, file.name || 'image.jpg')
  } else if (file instanceof Blob) {
    fd.append('image', file, 'image.jpg')
  }

  return fd
}

export const EMPTY_ARTICLE_FORM = {
  title: '',
  description: '',
  content: '',
  category: '',
  status: 'published',
  image: null,
}

export function articleToForm(item) {
  if (!item) return { ...EMPTY_ARTICLE_FORM }
  return {
    title: item.title ?? item.heading ?? '',
    description: item.description ?? '',
    content: item.content ?? '',
    category: item.category === '—' ? '' : (item.category ?? ''),
    status: item.statusValue ?? 'draft',
    image: null,
    existingImage: item.image ?? null,
  }
}

export { resolveMediaUrl }
