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

function mapBannerRow(item) {
  return {
    id: item.id,
    title: item.title ?? '—',
    description: item.description ?? item.subtitle ?? '—',
    image: resolveMediaUrl(extractImagePath(item)),
    created: formatDateTime(item.created_at ?? item.createdAt),
    updated: formatDateTime(item.updated_at ?? item.updatedAt),
    raw: item,
  }
}

export function parseAdminBannersList(payload) {
  const root = unwrap(payload)
  const items = root.banners ?? root.items ?? (Array.isArray(root) ? root : [])

  return {
    count: root.count ?? items.length,
    items: items.map(mapBannerRow),
    stats: [
      { label: 'Total Banners', value: String(root.count ?? items.length) },
      { label: 'With Image', value: String(items.filter((item) => item.image || item.image_url).length) },
      { label: 'Latest Update', value: items[0]?.updated_at ? formatDateTime(items[0].updated_at) : '—' },
      { label: 'Active', value: String(root.active ?? items.length) },
    ],
  }
}

export function parseAdminBannerDetail(payload) {
  const root = unwrap(payload)
  const item = root.banner ?? root.item ?? root
  return mapBannerRow(item)
}

export function buildBannerFormData(fields) {
  const fd = new FormData()
  fd.append('title', fields.title ?? '')
  fd.append('description', fields.description ?? '')

  const file = fields.image
  if (file instanceof File) {
    fd.append('image', file, file.name || 'banner.jpg')
  } else if (file instanceof Blob) {
    fd.append('image', file, 'banner.jpg')
  }

  return fd
}

export const EMPTY_BANNER_FORM = {
  title: '',
  description: '',
  image: null,
}

export function bannerToForm(item) {
  if (!item) return { ...EMPTY_BANNER_FORM }
  return {
    title: item.title === '—' ? '' : (item.title ?? ''),
    description: item.description === '—' ? '' : (item.description ?? ''),
    image: null,
    existingImage: item.image ?? null,
  }
}
