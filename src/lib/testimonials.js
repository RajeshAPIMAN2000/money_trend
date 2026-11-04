/**
 * Customer testimonials — aligned with live API:
 * POST /testimonials { rating, description }
 * GET /testimonials → rating, description, user_name, created_at, average rating
 * GET/DELETE /admin/testimonials
 */

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
}

export const FALLBACK_TESTIMONIALS = [
  {
    id: 'fb-1',
    name: 'Rohan Mehta',
    rating: 5,
    description:
      'MoneyTrend made investing effortless. The dashboard and goal tracking helped me stay disciplined.',
    initials: 'RM',
    createdAtLabel: '',
  },
  {
    id: 'fb-2',
    name: 'Priya Sharma',
    rating: 5,
    description:
      'I started with a small FD after completing KYC. Clear rates and easy tracking — highly recommend.',
    initials: 'PS',
    createdAtLabel: '',
  },
  {
    id: 'fb-3',
    name: 'Amit Patel',
    rating: 4,
    description:
      'Goal-based investing helped me save for my child\'s education. The process felt secure and simple.',
    initials: 'AP',
    createdAtLabel: '',
  },
]

function initialsFromName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function mapTestimonial(item) {
  if (!item || typeof item !== 'object') return null

  const name = item.user_name
    ?? item.name
    ?? item.customer_name
    ?? item.full_name
    ?? item.author
    ?? 'Investor'

  const description = String(
    item.description
    ?? item.message
    ?? item.review
    ?? item.content
    ?? '',
  ).trim()

  if (!description && item.id == null) return null

  const rating = Math.min(5, Math.max(1, Number(item.rating ?? 5) || 5))
  const createdAt = item.created_at ?? item.submitted_at ?? item.createdAt ?? null
  const status = String(item.status ?? 'active').toLowerCase()

  return {
    id: item.id ?? item.testimonial_id ?? `t-${name}-${createdAt}`,
    name,
    rating,
    description,
    /** @deprecated use description — kept for older UI refs */
    message: description,
    initials: item.initials ?? initialsFromName(name),
    avatarUrl: item.avatar_url ?? item.profile_image ?? null,
    userId: item.user_id ?? item.userId ?? null,
    userEmail: item.user_email ?? item.email ?? null,
    status,
    createdAt,
    createdAtLabel: formatDate(createdAt),
    raw: item,
  }
}

function readAverageRating(root, items) {
  const fromApi = Number(
    root.average_rating
    ?? root.averageRating
    ?? root.avg_rating
    ?? root.summary?.average_rating
    ?? root.meta?.average_rating,
  )
  if (Number.isFinite(fromApi) && fromApi > 0) {
    return Math.round(fromApi * 10) / 10
  }
  if (!items.length) return null
  const sum = items.reduce((acc, t) => acc + (Number(t.rating) || 0), 0)
  return Math.round((sum / items.length) * 10) / 10
}

export function parseTestimonialsList(payload) {
  const root = unwrap(payload)
  const list = Array.isArray(root)
    ? root
    : (root.testimonials ?? root.items ?? root.reviews ?? (Array.isArray(root.data) ? root.data : []))

  const items = (list || []).map(mapTestimonial).filter(Boolean)
  return {
    items,
    count: Number(root.count ?? root.total ?? items.length),
    averageRating: readAverageRating(root, items),
  }
}

export function parseAdminTestimonialsList(payload) {
  const parsed = parseTestimonialsList(payload)
  const root = unwrap(payload)
  const summary = root.summary ?? {}
  const activeCount = parsed.items.filter((t) => t.status === 'active' || t.status === 'approved').length
  return {
    ...parsed,
    stats: [
      { label: 'Total', value: String(summary.total ?? parsed.count) },
      { label: 'Active', value: String(summary.active ?? activeCount) },
      {
        label: 'Avg rating',
        value: parsed.averageRating != null ? String(parsed.averageRating) : '—',
      },
    ],
  }
}

/** Body for POST /api/testimonials */
export function buildCreateTestimonialBody({ rating, description }) {
  return {
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    description: String(description || '').trim(),
  }
}
