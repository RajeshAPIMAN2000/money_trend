import { useState } from 'react'
import { Link } from 'react-router-dom'
import { products, PRODUCT_CATEGORIES } from '../data/products-data.js'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import CivilScoreChecker from '../components/home/CivilScoreChecker.jsx'
import { useCibilCheck } from '../context/CibilCheckContext.jsx'

const productIcons = {
  'fixed-deposits': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
  ),
  'recurring-deposits': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
  ),
  // 'mutual-funds': (
  //   <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  // ),
  // sip: (
  //   <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 12H18M7.757 14.743l-1.59 1.59M6 12H4.5m12.002-3.658-1.591-1.591M12 18.75V21m-4.773-4.227-1.59 1.59M5.25 12l-1.591-1.591M12 5.25l1.591-1.591" />
  // ),
  'civil-score': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  ),
  'goal-planning': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
  ),
  calculators: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Z" />
  ),
  ekyc: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  ),
  dashboard: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
  ),
}

function ProductIcon({ id, className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {productIcons[id]}
    </svg>
  )
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-xs font-semibold text-[#0F172A]">{rating}</span>
    </div>
  )
}

function ProductCard({ product, onCheckCibil }) {
  const riskColors = {
    Low: 'bg-emerald-50 text-emerald-700',
    Moderate: 'bg-amber-50 text-amber-700',
    Free: 'bg-blue-50 text-blue-700',
    Secure: 'bg-violet-50 text-violet-700',
  }

  return (
    <article className={`group relative bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_12px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 ${product.featured ? 'ring-2 ring-[#0056D2]/20' : ''}`}>
      {product.badge && (
        <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700 border border-violet-200/60">
          {product.badge}
        </span>
      )}

      <div className={`w-14 h-14 rounded-2xl ${product.iconBg} ${product.iconColor} grid place-items-center mb-5 group-hover:scale-105 transition-transform`}>
        <ProductIcon id={product.id} className="w-7 h-7" />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{product.category}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${riskColors[product.risk] || riskColors.Free}`}>
          {product.risk}
        </span>
      </div>

      <h3 className="font-display font-bold text-lg text-[#0F172A]">{product.title}</h3>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed min-h-[2.5rem]">{product.desc}</p>

      <div className="mt-5 pt-5 border-t border-slate-100 flex items-end justify-between">
        <div>
          <div className="text-xs text-slate-400 font-medium">{product.metricLabel}</div>
          <div className="text-base font-display font-bold text-[#0056D2] mt-0.5">{product.metric}</div>
        </div>
        <div className="text-right">
          <StarRating rating={product.rating} />
          <div className="text-[10px] text-slate-400 mt-1">{product.users} users</div>
        </div>
      </div>

      {product.id === 'civil-score' ? (
        <button
          type="button"
          onClick={onCheckCibil}
          className="mt-5 w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border-2 border-[#0056D2]/20 text-[#0056D2] hover:bg-[#0056D2] hover:text-white hover:border-[#0056D2] transition-all"
        >
          {product.cta}
          <span aria-hidden>→</span>
        </button>
      ) : (
        <Link
          to={product.to}
          className="mt-5 w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border-2 border-[#0056D2]/20 text-[#0056D2] hover:bg-[#0056D2] hover:text-white hover:border-[#0056D2] transition-all"
        >
          {product.cta}
          <span aria-hidden>→</span>
        </Link>
      )}
    </article>
  )
}

export default function Products() {
  const [category, setCategory] = useState('All')
  const { openCibilCheck } = useCibilCheck()
  const banner = getPageBanner('products')

  const filtered = category === 'All'
    ? products
    : products.filter(p => p.category === category)

  return (
    <div className="bg-white">
      <PageBanner {...banner} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-16">
        {/* Civil Score — Featured */}
        <CivilScoreChecker variant="featured" />

        {/* Product catalogue */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-[#0F172A] tracking-tight">
                Product Catalogue
              </h2>
              <p className="text-sm text-slate-500 mt-1">Browse and compare all MoneyTrend offerings</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    category === c
                      ? 'bg-[#0056D2] text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onCheckCibil={openCibilCheck} />
            ))}
          </div>
        </section>

        {/* Trust banner */}
        <section className="rounded-2xl bg-[#0B1F3A] px-8 py-10 text-white text-center">
          <h3 className="font-serif text-2xl md:text-3xl font-semibold">Ready to grow with MoneyTrend?</h3>
          <p className="mt-3 text-white/65 max-w-lg mx-auto">
            Start with any product — FD, RD, or check your civil score. Zero commission, SEBI registered.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link to="/kyc" className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors">
              Get Started Free →
            </Link>
            <Link to="/support" className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 font-semibold transition-colors">
              Talk to Advisor
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
