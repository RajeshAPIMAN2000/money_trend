import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api.js'
import {
  parseAdminSeoBundle,
  parseSeoPagesList,
  parseSeoSettings,
  parseSeoPage,
  parseSeoAnalytics,
  buildSeoPageBody,
  buildSeoSettingsBody,
  SEO_PAGE_DEFAULTS,
  DEFAULT_ROBOTS_TXT,
  DEFAULT_CANONICAL_BASE,
  pathnameToSeoQueryPath,
} from '../../lib/adminSeo.js'

const EMPTY_SEO = {
  pages: SEO_PAGE_DEFAULTS.map((p) => ({
    ...p,
    path: p.page_path,
    description: p.meta_description,
  })),
  googleAnalytics: '',
  robotsTxt: DEFAULT_ROBOTS_TXT,
  canonicalBaseUrl: DEFAULT_CANONICAL_BASE,
}

async function loadAdminSeoBundle() {
  try {
    const [pagesRes, settingsRes] = await Promise.all([
      api.getAdminSeoPages(),
      api.getAdminSeoSettings(),
    ])
    return parseAdminSeoBundle(pagesRes, settingsRes)
  } catch (err) {
    if (err?.status === 404) {
      // Fallback: single /admin/seo payload
      try {
        const combined = await api.getAdminSeo()
        const root = combined?.data ?? combined ?? {}
        return parseAdminSeoBundle(
          root.pages ?? combined,
          root.settings ?? combined,
        )
      } catch (err2) {
        if (err2?.status === 404) return { ...EMPTY_SEO, pages: EMPTY_SEO.pages.map((p) => ({ ...p })) }
        throw err2
      }
    }
    throw err
  }
}

export function useAdminSeo() {
  return useQuery({
    queryKey: ['admin', 'seo'],
    queryFn: loadAdminSeoBundle,
  })
}

/** Save all pages + settings to the split SEO endpoints */
export function useUpdateAdminSeo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (settings) => {
      const pages = settings.pages || []
      const settingsBody = buildSeoSettingsBody(settings)

      // Prefer split endpoints
      try {
        await api.updateAdminSeoSettings(settingsBody)
        await Promise.all(pages.map((page) => api.upsertAdminSeoPage(buildSeoPageBody(page))))
        return { ok: true }
      } catch (err) {
        if (err?.status !== 404) throw err
        // Fallback combined PUT
        return api.updateAdminSeo({
          pages: pages.map(buildSeoPageBody),
          settings: settingsBody,
          ...settingsBody,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'seo'] })
      queryClient.invalidateQueries({ queryKey: ['seo'] })
    },
  })
}

/** Public: GET /seo/page?path=… */
export function usePublicSeoPage(pathname) {
  const path = pathnameToSeoQueryPath(pathname)
  return useQuery({
    queryKey: ['seo', 'page', path],
    queryFn: async () => {
      try {
        return parseSeoPage(await api.getSeoPage(path))
      } catch {
        const fallback = SEO_PAGE_DEFAULTS.find((p) => pathnameToSeoQueryPath(p.page_path) === path)
          || SEO_PAGE_DEFAULTS[0]
        return parseSeoPage(fallback)
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  })
}

/** Public: GET /seo/analytics */
export function usePublicSeoAnalytics() {
  return useQuery({
    queryKey: ['seo', 'analytics'],
    queryFn: async () => {
      try {
        return parseSeoAnalytics(await api.getSeoAnalytics())
      } catch {
        return { googleAnalytics: '' }
      }
    },
    staleTime: 10 * 60_000,
    retry: false,
  })
}

export { pathnameToSeoQueryPath, parseSeoPagesList, parseSeoSettings }
