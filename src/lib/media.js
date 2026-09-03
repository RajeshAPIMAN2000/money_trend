const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

/** Normalize API upload paths to a full URL the browser can load. */
export function resolveMediaUrl(path) {
  if (path == null || path === '') return null

  if (typeof path === 'object') {
    return resolveMediaUrl(path.url ?? path.path ?? path.filename ?? path.image ?? null)
  }

  const value = String(path).trim()
  if (!value) return null

  // Already absolute
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value
  }

  const normalized = value.replace(/^\/+/, '')

  // In production, /api/uploads/... is served by Nginx → Node
  // In dev, the Vite proxy handles /api/... and /uploads/...
  if (normalized.startsWith('api/uploads/') || normalized.startsWith('api/upload/')) {
    return `/${normalized}`
  }

  if (normalized.startsWith('uploads/') || normalized.startsWith('upload/')) {
    return `${API_BASE}/${normalized}`
  }

  // Bare filename → prepend /api/uploads/
  return `${API_BASE}/uploads/${normalized}`
}

export function extractImagePath(item) {
  if (!item || typeof item !== 'object') return null
  return item.image
    ?? item.image_url
    ?? item.imageUrl
    ?? item.thumbnail
    ?? item.cover_image
    ?? item.featured_image
    ?? null
}
