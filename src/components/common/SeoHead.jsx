import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { usePublicSeoAnalytics, usePublicSeoPage } from '../../admin/hooks/useAdminSeo.js'

function upsertMeta(selector, attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function injectGoogleAnalytics(code) {
  const ids = ['moneytrend-ga', 'moneytrend-ga-inline']
  ids.forEach((id) => document.getElementById(id)?.remove())
  document.querySelectorAll('[id^="moneytrend-ga-"]').forEach((el) => el.remove())

  const trimmed = String(code || '').trim()
  if (!trimmed) return

  if (/^G-[A-Z0-9]+$/i.test(trimmed)) {
    const s = document.createElement('script')
    s.id = 'moneytrend-ga'
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${trimmed}`
    document.head.appendChild(s)

    const inline = document.createElement('script')
    inline.id = 'moneytrend-ga-inline'
    inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${trimmed}');`
    document.head.appendChild(inline)
    return
  }

  const wrapper = document.createElement('div')
  wrapper.innerHTML = trimmed
  const scripts = wrapper.querySelectorAll('script')
  if (scripts.length) {
    scripts.forEach((srcEl, i) => {
      const s = document.createElement('script')
      s.id = i === 0 ? 'moneytrend-ga' : `moneytrend-ga-${i}`
      if (srcEl.src) {
        s.async = srcEl.async
        s.src = srcEl.src
      } else {
        s.text = srcEl.textContent || ''
      }
      document.head.appendChild(s)
    })
  } else {
    const inline = document.createElement('script')
    inline.id = 'moneytrend-ga-inline'
    inline.text = trimmed
    document.head.appendChild(inline)
  }
}

/**
 * Public SEO head:
 * GET /api/seo/page?path=/home
 * GET /api/seo/analytics
 * (robots/sitemap are fetched by crawlers at /api/robots.txt & /api/sitemap.xml)
 */
export default function SeoHead() {
  const { pathname } = useLocation()
  const pageQuery = usePublicSeoPage(pathname)
  const analyticsQuery = usePublicSeoAnalytics()

  useEffect(() => {
    const page = pageQuery.data
    if (!page) return
    const title = page.title
    const description = page.meta_description || page.description
    if (title) {
      document.title = title
      upsertMeta('meta[property="og:title"]', 'property', 'og:title', title)
      upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    }
    if (description) {
      upsertMeta('meta[name="description"]', 'name', 'description', description)
      upsertMeta('meta[property="og:description"]', 'property', 'og:description', description)
      upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    }
  }, [pageQuery.data])

  useEffect(() => {
    injectGoogleAnalytics(analyticsQuery.data?.googleAnalytics)
  }, [analyticsQuery.data?.googleAnalytics])

  return null
}
