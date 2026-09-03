import { Link, useParams } from 'react-router-dom'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'
import { ArticleBody, authorInitials } from '../components/common/ArticleBody.jsx'
import { useArticleDetail, useArticleList } from '../hooks/useArticles.js'

export default function BlogArticle() {
  const { id } = useParams()
  const { article, loading, error } = useArticleDetail('blog', id)
  const { items: relatedItems } = useArticleList('blog')
  const related = relatedItems.filter((item) => String(item.id) !== String(id)).slice(0, 3)

  if (loading) {
    return (
      <>
        <PageBanner {...getPageBanner('blog-article')} breadcrumbs={[{ label: 'Blog', to: '/blog' }, { label: 'Article' }]} />
        <PageSideLayout className="!max-w-5xl">
          <div className="py-12 text-center text-sm text-slate-500">Loading article...</div>
        </PageSideLayout>
      </>
    )
  }

  if (error || !article) {
    return (
      <>
        <PageBanner {...getPageBanner('blog-article')} breadcrumbs={[{ label: 'Blog', to: '/blog' }, { label: 'Article' }]} />
        <PageSideLayout className="!max-w-5xl">
          <Link to="/blog" className="text-sm text-secondary font-semibold hover:underline">← Back to Blog</Link>
          <div className="mt-8 p-4 rounded-card bg-red-50 border border-red-200 text-sm text-red-600">
            {error || 'Article not found'}
          </div>
        </PageSideLayout>
      </>
    )
  }

  return (
    <>
      <PageBanner
        {...getPageBanner('blog-article')}
        breadcrumbs={[{ label: 'Blog', to: '/blog' }, { label: article.title }]}
      />
      <PageSideLayout className="!max-w-5xl">
        <article className="max-w-3xl">
          <Link to="/blog" className="text-sm text-secondary font-semibold hover:underline">← Back to Blog</Link>
          <Badge tone="blue" className="mt-4">{article.category}</Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary mt-3 leading-tight">{article.title}</h1>

          <div className="flex items-center gap-3 mt-5 pb-5 border-b border-slate-200">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-accent grid place-items-center text-white font-semibold">
              {authorInitials(article.author)}
            </div>
            <div className="text-sm">
              <div className="font-semibold text-primary">{article.author}</div>
              <div className="text-slate-500 text-xs">
                {article.date}{article.read ? ` · ${article.read} read` : ''}
              </div>
            </div>
          </div>

          {article.image && (
            <img src={article.image} alt={article.title} className="w-full rounded-card mt-6 object-cover max-h-96" />
          )}

          <div className="mt-8">
            <ArticleBody content={article.content} excerpt={article.excerpt} />
          </div>

          <Card hover={false} className="mt-10 bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-accent grid place-items-center text-white font-bold text-xl">
                {authorInitials(article.author)}
              </div>
              <div>
                <div className="font-display font-bold text-primary">{article.author}</div>
                <div className="text-sm text-slate-600 mt-1">Contributing writer at MoneyTrend.</div>
              </div>
            </div>
          </Card>

          {related.length > 0 && (
            <>
              <h3 className="font-display font-bold text-xl text-primary mt-12 mb-4">Related Articles</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link to={`/blog/${r.id}`} key={r.id}>
                    <Card>
                      <span className={`inline-block text-xs font-semibold text-white px-2 py-0.5 rounded-full ${r.color}`}>{r.category}</span>
                      <div className="font-semibold text-sm text-primary mt-2 leading-snug">{r.title}</div>
                      <div className="text-xs text-slate-500 mt-2">{r.read}</div>
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
