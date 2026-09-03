import { Link } from 'react-router-dom'
import { gainers, losers } from '../data/news-data.js'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'
import { useArticleList } from '../hooks/useArticles.js'

export default function News() {
  const { items, loading, loadingMore, error, loadMore, hasMore } = useArticleList('news')
  const featured = items[0]
  const rest = items.slice(1)

  return (
    <>
      <PageBanner {...getPageBanner('news')} />
      <PageSideLayout>
        <div>
          {loading && (
            <div className="text-center text-sm text-slate-500 py-12">Loading news...</div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-card bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="text-center text-sm text-slate-500 py-12">No news articles available yet.</div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {featured && (
                  <Link to={`/news/${featured.id}`}>
                    <Card className="bg-gradient-to-br from-primary to-secondary text-white">
                      <Badge tone="green">{featured.category}</Badge>
                      <h2 className="font-display font-bold text-2xl md:text-3xl mt-3">{featured.title}</h2>
                      <p className="text-white/80 mt-3">{featured.excerpt}</p>
                      <div className="mt-4 text-xs text-white/60">
                        {featured.source} • {featured.date}{featured.read ? ` • ${featured.read} read` : ''}
                      </div>
                    </Card>
                  </Link>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                  {rest.map((n) => (
                    <Link to={`/news/${n.id}`} key={n.id}>
                      <Card>
                        <Badge tone={n.tone}>{n.category}</Badge>
                        <h3 className="font-semibold text-primary mt-3 leading-snug">{n.title}</h3>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{n.excerpt}</p>
                        <div className="text-xs text-slate-500 mt-3">
                          {n.source} · {n.date}{n.read ? ` · ${n.read}` : ''}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center">
                    <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </div>

              <aside className="space-y-5">
                <Card hover={false}>
                  <h3 className="font-display font-bold text-primary mb-3">Today&apos;s Markets</h3>
                  {[['Sensex', '73,420', '+1.2%'], ['Nifty 50', '22,180', '+0.8%'], ['Bank Nifty', '48,560', '+0.5%'], ['Nifty IT', '38,920', '+2.1%']].map(([n, v, c]) => (
                    <div key={n} className="flex justify-between py-2 border-b border-slate-100 last:border-0 text-sm">
                      <span>{n}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{v}</span>
                        <span className="text-accent font-semibold w-12 text-right">{c}</span>
                      </div>
                    </div>
                  ))}
                </Card>
                <Card hover={false}>
                  <h3 className="font-display font-bold text-primary mb-3">Top Gainers</h3>
                  {gainers.map((g) => (
                    <div key={g.s} className="flex justify-between py-1.5 text-sm">
                      <span>{g.s}</span>
                      <span className="text-accent font-semibold">+{g.c}%</span>
                    </div>
                  ))}
                </Card>
                <Card hover={false}>
                  <h3 className="font-display font-bold text-primary mb-3">Top Losers</h3>
                  {losers.map((l) => (
                    <div key={l.s} className="flex justify-between py-1.5 text-sm">
                      <span>{l.s}</span>
                      <span className="text-red-600 font-semibold">{l.c}%</span>
                    </div>
                  ))}
                </Card>
                <Card hover={false}>
                  <h3 className="font-display font-bold text-primary mb-3">Expert Take</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-btn">
                      <div className="text-sm text-ink italic">&quot;Mid caps offer the best risk-adjusted returns over the next 18 months.&quot;</div>
                      <div className="text-xs text-slate-500 mt-2">— Nikhil Kamath, Equity Strategist</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-btn">
                      <div className="text-sm text-ink italic">&quot;Stick to your SIPs. Don&apos;t time the market.&quot;</div>
                      <div className="text-xs text-slate-500 mt-2">— Radhika Gupta, MF Industry</div>
                    </div>
                  </div>
                </Card>
              </aside>
            </div>
          )}

          <Card hover={false} className="mt-10 bg-primary text-white text-center">
            <h3 className="font-display font-bold text-2xl">Get the MoneyTrend Newsletter</h3>
            <p className="text-white/70 mt-2">Weekly insights, delivered every Sunday at 8 AM IST.</p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mt-4">
              <input placeholder="you@example.com" className="flex-1 px-4 py-2.5 rounded-btn bg-white/10 placeholder-white/40 text-white border border-white/20 focus:outline-none focus:border-accent" />
              <Button variant="accent">Subscribe</Button>
            </div>
          </Card>
        </div>
      </PageSideLayout>
    </>
  )
}
