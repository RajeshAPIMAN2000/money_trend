const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
const MEDIA_ORIGIN = (import.meta.env.VITE_MEDIA_ORIGIN || import.meta.env.VITE_API_ORIGIN || '').replace(/\/+$/, '')

/** Normalize API upload paths to a full URL the browser can load. */
export function resolveMediaUrl(path, { cacheKey } = {}) {
  if (path == null || path === '') return null

  if (typeof path === 'object') {
    return resolveMediaUrl(path.url ?? path.path ?? path.filename ?? path.image ?? null, { cacheKey })
  }

  const value = String(path).trim()
  if (!value) return null

  let url = value

  // Already absolute — keep as-is (e.g. https://api.moneytrend.in/uploads/...)
  if (!(value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:'))) {
    const normalized = value.replace(/^\/+/, '')

    if (normalized.startsWith('api/uploads/') || normalized.startsWith('api/upload/')) {
      url = `/${normalized}`
    } else if (normalized.startsWith('uploads/') || normalized.startsWith('upload/')) {
      url = MEDIA_ORIGIN
        ? `${MEDIA_ORIGIN}/${normalized}`
        : `${API_BASE}/${normalized}`
    } else {
      url = MEDIA_ORIGIN
        ? `${MEDIA_ORIGIN}/uploads/${normalized}`
        : `${API_BASE}/uploads/${normalized}`
    }
  }

  if (cacheKey != null && cacheKey !== '') {
    const sep = url.includes('?') ? '&' : '?'
    return `${url}${sep}v=${encodeURIComponent(String(cacheKey))}`
  }

  return url
}

export function extractImagePath(item) {
  if (!item || typeof item !== 'object') return null
  return item.image
    ?? item.image_url
    ?? item.imageUrl
    ?? item.image_path
    ?? item.imagePath
    ?? item.thumbnail
    ?? item.thumbnail_url
    ?? item.cover_image
    ?? item.coverImage
    ?? item.featured_image
    ?? item.featuredImage
    ?? item.photo
    ?? item.media?.url
    ?? item.media?.path
    ?? null
}

/** Prefer human author name; never show raw user ids. */
export function extractAuthorName(item, fallback = 'MoneyTrend') {
  if (!item || typeof item !== 'object') return fallback
  const candidates = [
    item.author_name,
    item.authorName,
    item.full_name,
    item.fullName,
    typeof item.author === 'string' ? item.author : item.author?.full_name ?? item.author?.name,
    item.created_by_name,
    item.createdByName,
  ]
  for (const value of candidates) {
    if (value == null || value === '') continue
    const text = String(value).trim()
    if (!text) continue
    if (/^\d+$/.test(text)) continue
    return text
  }
  return fallback
}
