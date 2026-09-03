import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { news } from '../../data/news-data.js'
import { posts } from '../../data/blog-data.js'
import CivilScoreChecker from './CivilScoreChecker.jsx'
import BlurText from '../react-bits/BlurText.jsx'
import SlideInContent from '../react-bits/SlideInContent.jsx'
import { HIDDEN_HOME_PRODUCTS } from '../../lib/home.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAuthModal } from '../../context/AuthModalContext.jsx'

const PRODUCT_FILTERS = ['Recommended', 'Low Risk', 'High Returns', 'Tax Saving']

const FILTER_HINTS = {
  Recommended: 'Hand-picked products for balanced growth and safety.',
  'Low Risk': 'Stable returns with capital protection focus.',
  'High Returns': 'Growth-oriented options for higher potential returns.',
  'Tax Saving': 'ELSS & tax-efficient instruments under Section 80C.',
}

function formatINR(value) {
  return Number(value).toLocaleString('en-IN')
}

const FALLBACK_PRODUCTS = [
  {
    title: 'Fixed Deposits',
    desc: 'Earn competitive rates with flexible tenures from top banks.',
    rate: 'Up to 7.85% p.a.',
    cta: 'Invest Now',
    to: '/fd-rd',
    filters: ['Recommended', 'Low Risk'],
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#0056D2]',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    title: 'Recurring Deposits',
    desc: 'Build wealth steadily with monthly contributions.',
    rate: 'Up to 7.25% p.a.',
    cta: 'Invest Now',
    to: '/fd-rd',
    filters: ['Recommended', 'Low Risk'],
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
      </svg>
    ),
  },
  // Mutual Funds — hidden for now
  // {
  //   title: 'Mutual Funds',
  //   desc: 'Invest in top-rated funds across equity, debt & hybrid.',
  //   rate: 'Up to 18% CAGR',
  //   cta: 'Explore Funds',
  //   to: '/mutual-funds',
  //   filters: ['Recommended', 'High Returns'],
  //   iconBg: 'bg-teal-50',
  //   iconColor: 'text-teal-600',
  //   icon: (...),
  // },
  // {
  //   title: 'SIP Investments',
  //   ...
  // },
]

const FALLBACK_SERVICES = [
  { title: 'Smart Dashboard', desc: 'Track your investments, returns & portfolio health.', cta: 'Explore', to: '/dashboard', color: 'text-[#0056D2]', bg: 'bg-blue-50' },
  { title: 'Goal Planning', desc: 'Plan your financial goals with smart projections.', cta: 'Plan Now', to: '/goals', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'Calculators', desc: 'Use advanced calculators for FD, SIP & tax.', cta: 'Calculate', to: '/calculators', color: 'text-violet-600', bg: 'bg-violet-50' },
  { title: 'e-KYC Portal', desc: 'Quick & secure account opening in minutes.', cta: 'Verify Now', to: '/kyc', color: 'text-orange-500', bg: 'bg-orange-50' },
  { title: 'Support Center', desc: 'Get help via live chat, email or phone.', cta: 'Get Help', to: '/support', color: 'text-teal-600', bg: 'bg-teal-50' },
]

const FALLBACK_COMPARE = {
  FD: {
    viewAll: '/fd-rd',
    investTo: '/fd-rd',
    tenureOptions: ['1 Year', '2 Years', '3 Years', '5 Years'],
    tenureBonus: { '1 Year': 0, '2 Years': 0.1, '3 Years': 0.2, '5 Years': 0.35 },
    banks: [
      { name: 'HDFC Bank', baseRate: 7.85, logo: 'HD', color: '#E11D48' },
      { name: 'ICICI Bank', baseRate: 7.65, logo: 'IC', color: '#F97316' },
      { name: 'SBI', baseRate: 7.45, logo: 'SB', color: '#2563EB' },
      { name: 'Axis Bank', baseRate: 7.55, logo: 'AX', color: '#7C3AED' },
    ],
  },
  RD: {
    viewAll: '/fd-rd',
    investTo: '/fd-rd',
    tenureOptions: ['1 Year', '2 Years', '3 Years', '5 Years'],
    tenureBonus: { '1 Year': 0, '2 Years': 0.08, '3 Years': 0.15, '5 Years': 0.25 },
    banks: [
      { name: 'HDFC Bank', baseRate: 7.25, logo: 'HD', color: '#E11D48' },
      { name: 'ICICI Bank', baseRate: 7.1, logo: 'IC', color: '#F97316' },
      { name: 'SBI', baseRate: 6.95, logo: 'SB', color: '#2563EB' },
      { name: 'Axis Bank', baseRate: 7.05, logo: 'AX', color: '#7C3AED' },
    ],
  },
  // 'Mutual Funds': { ... },
}

const allocationData = [
  { name: 'Equity', value: 60, color: '#0056D2' },
  { name: 'Debt', value: 25, color: '#10B981' },
  { name: 'Gold', value: 10, color: '#F59E0B' },
  { name: 'Others', value: 5, color: '#94A3B8' },
]

const netWorthTrend = [
  { v: 10.2 }, { v: 10.5 }, { v: 10.3 }, { v: 10.8 }, { v: 11.1 },
  { v: 11.4 }, { v: 11.2 }, { v: 11.8 }, { v: 12.1 }, { v: 12.4 }, { v: 12.75 },
]

const homeGoals = [
  { name: 'Retirement Plan', target: '₹2.5 Cr', pct: 68, icon: '🌴', color: 'bg-amber-100 text-amber-700' },
  { name: 'Home Purchase', target: '₹80 L', pct: 40, icon: '🏡', color: 'bg-blue-100 text-blue-700' },
  { name: 'Child Education', target: '₹25 L', pct: 30, icon: '🎓', color: 'bg-violet-100 text-violet-700' },
]

const FALLBACK_TRUST_STATS = [
  { label: 'Happy Investors', value: '10L+', icon: 'users' },
  { label: 'Financial Products', value: '500+', icon: 'chart' },
  { label: 'Trusted Partners', value: '50+', icon: 'star' },
  { label: 'Customer Support', value: '24/7', icon: 'headset' },
]

function ProductIcon({ type, className = 'w-7 h-7' }) {
  const paths = {
    fd: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />,
    rd: <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />,
    mf: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />,
    sip: <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 12H18M7.757 14.743l-1.59 1.59M6 12H4.5m12.002-3.658-1.591-1.591M12 18.75V21m-4.773-4.227-1.59 1.59M5.25 12l-1.591-1.591M12 5.25l1.591-1.591" />,
  }

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {paths[type] ?? paths.mf}
    </svg>
  )
}

function SectionCard({ className = '', children, hover = false }) {
  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-[0_8px_32px_rgba(15,23,42,0.1)] hover:shadow-[0_16px_48px_rgba(15,23,42,0.12)] transition-all duration-300 ${hover ? 'hover:-translate-y-1' : ''} ${className}`}>
      {children}
    </div>
  )
}

function ServiceIcon({ type, className }) {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />,
    fd: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />,
    rd: <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />,
    wallet: <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />,
    goal: <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />,
    calc: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Z" />,
    kyc: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />,
    tax: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />,
    withdraw: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />,
    support: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a48.109 48.109 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.02-.165m0 0a48.11 48.11 0 0 1 3.478-.397 7.5 7.5 0 0 0-7.5 7.5h4.5m-4.5 0v4.5" />,
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {icons[type]}
    </svg>
  )
}

function TrustIcon({ type }) {
  const cls = 'w-6 h-6'
  const map = {
    users: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />,
    headset: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />,
  }
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {map[type]}
    </svg>
  )
}

function TopProductsSection({ products = [], loading = false }) {
  const [filter, setFilter] = useState('Recommended')
  const items = (products.length ? products : FALLBACK_PRODUCTS)
    .filter((p) => !HIDDEN_HOME_PRODUCTS.has(p.id))

  const filteredProducts = useMemo(() => {
    if (filter === 'Recommended') return items
    return items.filter((p) => p.filters?.includes(filter))
  }, [filter, items])

  return (
    <section>
      <SlideInContent direction="left" duration={0.7}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#0F172A] tracking-tight">
              <BlurText text="Top Financial Products" delay={60} stepDuration={0.28} animateBy="words" />
            </h2>
            <p className="text-base text-slate-500 mt-2 font-medium">Compare, Invest & Grow Your Wealth</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_FILTERS.map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  filter === f
                    ? 'bg-gradient-to-r from-[#0056D2] to-[#003FA3] text-white shadow-lg hover:shadow-xl'
                    : 'bg-white/90 text-slate-600 border border-slate-200 hover:border-[#0056D2] hover:text-[#0056D2]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-8 font-medium">{FILTER_HINTS[filter]}</p>
        {loading && <p className="text-sm text-slate-400 mb-4">Loading latest products…</p>}
      </SlideInContent>

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="grid sm:grid-cols-2 gap-6"
        >
          {filteredProducts.map((p, idx) => (
            <SlideInContent key={p.id ?? p.title} direction="up" delay={idx * 0.06} duration={0.45}>
              <SectionCard className="p-7 text-center group bg-white/90 backdrop-blur-sm h-full" hover>
                <div className={`w-16 h-16 mx-auto rounded-2xl ${p.iconBg} ${p.iconColor} grid place-items-center transform group-hover:scale-110 transition-transform duration-300`}>
                  {typeof p.icon === 'string' ? <ProductIcon type={p.icon} /> : p.icon}
                </div>
                <h3 className="font-display font-bold text-[#0F172A] mt-5 text-lg">{p.title}</h3>
                <p className="text-sm text-slate-500 mt-2.5 leading-relaxed min-h-[2.8rem]">{p.desc}</p>
                {p.rate && (
                  <p className={`text-base font-bold mt-4 px-4 py-2 rounded-lg inline-block ${p.comingSoon ? 'text-slate-500 bg-slate-100' : 'text-emerald-600 bg-emerald-50'}`}>{p.rate}</p>
                )}
                <Link
                  to={p.to}
                  className={`inline-flex items-center gap-2 mt-5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0056D2] to-[#003FA3] rounded-lg hover:shadow-lg transition-all duration-200 ${p.comingSoon ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {p.cta} <span aria-hidden className="transform group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </SectionCard>
            </SlideInContent>
          ))}
        </motion.div>
      </AnimatePresence>

      <SlideInContent direction="up" delay={0.2} duration={0.6}>
      <div className="mt-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 rounded-2xl bg-gradient-to-r from-[#0B1F3A] via-[#1a2f4f] to-[#0B1F3A] text-white border border-blue-900/20">
        <div className="flex items-center gap-3 text-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/30">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </span>
          <span>
            <span className="font-bold">Your security is our priority.</span>
            <span className="text-white/60 hidden sm:inline"> Bank-level encryption • Secure KYC • Trusted by 10L+ users</span>
          </span>
        </div>
        <Link to="/privacy" className="text-sm font-semibold text-blue-300 hover:text-blue-200 transition-colors shrink-0">
          Learn more about security →
        </Link>
      </div>
      </SlideInContent>
    </section>
  )
}

function ServicesRow({ services = [], loading = false }) {
  const items = services.length ? services : FALLBACK_SERVICES
  return (
    <section>
      <SlideInContent direction="right" duration={0.65}>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-[#0F172A] mb-6 tracking-tight">
          <BlurText text="Our Services" delay={70} stepDuration={0.3} animateBy="words" />
        </h2>
        {loading && <p className="text-sm text-slate-400 mb-4">Loading services…</p>}
      </SlideInContent>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {items.map((s, i) => (
          <SlideInContent key={s.key ?? s.title} direction="up" delay={i * 0.07} duration={0.5}>
          <SectionCard className="p-6 hover group bg-white/90 backdrop-blur-sm" hover>
            <div className={`w-12 h-12 rounded-xl ${s.bg} ${s.color} grid place-items-center mb-4 transform group-hover:scale-120 group-hover:rotate-6 transition-all duration-300`}>
              <ServiceIcon type={s.icon ?? ['dashboard', 'goal', 'calc', 'kyc', 'support'][i]} className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-sm text-[#0F172A] leading-snug">{s.title}</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.desc}</p>
            <Link to={s.to} className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-[#0056D2] hover:text-[#003FA3] transition-colors">
              {s.cta} <span aria-hidden className="transform group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </SectionCard>
          </SlideInContent>
        ))}
      </div>
    </section>
  )
}

function CompareInvestCard({ compare, fetchCompare, loading = false }) {
  const [tab, setTab] = useState('FD')
  const [amount, setAmount] = useState(compare?.fd?.investmentAmount ?? 100000)
  const [tenure, setTenure] = useState(compare?.defaultTenure ?? compare?.fd?.tenure ?? '1_year')
  const [compareData, setCompareData] = useState(compare?.fd ?? null)
  const [compareLoading, setCompareLoading] = useState(false)

  const tabs = ['FD', 'RD']
  const tenureOptions = compareData?.tenureOptions?.length
    ? compareData.tenureOptions
    : compare?.tenureOptions ?? compare?.fd?.tenureOptions ?? []

  useEffect(() => {
    if (tab === 'FD' && compare?.fd) {
      setCompareData(compare.fd)
      setAmount(compare.fd.investmentAmount ?? 100000)
      setTenure(compare.fd.tenure ?? '1_year')
    } else if (tab === 'RD' && compare?.rd) {
      setCompareData(compare.rd)
      setAmount(compare.rd.investmentAmount ?? 5000)
      setTenure(compare.rd.tenure ?? '1_year')
    }
  }, [compare, tab])

  useEffect(() => {
    if (!fetchCompare || loading) return undefined
    let cancelled = false

    async function loadCompare() {
      setCompareLoading(true)
      try {
        const data = await fetchCompare({
          type: tab.toLowerCase(),
          tenure,
          amount,
        })
        if (!cancelled) setCompareData(data)
      } catch {
        // Keep previous compare data on failure
      } finally {
        if (!cancelled) setCompareLoading(false)
      }
    }

    const timer = setTimeout(loadCompare, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [tab, tenure, amount, fetchCompare, loading])

  const banksWithRates = compareData?.banks ?? []
  const rateLabel = tab === 'RD' ? 'p.a.' : 'p.a.'
  const investTo = compareData?.investTo ?? '/fd-rd'
  const viewAllTo = '/fd-rd'

  return (
    <SectionCard className="p-7 h-full flex flex-col">
      <h3 className="font-display font-bold text-[#0F172A] text-lg mb-5">Compare & Invest</h3>
      {(loading || compareLoading) && (
        <p className="text-xs text-slate-400 mb-3">Updating rates…</p>
      )}
      <div className="flex gap-1 border-b border-slate-200 mb-5">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-bold border-b-2 -mb-px transition-all duration-200 ${
              tab === t
                ? 'border-[#0056D2] text-[#0056D2]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-5 flex-1">
        <div>
          <label htmlFor="invest-amount" className="text-xs text-slate-600 font-bold uppercase tracking-wide">
            Investment Amount
          </label>
          <div className="mt-2.5">
            <div className="flex items-center gap-3">
              <span className="text-base text-[#0056D2] font-bold shrink-0">₹</span>
              <input
                id="invest-amount"
                type="range"
                min={10000}
                max={1000000}
                step={5000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="flex-1 min-w-0 h-2 accent-[#0056D2] bg-slate-100 rounded-full cursor-pointer"
              />
            </div>
            <div className="mt-2 text-right">
              <motion.span
                key={amount}
                initial={{ opacity: 0.5, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-bold text-[#0F172A] tabular-nums inline-block"
              >
                {formatINR(amount)}
              </motion.span>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="invest-tenure" className="text-xs text-slate-600 font-bold uppercase tracking-wide">
            Tenure
          </label>
          <select
            id="invest-tenure"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            className="mt-2.5 w-full text-base font-semibold border border-slate-200 rounded-lg px-4 py-3 bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0056D2]/30 transition-all"
          >
            {tenureOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${tab}-${tenure}-${amount}`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.3 }}
          className="space-y-3 border-t border-slate-100 pt-5"
        >
          {banksWithRates.map((b) => (
            <div key={`${b.id}-${b.name}`} className="flex items-center gap-3 py-3 hover:bg-slate-50 px-3 rounded-lg transition-colors">
              <div
                className="w-10 h-10 rounded-xl text-white text-xs font-bold grid place-items-center shrink-0 shadow-md"
                style={{ background: b.color }}
              >
                {b.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#0F172A]">{b.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    {b.rateDisplay ?? `${b.rate}%`} {rateLabel}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[80px]">
                    <div
                      className="h-full bg-gradient-to-r from-[#0056D2] to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((b.rate / 15) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <Link
                to={b.id ? `/fd-rd/bank/${b.id}?product=${tab.toLowerCase()}` : investTo}
                className="shrink-0 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0056D2] to-[#003FA3] rounded-lg hover:shadow-lg transition-all"
              >
                {b.investLabel ?? 'Invest'}
              </Link>
            </div>
          ))}
          {!banksWithRates.length && (
            <p className="text-sm text-slate-500 py-4 text-center">No rates available for this selection.</p>
          )}
        </motion.div>
      </AnimatePresence>
      <Link to={viewAllTo} className="inline-block mt-5 text-xs font-bold text-[#0056D2] hover:text-[#003FA3] transition-colors">
        View All {tab === 'RD' ? 'Banks' : 'Banks'} →
      </Link>
    </SectionCard>
  )
}

function FinancialSnapshot({ dashboard, loading = false }) {
  const snapshot = dashboard?.snapshot
  const chartAllocation = snapshot?.allocation?.length ? snapshot.allocation : allocationData
  const chartTrend = snapshot?.netWorthTrend?.length ? snapshot.netWorthTrend : netWorthTrend

  if (!snapshot) {
    return (
      <div className="space-y-5 h-full">
        <h3 className="font-display font-bold text-[#0F172A] text-lg">My Financial Snapshot</h3>
        <SectionCard className="p-6 h-full grid place-items-center">
          <p className="text-sm text-slate-500">{loading ? 'Loading snapshot…' : 'No snapshot data available yet.'}</p>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="space-y-5 h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-[#0F172A] text-lg">My Financial Snapshot</h3>
        <Link to="/dashboard" className="text-xs font-bold text-[#0056D2] hover:text-[#003FA3] transition-colors">
          View Full →
        </Link>
      </div>
      {loading && <p className="text-xs text-slate-400">Loading snapshot…</p>}

      <SectionCard className="p-6 bg-gradient-to-br from-white to-blue-50/30">
        <div className="text-xs text-slate-500 font-bold uppercase tracking-wide">Net Worth</div>
        <div className="flex items-end justify-between gap-3 mt-3">
          <div>
            <div className="text-3xl font-display font-bold text-[#0F172A]">{snapshot.netWorthDisplay ?? `₹${formatINR(snapshot.netWorth ?? 0)}`}</div>
            {snapshot.changePct != null && (
              <div className="text-xs font-bold text-emerald-600 mt-1 bg-emerald-50 px-3 py-1 rounded-full w-fit">+{snapshot.changePct}% ▲</div>
            )}
          </div>
          <div className="w-32 h-14">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTrend}>
                <defs>
                  <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#10B981" strokeWidth={2.5} fill="url(#nwGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="p-6">
        <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-4">Asset Allocation</div>
        <div className="flex items-center gap-4">
          <div className="w-28 h-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartAllocation}
                  dataKey="value"
                  innerRadius={32}
                  outerRadius={48}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {chartAllocation.map((a) => (
                    <Cell key={a.name} fill={a.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {chartAllocation.map((a) => (
              <div key={a.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                  {a.name}
                </span>
                <span className="font-bold text-[#0F172A]">{a.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard className="p-6">
        <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-4">Financial Health Score</div>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E2E8F0" strokeWidth="2.5" />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeDasharray={`${snapshot.healthScore ?? 85}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-[#0F172A] leading-none">{snapshot.healthScore ?? 85}</div>
                <div className="text-xs text-emerald-600 font-bold">{snapshot.healthLabel ?? 'Excellent'}</div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {snapshot.healthMessage ?? "Great going! You're on track with your savings and investment goals."}
            </p>
            <Link to="/dashboard" className="inline-flex mt-3 text-xs font-bold text-[#0056D2] hover:text-[#003FA3] transition-colors">
              Improve Score →
            </Link>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

function MyGoalsCard({ dashboard, loading = false }) {
  const goals = dashboard?.goals?.length ? dashboard.goals : homeGoals

  return (
    <SectionCard className="p-6 h-full flex flex-col bg-gradient-to-br from-white to-emerald-50/20">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-[#0F172A] text-lg">My Goals</h3>
        <Link to="/goals" className="text-xs font-bold text-[#0056D2] hover:text-[#003FA3] transition-colors">
          View All
        </Link>
      </div>
      {loading && <p className="text-xs text-slate-400 mb-3">Loading goals…</p>}

      <div className="space-y-5 flex-1">
        {goals.map((g) => (
          <div key={g.name}>
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-10 h-10 rounded-xl text-lg grid place-items-center font-bold ${g.color} shadow-md`}>{g.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#0F172A]">{g.name}</div>
                <div className="text-xs text-slate-500 font-medium">Target: {g.target}</div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">{g.pct}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${g.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/goals"
        className="mt-6 w-full py-3 text-center text-sm font-bold text-[#0056D2] border-2 border-[#0056D2] rounded-xl hover:bg-[#0056D2] hover:text-white transition-all duration-200"
      >
        Create New Goal →
      </Link>
    </SectionCard>
  )
}

function GuestInvestSection() {
  const { openLogin, openRegister } = useAuthModal()

  const highlights = [
    {
      title: 'Smart Dashboard',
      desc: 'Track net worth, returns and portfolio health in one place.',
      icon: '📊',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Goal Planning',
      desc: 'Set targets for retirement, home, education and watch your progress.',
      icon: '🎯',
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Personalized Insights',
      desc: 'Get allocation breakdowns and financial health scores tailored to you.',
      icon: '✨',
      color: 'bg-violet-50 text-violet-700',
    },
    {
      title: 'Secure & RBI Compliant',
      desc: 'Bank-grade security with seamless KYC and verified investments.',
      icon: '🔒',
      color: 'bg-amber-50 text-amber-700',
    },
  ]

  return (
    <div className="lg:col-span-2 h-full">
      <SectionCard className="p-7 md:p-8 h-full bg-gradient-to-br from-[#0B1F3A] via-[#132a4a] to-[#0B1F3A] text-white border-blue-900/30 overflow-hidden relative">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-white/80 mb-4">
            For Members Only
          </span>
          <h3 className="font-display font-bold text-2xl md:text-3xl leading-tight">
            Unlock Your Financial Snapshot & Goals
          </h3>
          <p className="text-white/70 mt-3 max-w-2xl text-sm md:text-base leading-relaxed">
            Login to access your personal dashboard — net worth tracking, asset allocation, health score, and goal progress. Start building wealth with a clear view of your finances.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-7">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-xl bg-white/8 border border-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <span className={`w-10 h-10 rounded-lg grid place-items-center text-lg shrink-0 ${item.color}`}>{item.icon}</span>
                  <div>
                    <div className="font-bold text-sm text-white">{item.title}</div>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <button
              type="button"
              onClick={openLogin}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-sm font-bold shadow-lg transition-all"
            >
              Login to Continue
            </button>
            <button
              type="button"
              onClick={openRegister}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/25 text-white text-sm font-bold transition-all"
            >
              Create Free Account
            </button>
            <Link
              to="/kyc"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-blue-200 hover:text-white transition-colors"
            >
              Complete KYC →
            </Link>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

function ContentThumb({ gradient }) {
  return <div className={`w-20 h-16 rounded-xl shrink-0 shadow-md ${gradient}`} />
}

function NewsBlogSection() {
  const newsItems = news.slice(0, 3).map((n, i) => ({
    ...n,
    thumb: ['bg-gradient-to-br from-blue-400 to-blue-600', 'bg-gradient-to-br from-emerald-400 to-teal-600', 'bg-gradient-to-br from-violet-400 to-purple-600'][i],
  }))
  const blogItems = posts.slice(0, 3).map((p, i) => ({
    ...p,
    thumb: ['bg-gradient-to-br from-amber-400 to-orange-500', 'bg-gradient-to-br from-rose-400 to-pink-500', 'bg-gradient-to-br from-cyan-400 to-blue-500'][i],
  }))

  return (
    <section className="grid lg:grid-cols-3 gap-6">
      <SectionCard className="p-6">
        <h3 className="font-display font-bold text-[#0F172A] text-lg mb-5">Market Insights & News</h3>
        <div className="space-y-4">
          {newsItems.map(n => (
            <Link key={n.title} to="/news" className="flex gap-4 group hover:bg-slate-50 p-3 -mx-3 rounded-lg transition-colors">
              <ContentThumb gradient={n.thumb} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wide text-[#0056D2] bg-blue-100 px-2 py-1 rounded-full">
                    {n.cat}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{n.read} read</span>
                </div>
                <h4 className="text-sm font-bold text-[#0F172A] mt-2 leading-snug group-hover:text-[#0056D2] line-clamp-2 transition-colors">
                  {n.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">{n.date}</p>
              </div>
            </Link>
          ))}
        </div>
        <Link to="/news" className="inline-flex mt-5 text-xs font-bold text-[#0056D2] hover:text-[#003FA3] transition-colors">
          View All News →
        </Link>
      </SectionCard>

      <SectionCard className="p-6">
        <h3 className="font-display font-bold text-[#0F172A] text-lg mb-5">From Our Blog</h3>
        <div className="space-y-4">
          {blogItems.map(p => (
            <Link key={p.title} to="/blog" className="flex gap-4 group hover:bg-emerald-50 p-3 -mx-3 rounded-lg transition-colors">
              <ContentThumb gradient={p.thumb} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                    {p.cat}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{p.read} read</span>
                </div>
                <h4 className="text-sm font-bold text-[#0F172A] mt-2 leading-snug group-hover:text-emerald-700 line-clamp-2 transition-colors">
                  {p.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">{p.date}</p>
              </div>
            </Link>
          ))}
        </div>
        <Link to="/blog" className="inline-flex mt-5 text-xs font-bold text-[#0056D2] hover:text-[#003FA3] transition-colors">
          View All Articles →
        </Link>
      </SectionCard>

      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1F3A] via-[#1a2f4f] to-[#0B1F3A] text-white p-7 min-h-[240px] flex flex-col justify-center border border-blue-900/30">
          <div className="absolute right-0 top-0 opacity-[0.07]">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-2xl relative z-10">Ready to start your investment journey?</h3>
          <p className="text-base text-white/75 mt-3 relative z-10 max-w-sm leading-relaxed font-medium">
            Join 10 lakh+ investors building wealth with smart, secure investing.
          </p>
          <Link
            to="/kyc"
            className="relative z-10 inline-flex mt-6 items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl w-fit"
          >
            Get Started Now <span aria-hidden>→</span>
          </Link>
        </div>

        <SectionCard className="p-6">
          <h3 className="font-display font-bold text-[#0F172A] text-base mb-4">What Our Investors Say</h3>
          <span className="text-5xl text-blue-200 font-serif leading-none select-none">&ldquo;</span>
          <p className="text-sm text-slate-600 leading-relaxed font-medium -mt-2">
            Fintech Demo made investing effortless. The dashboard and goal tracking helped me stay disciplined and on track.
          </p>
          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0056D2] to-teal-500 text-white text-xs font-bold grid place-items-center shadow-md">
              RM
            </div>
            <div>
              <div className="text-sm font-bold text-[#0F172A]">Rohan Mehta</div>
              <div className="text-xs text-slate-500 font-medium">Mumbai, India</div>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0056D2]" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          </div>
        </SectionCard>
      </div>
    </section>
  )
}

function TrustBar({ trustStats = [], loading = false }) {
  const items = trustStats.length ? trustStats : FALLBACK_TRUST_STATS
  return (
    <section className="rounded-2xl bg-gradient-to-r from-[#0B1F3A] via-[#1a3050] to-[#0B1F3A] px-6 sm:px-10 py-10 sm:py-12 border border-blue-900/30">
      {loading && <p className="text-xs text-white/50 mb-4">Loading platform stats…</p>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((s) => (
          <div key={s.label} className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="w-14 h-14 rounded-full bg-white/15 border border-white/20 grid place-items-center text-white shadow-lg">
              <TrustIcon type={s.icon} />
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/70 font-medium">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function HomeMiddleSections({
  loading = false,
  error = '',
  products = [],
  services = [],
  trustStats = [],
  compare = null,
  dashboard = null,
  fetchCompare,
}) {
  const { isAuthenticated } = useAuth()

  return (
    <div className="bg-white/75 backdrop-blur-[2px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <SlideInContent direction="up" duration={0.6}>
          <section className="grid lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2">
              <TopProductsSection products={products} loading={loading} />
            </div>
            <SlideInContent direction="right" delay={0.15} duration={0.65}>
              <CivilScoreChecker />
            </SlideInContent>
          </section>
        </SlideInContent>
        <ServicesRow services={services} loading={loading} />
        <SlideInContent direction="up" delay={0.1} duration={0.65}>
          <section className="grid lg:grid-cols-3 gap-6">
            <CompareInvestCard compare={compare} fetchCompare={fetchCompare} loading={loading} />
            {isAuthenticated ? (
              <>
                <FinancialSnapshot dashboard={dashboard} loading={loading} />
                <MyGoalsCard dashboard={dashboard} loading={loading} />
              </>
            ) : (
              <GuestInvestSection />
            )}
          </section>
        </SlideInContent>
        <SlideInContent direction="left" duration={0.7}>
          <NewsBlogSection />
        </SlideInContent>
        <SlideInContent direction="up" delay={0.1} duration={0.6}>
          <TrustBar trustStats={trustStats} loading={loading} />
        </SlideInContent>
      </div>
    </div>
  )
}
