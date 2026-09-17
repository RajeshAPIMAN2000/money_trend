/**
 * SEO helpers — matches MoneyTrend SEO API:
 * Admin page: { page_key, page_path, title, meta_description }
 * Admin settings: { google_analytics_code, robots_txt, canonical_base_url }
 * Public: GET /seo/page?path=… , GET /seo/analytics , /sitemap.xml , /robots.txt
 */

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
}

/** Default pages for SEO admin (page_key + page_path) */
export const SEO_PAGE_DEFAULTS = [
  { page_key: 'home', page_path: '/', title: 'MoneyTrend — Grow Your Wealth Smarter', meta_description: "MoneyTrend — India's trusted platform for Fixed Deposits, Recurring Deposits, Mutual Funds and Civil Score checking." },
  { page_key: 'products', page_path: '/products', title: 'Products | MoneyTrend', meta_description: 'Explore investments, credit tools, planning & analytics on MoneyTrend.' },
  { page_key: 'fd-rd', page_path: '/fd-rd', title: 'FD & RD Marketplace | MoneyTrend', meta_description: 'Compare FD & RD rates from 50+ banks & NBFCs on MoneyTrend.' },
  { page_key: 'calculators', page_path: '/calculators', title: 'Financial Calculators | MoneyTrend', meta_description: 'Free FD, RD, SIP, EMI, retirement & tax calculators.' },
  { page_key: 'news', page_path: '/news', title: 'Financial News | MoneyTrend', meta_description: 'Latest financial news and market updates from MoneyTrend.' },
  { page_key: 'blog', page_path: '/blog', title: 'Blog | MoneyTrend', meta_description: 'Educational finance blogs and guides from MoneyTrend.' },
  { page_key: 'support', page_path: '/support', title: 'Support | MoneyTrend', meta_description: 'Get help with your MoneyTrend account and investments.' },
  { page_key: 'credit-score', page_path: '/credit-score', title: 'Credit Score Check | MoneyTrend', meta_description: 'Check your CIBIL / credit score securely on MoneyTrend.' },
  { page_key: 'dashboard', page_path: '/dashboard', title: 'Portfolio | MoneyTrend', meta_description: 'Track your FD & RD investments on MoneyTrend.' },
  { page_key: 'terms', page_path: '/terms', title: 'Terms of Service | MoneyTrend', meta_description: 'MoneyTrend terms of service.' },
  { page_key: 'privacy', page_path: '/privacy', title: 'Privacy Policy | MoneyTrend', meta_description: 'MoneyTrend privacy policy.' },
  { page_key: 'refund', page_path: '/refund', title: 'Refund Policy | MoneyTrend', meta_description: 'MoneyTrend refund policy.' },
]

export const DEFAULT_ROBOTS_TXT = `User-agent: *
Allow: /

Sitemap: /sitemap.xml
`

export const DEFAULT_CANONICAL_BASE = 'https://moneytrend.in'

/** Map React Router pathname → SEO API `path` query (home uses /home). */
export function pathnameToSeoQueryPath(pathname) {
  const p = String(pathname || '/').split('?')[0] || '/'
  if (p === '/' || p === '') return '/home'
  const match = SEO_PAGE_DEFAULTS.find(
    (d) => d.page_path !== '/' && (p === d.page_path || p.startsWith(`${d.page_path}/`)),
  )
  if (match) return `/${match.page_key}`
  // Unknown route: use first path segment as key
  const segment = p.replace(/^\//, '').split('/')[0]
  return segment ? `/${segment}` : '/home'
}

export function pathKeyFromPath(pagePath) {
  if (!pagePath || pagePath === '/') return 'home'
  return String(pagePath).replace(/^\//, '').replace(/\//g, '-') || 'home'
}

export function parseSeoPage(payload) {
  const root = unwrap(payload)
  const page = root.page ?? root
  return {
    page_key: page.page_key ?? page.pageKey ?? pathKeyFromPath(page.page_path ?? page.path),
    page_path: page.page_path ?? page.pagePath ?? page.path ?? '/',
    title: page.title ?? page.meta_title ?? page.metaTitle ?? '',
    meta_description: page.meta_description
      ?? page.metaDescription
      ?? page.description
      ?? '',
    // UI aliases
    path: page.page_path ?? page.pagePath ?? page.path ?? '/',
    description: page.meta_description ?? page.metaDescription ?? page.description ?? '',
  }
}

export function parseSeoPagesList(payload) {
  const root = unwrap(payload)
  const list = Array.isArray(root)
    ? root
    : (root.pages ?? root.items ?? root.results ?? [])
  const byKey = new Map()

  for (const d of SEO_PAGE_DEFAULTS) {
    byKey.set(d.page_key, { ...d, path: d.page_path, description: d.meta_description })
  }

  for (const raw of list) {
    const parsed = parseSeoPage(raw)
    if (!parsed.page_key && !parsed.page_path) continue
    const key = parsed.page_key || pathKeyFromPath(parsed.page_path)
    byKey.set(key, {
      page_key: key,
      page_path: parsed.page_path || `/${key}`,
      title: parsed.title,
      meta_description: parsed.meta_description,
      path: parsed.page_path || `/${key}`,
      description: parsed.meta_description,
    })
  }

  return [...byKey.values()]
}

export function parseSeoSettings(payload) {
  const root = unwrap(payload)
  const settings = root.settings ?? root
  return {
    googleAnalytics: settings.google_analytics_code
      ?? settings.googleAnalyticsCode
      ?? settings.google_analytics
      ?? settings.googleAnalytics
      ?? settings.code
      ?? settings.snippet
      ?? '',
    robotsTxt: settings.robots_txt ?? settings.robotsTxt ?? settings.robots ?? DEFAULT_ROBOTS_TXT,
    canonicalBaseUrl: settings.canonical_base_url
      ?? settings.canonicalBaseUrl
      ?? settings.canonical_url
      ?? DEFAULT_CANONICAL_BASE,
  }
}

export function parseSeoAnalytics(payload) {
  const root = unwrap(payload)
  return {
    googleAnalytics: root.google_analytics_code
      ?? root.googleAnalyticsCode
      ?? root.code
      ?? root.snippet
      ?? root.analytics
      ?? (typeof root === 'string' ? root : '')
      ?? '',
  }
}

/** Build admin page upsert body */
export function buildSeoPageBody(page) {
  const page_path = page.page_path || page.path || '/'
  const page_key = page.page_key || pathKeyFromPath(page_path)
  return {
    page_key,
    page_path,
    title: String(page.title || ''),
    meta_description: String(page.meta_description ?? page.description ?? ''),
  }
}

/** Build admin settings body */
export function buildSeoSettingsBody(settings) {
  return {
    google_analytics_code: String(settings.googleAnalytics || settings.google_analytics_code || ''),
    robots_txt: String(settings.robotsTxt || settings.robots_txt || DEFAULT_ROBOTS_TXT),
    canonical_base_url: String(settings.canonicalBaseUrl || settings.canonical_base_url || DEFAULT_CANONICAL_BASE),
  }
}

/** Combined admin load shape used by the SEO page UI */
export function parseAdminSeoBundle(pagesPayload, settingsPayload) {
  const pages = parseSeoPagesList(pagesPayload)
  const settings = parseSeoSettings(settingsPayload)
  return {
    pages,
    googleAnalytics: settings.googleAnalytics,
    robotsTxt: settings.robotsTxt,
    canonicalBaseUrl: settings.canonicalBaseUrl,
  }
}

export function findPageSeo(pages, pathname) {
  if (!pages?.length) return null
  const exact = pages.find((p) => (p.page_path || p.path) === pathname)
  if (exact) return exact
  const sorted = [...pages].sort((a, b) => String(b.page_path || b.path || '').length - String(a.page_path || a.path || '').length)
  return sorted.find((p) => {
    const path = p.page_path || p.path
    return path && path !== '/' && pathname.startsWith(path)
  }) || pages.find((p) => (p.page_path || p.path) === '/') || null
}
