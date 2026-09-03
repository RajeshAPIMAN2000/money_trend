import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { tags, trending } from '../data/blog-data.js'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'
import { useArticleList } from '../hooks/useArticles.js'

export default function Blog() {
  const [cat, setCat] = useState('All')
  const { items, loading, loadingMore, error, loadMore, hasMore } = useArticleList('blog')

  const categories = useMemo(() => {
    const unique = [...new Set(items.map((item) => item.category).filter(Boolean))]
    return ['All', ...unique]
  }, [items])

  const filtered = cat === 'All' ? items : items.filter((p) => p.category === cat)

  return (
    <>
      <PageBanner {...getPageBanner('blog')} />
      <PageSideLayout>
        <div>
          <div className="flex flex-wrap gap-2 border-b border-slate-200">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${cat === c ? 'border-secondary text-secondary' : 'border-transparent text-slate-500 hover:text-ink'}`}
              >
                {c}
              </button>
            ))}
          </div>

          {loading && (
            <div className="mt-8 text-center text-sm text-slate-500 py-12">Loading blogs...</div>
          )}

          {error && !loading && (
            <div className="mt-8 p-4 rounded-card bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="mt-8 text-center text-sm text-slate-500 py-12">No blog posts available yet.</div>
          )}

          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
              {filtered.map((p) => (
                <Link to={`/blog/${p.id}`} key={p.id}>
                  <Card>
                    <span className={`inline-block text-xs font-semibold text-white px-2.5 py-1 rounded-full ${p.color}`}>{p.category}</span>
                    <h3 className="font-display font-bold text-primary mt-3 text-lg leading-snug">{p.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{p.excerpt}</p>
                    <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                      <span>{p.author}</span>
                      <span>{p.date}{p.read ? ` · ${p.read}` : ''}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            <aside className="space-y-5">
              <Card hover={false}>
                <h3 className="font-display font-bold text-primary mb-3">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span key={t} className="px-3 py-1.5 bg-slate-100 hover:bg-secondary hover:text-white text-xs font-medium rounded-full cursor-pointer">#{t}</span>
                  ))}
                </div>
              </Card>
              <Card hover={false}>
                <h3 className="font-display font-bold text-primary mb-3">Trending Now</h3>
                <ol className="space-y-3">
                  {trending.map((t, i) => (
                    <li key={t} className="flex gap-3">
                      <span className="font-display font-bold text-2xl text-slate-300">{i + 1}</span>
                      <span className="text-sm text-ink hover:text-secondary cursor-pointer">{t}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            </aside>
          </div>

          {hasMore && !loading && (
            <div className="mt-10 text-center">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      </PageSideLayout>
    </>
  )
}
