import { useEffect, useState } from 'react'
import PageShell from '../../components/shared/PageShell.jsx'
import AdminInput from '../../components/ui/AdminInput.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/AdminCard.jsx'
import { useAdminSeo, useUpdateAdminSeo } from '../../hooks/useAdminSeo.js'
import { ApiError, api } from '../../../lib/api.js'
import { DEFAULT_ROBOTS_TXT, DEFAULT_CANONICAL_BASE } from '../../../lib/adminSeo.js'

export default function SeoManagementPage() {
  const { data, isLoading, error } = useAdminSeo()
  const updateMutation = useUpdateAdminSeo()
  const [pages, setPages] = useState([])
  const [googleAnalytics, setGoogleAnalytics] = useState('')
  const [robotsTxt, setRobotsTxt] = useState(DEFAULT_ROBOTS_TXT)
  const [canonicalBaseUrl, setCanonicalBaseUrl] = useState(DEFAULT_CANONICAL_BASE)
  const [formError, setFormError] = useState('')
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState('pages') // pages | analytics | robots | links

  useEffect(() => {
    if (!data) return
    setPages(data.pages?.map((p) => ({ ...p })) || [])
    setGoogleAnalytics(data.googleAnalytics || '')
    setRobotsTxt(data.robotsTxt || DEFAULT_ROBOTS_TXT)
    setCanonicalBaseUrl(data.canonicalBaseUrl || DEFAULT_CANONICAL_BASE)
  }, [data])

  const updatePage = (index, field, value) => {
    setPages((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
    setSaved(false)
  }

  const handleSave = async () => {
    setFormError('')
    setSaved(false)
    try {
      await updateMutation.mutateAsync({
        pages,
        googleAnalytics,
        robotsTxt,
        canonicalBaseUrl,
      })
      setSaved(true)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save SEO settings')
    }
  }

  const tabs = [
    { id: 'pages', label: 'Page Meta' },
    { id: 'analytics', label: 'Google Analytics' },
    { id: 'robots', label: 'robots.txt' },
    { id: 'links', label: 'Public URLs' },
  ]

  const sitemapUrl = api.getSeoSitemapUrl()
  const robotsUrl = api.getSeoRobotsUrl()

  return (
    <PageShell
      title="SEO Management"
      breadcrumb={['Home', 'Content Management', 'SEO Management']}
      description="Page titles & meta descriptions, Google Analytics, robots.txt and canonical base URL."
      showExport={false}
      stats={[
        { label: 'Pages', value: String(pages.length) },
        { label: 'GA Code', value: googleAnalytics.trim() ? 'Set' : 'Empty' },
        { label: 'robots.txt', value: robotsTxt.trim() ? 'Ready' : 'Empty' },
        { label: 'Canonical', value: canonicalBaseUrl ? 'Set' : 'Empty' },
      ]}
      actions={
        <AdminButton size="sm" onClick={handleSave} disabled={updateMutation.isPending || isLoading}>
          {updateMutation.isPending ? 'Saving…' : 'Save SEO'}
        </AdminButton>
      }
    >
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error.message || 'Failed to load SEO settings'}
        </div>
      )}
      {formError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {formError}
        </div>
      )}
      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 mb-4">
          SEO settings saved successfully.
        </div>
      )}

      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Loading SEO settings…</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'pages' && (
            <Card>
              <CardHeader>
                <CardTitle>Page titles &amp; descriptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-500">
                  Saved as <code className="text-[11px]">page_key</code>, <code className="text-[11px]">page_path</code>,{' '}
                  <code className="text-[11px]">title</code>, <code className="text-[11px]">meta_description</code>.
                </p>
                {pages.map((page, index) => (
                  <div
                    key={page.page_key || page.page_path || index}
                    className="rounded-xl border border-slate-200 p-4 space-y-3"
                  >
                    <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <span>key: {page.page_key || '—'}</span>
                      <span>path: {page.page_path || page.path || '—'}</span>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Meta title</label>
                      <AdminInput
                        value={page.title || ''}
                        onChange={(e) => updatePage(index, 'title', e.target.value)}
                        className="mt-1"
                        placeholder="Page title for search engines"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Meta description</label>
                      <textarea
                        value={page.meta_description ?? page.description ?? ''}
                        onChange={(e) => updatePage(index, 'meta_description', e.target.value)}
                        rows={2}
                        className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Short description for search results"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {tab === 'analytics' && (
            <Card>
              <CardHeader>
                <CardTitle>Google Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-600">Canonical base URL</label>
                  <AdminInput
                    value={canonicalBaseUrl}
                    onChange={(e) => { setCanonicalBaseUrl(e.target.value); setSaved(false) }}
                    className="mt-1"
                    placeholder="https://yoursite.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">google_analytics_code</label>
                  <p className="text-xs text-slate-500 mt-1 mb-2">
                    GA4 measurement ID (G-XXXXXXXX) or full gtag snippet. Public: <code className="text-[11px]">GET /api/seo/analytics</code>
                  </p>
                  <textarea
                    value={googleAnalytics}
                    onChange={(e) => { setGoogleAnalytics(e.target.value); setSaved(false) }}
                    rows={10}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="G-XXXXXXXX"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {tab === 'robots' && (
            <Card>
              <CardHeader>
                <CardTitle>robots.txt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500 mb-3">
                  Saved as <code className="text-[11px]">robots_txt</code>. Served publicly at{' '}
                  <code className="text-[11px]">/api/robots.txt</code> (or <code className="text-[11px]">/robots.txt</code>).
                </p>
                <textarea
                  value={robotsTxt}
                  onChange={(e) => { setRobotsTxt(e.target.value); setSaved(false) }}
                  rows={14}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <AdminButton
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={() => { setRobotsTxt(DEFAULT_ROBOTS_TXT); setSaved(false) }}
                >
                  Reset to default
                </AdminButton>
              </CardContent>
            </Card>
          )}

          {tab === 'links' && (
            <Card>
              <CardHeader>
                <CardTitle>Public SEO endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Page meta</p>
                  <p className="font-mono text-xs mt-1 break-all">GET /api/seo/page?path=/home</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Analytics</p>
                  <p className="font-mono text-xs mt-1 break-all">GET /api/seo/analytics</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Sitemap</p>
                  <a href={sitemapUrl} target="_blank" rel="noreferrer" className="font-mono text-xs mt-1 text-blue-600 break-all hover:underline">
                    {sitemapUrl}
                  </a>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Robots</p>
                  <a href={robotsUrl} target="_blank" rel="noreferrer" className="font-mono text-xs mt-1 text-blue-600 break-all hover:underline">
                    {robotsUrl}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </PageShell>
  )
}
