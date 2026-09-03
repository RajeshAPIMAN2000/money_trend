import { Link, useParams } from 'react-router-dom'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'
import { ArticleBody } from '../components/common/ArticleBody.jsx'
import { useArticleDetail, useArticleList } from '../hooks/useArticles.js'

export default function NewsArticle() {
  const { id } = useParams()
  const { article, loading, error } = useArticleDetail('news', id)
  const { items: relatedItems } = useArticleList('news')
  const related = relatedItems.filter((item) => String(item.id) !== String(id)).slice(0, 3)

  if (loading) {
    return (
      <>
        <PageBanner {...getPageBanner('news')} breadcrumbs={[{ label: 'News', to: '/news' }, { label: 'Article' }]} />
        <PageSideLayout className="!max-w-5xl">
          <div className="py-12 text-center text-sm text-slate-500">Loading news article...</div>
        </PageSideLayout>
      </>
    )
  }

  if (error || !article) {
    return (
      <>
        <PageBanner {...getPageBanner('news')} breadcrumbs={[{ label: 'News', to: '/news' }, { label: 'Article' }]} />
        <PageSideLayout className="!max-w-5xl">
          <Link to="/news" className="text-sm text-secondary font-semibold hover:underline">← Back to News</Link>
          <div className="mt-8 p-4 rounded-card bg-red-50 border border-red-200 text-sm text-red-600">
            {error || 'News article not found'}
          </div>
        </PageSideLayout>
      </>
    )
  }

  return (
    <>
      <PageBanner
        {...getPageBanner('news')}
        breadcrumbs={[{ label: 'News', to: '/news' }, { label: article.title }]}
      />
      <PageSideLayout className="!max-w-5xl">
        <article className="max-w-3xl">
          <Link to="/news" className="text-sm text-secondary font-semibold hover:underline">← Back to News</Link>
          <Badge tone={article.tone} className="mt-4">{article.category}</Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary mt-3 leading-tight">{article.title}</h1>

          <div className="text-sm text-slate-500 mt-4 pb-5 border-b border-slate-200">
            {article.source} · {article.date}{article.read ? ` · ${article.read} read` : ''}
          </div>

          {article.image && (
            <img src={article.image} alt={article.title} className="w-full rounded-card mt-6 object-cover max-h-96" />
          )}

          <div className="mt-8">
            <ArticleBody content={article.content} excerpt={article.excerpt} />
          </div>

          {related.length > 0 && (
            <>
              <h3 className="font-display font-bold text-xl text-primary mt-12 mb-4">More News</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((item) => (
                  <Link to={`/news/${item.id}`} key={item.id}>
                    <Card>
                      <Badge tone={item.tone}>{item.category}</Badge>
                      <div className="font-semibold text-sm text-primary mt-2 leading-snug">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-2">{item.source} · {item.date}</div>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </article>
      </PageSideLayout>
    </>
  )
}
