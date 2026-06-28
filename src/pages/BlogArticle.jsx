import { Link } from 'react-router-dom'
import { posts } from '../data/blog-data.js'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'

export default function BlogArticle() {
  const related = posts.slice(1, 4)
  return (
    <>
      <PageBanner
        {...getPageBanner('blog-article')}
        breadcrumbs={[{ label: 'Blog', to: '/blog' }, { label: 'Article' }]}
      />
    <PageSideLayout className="!max-w-5xl">
    <article className="max-w-3xl">
      <Link to="/blog" className="text-sm text-secondary font-semibold hover:underline">← Back to Blog</Link>
      <Badge tone="blue" className="mt-4">Beginners</Badge>
      <h1 className="text-3xl md:text-4xl font-display font-bold text-primary mt-3 leading-tight sr-only">How to Start Your First SIP in 2025</h1>
      <div className="flex items-center gap-3 mt-5 pb-5 border-b border-slate-200">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-accent grid place-items-center text-white font-semibold">AM</div>
        <div className="text-sm"><div className="font-semibold text-primary">Anjali Mehta, CFP</div><div className="text-slate-500 text-xs">May 28, 2026 · 7 min read</div></div>
      </div>

      <div className="prose prose-slate max-w-none mt-8 space-y-5 text-ink leading-relaxed">
        <p className="text-lg text-slate-600">Starting a Systematic Investment Plan (SIP) is one of the smartest financial decisions a young Indian can make in 2025. This guide walks you through every step — from picking a fund to setting up your first auto-debit.</p>

        <h2 className="font-display font-bold text-2xl text-primary mt-8">1. Understand what a SIP really is</h2>
        <p>A SIP is not a product — it's a method of investing in mutual funds. Every month, a fixed amount is auto-debited from your bank and invested into a fund you've chosen. Over time, this builds wealth through rupee-cost averaging and compounding.</p>
        <p>The biggest myth: SIPs are "safe" because they're small. Truth: they reduce timing risk, but the underlying fund still carries risk. A small SIP in a small-cap fund is still volatile.</p>

        <div className="bg-accent/10 border-l-4 border-accent rounded-r-card p-4 my-6">
          <div className="font-semibold text-primary">💡 Pro tip</div>
          <p className="text-sm mt-1 mb-0">Start with a SIP equal to 10% of your monthly income. Increase by 10% each year — you'll never miss it, and your corpus will compound dramatically.</p>
        </div>

        <h2 className="font-display font-bold text-2xl text-primary mt-8">2. Pick your first fund</h2>
        <p>For first-timers, a large-cap or flexi-cap fund is the safest entry point. Look at 5-year and 10-year rolling returns — not last year's chart-toppers. Funds like Parag Parikh Flexi Cap or Mirae Asset Large Cap are battle-tested choices.</p>

        <h2 className="font-display font-bold text-2xl text-primary mt-8">3. Set it and forget it</h2>
        <p>Once your SIP is live, don't check it daily. The market will go up. It will crash. It will recover. Your only job is to keep contributing for 10+ years. That's it.</p>
      </div>

      <Card hover={false} className="mt-10 bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-accent grid place-items-center text-white font-bold text-xl">AM</div>
          <div>
            <div className="font-display font-bold text-primary">Anjali Mehta, CFP</div>
            <div className="text-sm text-slate-600 mt-1">Certified Financial Planner with 12 years of advisory experience. Specializes in goal-based investing for young professionals.</div>
          </div>
        </div>
      </Card>

      <h3 className="font-display font-bold text-xl text-primary mt-12 mb-4">Related Articles</h3>
      <div className="grid sm:grid-cols-3 gap-4">
        {related.map(r => (
          <Link to="/blog/article" key={r.title}>
            <Card>
              <span className={`inline-block text-xs font-semibold text-white px-2 py-0.5 rounded-full ${r.color}`}>{r.cat}</span>
              <div className="font-semibold text-sm text-primary mt-2 leading-snug">{r.title}</div>
              <div className="text-xs text-slate-500 mt-2">{r.read}</div>
            </Card>
          </Link>
        ))}
      </div>
    </article>
    </PageSideLayout>
    </>
  )
}
