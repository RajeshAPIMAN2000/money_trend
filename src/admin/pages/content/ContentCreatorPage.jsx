import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, Newspaper } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import { EmbeddedBlogsPanel } from './BlogsPage.jsx'
import { EmbeddedNewsPanel } from './NewsPage.jsx'
import { useAdminNews, useAdminBlogs } from '../../hooks/useAdminContent.js'

const TABS = [
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'blogs', label: 'Blogs', icon: BookOpen },
]

/**
 * Unified Content Creator workspace — News + Blogs in one UI.
 * Used by Admin and Employees with the Content Creator role.
 */
export default function ContentCreatorPage() {
  const [params, setParams] = useSearchParams()
  const initial = params.get('tab') === 'blogs' ? 'blogs' : 'news'
  const [tab, setTab] = useState(initial)

  const newsQuery = useAdminNews()
  const blogsQuery = useAdminBlogs()

  useEffect(() => {
    const next = params.get('tab') === 'blogs' ? 'blogs' : 'news'
    setTab(next)
  }, [params])

  const switchTab = (next) => {
    setTab(next)
    setParams(next === 'blogs' ? { tab: 'blogs' } : {}, { replace: true })
  }

  const stats = tab === 'news'
    ? (newsQuery.data?.stats ?? [])
    : (blogsQuery.data?.stats ?? [])

  return (
    <PageShell
      title="Content Creator"
      breadcrumb={['Home', 'Content Management', 'Content Creator']}
      description="Create and manage News and Blogs. Use a plain heading and rich-text description. Employee posts go Pending until Admin approves. SEO is managed separately."
      stats={stats}
      showExport={false}
    >
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const selected = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => switchTab(id)}
              className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border transition-colors ${
                selected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          )
        })}
      </div>

      <div className="pt-2">
        {tab === 'news' ? <EmbeddedNewsPanel /> : <EmbeddedBlogsPanel />}
      </div>
    </PageShell>
  )
}
