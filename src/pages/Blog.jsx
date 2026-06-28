import { useState } from 'react'
import { Link } from 'react-router-dom'
import { posts, tags, trending } from '../data/blog-data.js'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'

const cats = ['All', 'Beginners', 'Investing', 'Tax & Savings']

export default function Blog() {
  const [cat, setCat] = useState('All')
  const filtered = cat === 'All' ? posts : posts.filter(p => p.cat === cat)
  return (
    <>
      <PageBanner {...getPageBanner('blog')} />
    <PageSideLayout>
      <div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {cats.map(c => <button key={c} onClick={() => setCat(c)} className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${cat === c ? 'border-secondary text-secondary' : 'border-transparent text-slate-500 hover:text-ink'}`}>{c}</button>)}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
          {filtered.map(p => (
            <Link to="/blog/article" key={p.title}>
              <Card>
                <span className={`inline-block text-xs font-semibold text-white px-2.5 py-1 rounded-full ${p.color}`}>{p.cat}</span>
                <h3 className="font-display font-bold text-primary mt-3 text-lg leading-snug">{p.title}</h3>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{p.excerpt}</p>
                <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                  <span>{p.author}</span><span>{p.date} · {p.read}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        <aside className="space-y-5">
          <Card hover={false}>
            <h3 className="font-display font-bold text-primary mb-3">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">{tags.map(t => <span key={t} className="px-3 py-1.5 bg-slate-100 hover:bg-secondary hover:text-white text-xs font-medium rounded-full cursor-pointer">#{t}</span>)}</div>
          </Card>
          <Card hover={false}>
            <h3 className="font-display font-bold text-primary mb-3">Trending Now</h3>
            <ol className="space-y-3">
              {trending.map((t, i) => (
                <li key={t} className="flex gap-3"><span className="font-display font-bold text-2xl text-slate-300">{i + 1}</span><span className="text-sm text-ink hover:text-secondary cursor-pointer">{t}</span></li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>
      </div>
    </PageSideLayout>
    </>
  )
}
