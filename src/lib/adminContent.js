import { resolveMediaUrl, extractImagePath, extractAuthorName } from './media.js'
import { stripHtml } from './html.js'

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
  const rawTitle = item.title ?? item.heading ?? item.name ?? ''
  const category = item.category
    ?? item.category_name
    ?? item.cat
    ?? item.type_label
    ?? null
  const updatedAt = item.updated_at ?? item.updatedAt ?? item.created_at ?? ''
  const statusValue = String(status).toLowerCase()
  const description = item.description ?? item.excerpt ?? item.summary ?? ''
  const content = item.content ?? item.body ?? ''

  return {
    id: item.id,
    title: stripHtml(rawTitle) || 'Untitled',
    titleHtml: rawTitle,
    category: category && String(category).trim() ? String(category) : '—',
    author: extractAuthorName(item, 'MoneyTrend'),
    published: formatDateTime(item.published_at ?? item.submitted_at ?? item.created_at ?? item.updated_at),
    submittedAt: formatDateTime(item.submitted_at ?? item.created_at),
    reviewedAt: formatDateTime(item.reviewed_at),
    status: formatStatus(status),
    statusValue,
    rejectionReason: item.rejection_reason ?? item.rejectionReason ?? item.reason ?? null,
    reviewedBy: item.reviewed_by_name ?? item.reviewed_by ?? item.reviewedBy ?? null,
    description,
    descriptionPlain: stripHtml(description),
    content,
    image: resolveMediaUrl(extractImagePath(item), { cacheKey: updatedAt }),
    updatedAt,
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
  const pending = items.filter((item) => item.statusValue === 'pending').length
  const rejected = items.filter((item) => item.statusValue === 'rejected').length
  const drafts = items.filter((item) => item.statusValue === 'draft').length

  return {
    count: root.count ?? root.total ?? items.length,
    items,
    stats: [
      { label: 'Pending', value: String(pending) },
      { label: 'Published', value: String(published) },
      { label: 'Rejected', value: String(rejected) },
      { label: 'Total', value: String(root.count ?? root.total ?? items.length) },
      ...(drafts > 0 ? [{ label: 'Drafts', value: String(drafts) }] : []),
    ],
  }
}

export function parseAdminArticleDetail(payload, type = 'news') {
  const root = unwrap(payload)
  const item = root[itemKey(type)] ?? root.article ?? root.item ?? root
  return mapAdminArticleRow(item)
}

export function buildArticleFormData(fields, { isSubAdmin = false } = {}) {
  const fd = new FormData()
  const title = String(fields.title ?? fields.heading ?? '').trim()
  const description = fields.description ?? ''
  fd.append('title', title)
  fd.append('heading', title)
  fd.append('description', description)
  // No separate content field — description is the body
  fd.append('content', description)
  fd.append('category', fields.category ?? '')

  // Sub Admin posts always go pending; Admin may set draft/published
  if (isSubAdmin) {
    fd.append('status', 'pending')
    if (fields.resubmit) fd.append('resubmit', 'true')
  } else if (fields.status) {
    fd.append('status', fields.status)
  }

  if (fields.resubmit) {
    fd.append('resubmit', 'true')
  }

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
  resubmit: false,
  image: null,
}

export function articleToForm(item) {
  if (!item) return { ...EMPTY_ARTICLE_FORM }
  const rejected = item.statusValue === 'rejected'
  const plainTitle = item.titleHtml && /<[a-z]/i.test(item.titleHtml)
    ? String(item.title || '').trim()
    : String(item.titleHtml ?? item.title ?? item.heading ?? '').trim()
  return {
    title: plainTitle,
    description: item.description ?? '',
    content: '',
    category: item.category === '—' ? '' : (item.category ?? ''),
    status: item.statusValue ?? 'draft',
    resubmit: rejected,
    image: null,
    existingImage: item.image ?? null,
    rejectionReason: item.rejectionReason ?? null,
  }
}

export { resolveMediaUrl }
