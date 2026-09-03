import { useState, useMemo } from 'react'
import { funds } from '../data/funds-data.js'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'

const cats = ['All', 'Equity', 'Debt', 'Hybrid', 'ELSS', 'Index']
const riskTone = { Low: 'green', Moderate: 'amber', High: 'red' }

function FundCard({ f }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-primary leading-tight">{f.name}</h3>
          <div className="text-xs text-slate-500 mt-1">{f.amc} • {f.cat}</div>
        </div>
        <Badge tone={riskTone[f.risk]}>{f.risk}</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        {[['1Y', f.y1], ['3Y', f.y3], ['5Y', f.y5]].map(([k, v]) => (
          <div key={k} className="bg-slate-50 rounded-btn py-2">
            <div className="text-[10px] text-slate-500">{k}</div>
            <div className="text-sm font-bold text-accent">{v}%</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3 text-xs">
        <span className="text-slate-500">NAV ₹{f.nav}</span>
      </div>
      <div className="flex gap-2 mt-4">
        <Button className="flex-1" size="sm">Invest</Button>
        <Button variant="outline" size="sm" className="flex-1">+ Watchlist</Button>
      </div>
    </Card>
  )
}

function SIPCalc() {
  const [amt, setAmt] = useState(10000)
  const [yrs, setYrs] = useState(10)
  const [rate, setRate] = useState(12)
  const months = yrs * 12
  const r = rate / 100 / 12
  const fv = Math.round(amt * ((Math.pow(1 + r, months) - 1) / r) * (1 + r))
  const invested = amt * months
  const gain = fv - invested
  return (
    <Card hover={false}>
      <h3 className="font-display font-bold text-xl text-primary">SIP Calculator</h3>
      <div className="grid md:grid-cols-2 gap-6 mt-5">
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-500">Monthly Investment</label>
            <input type="number" value={amt} onChange={e => setAmt(+e.target.value || 0)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn focus:outline-none focus:border-secondary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Tenure: {yrs} years</label>
            <input type="range" min={1} max={30} value={yrs} onChange={e => setYrs(+e.target.value)} className="w-full mt-2 accent-secondary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Expected Return: {rate}%</label>
            <input type="range" min={6} max={24} value={rate} onChange={e => setRate(+e.target.value)} className="w-full mt-2 accent-accent" />
          </div>
        </div>
        <div className="bg-primary text-white rounded-card p-5 space-y-3">
          <div>
            <div className="text-xs text-white/60">Projected Value</div>
            <div className="text-3xl font-display font-bold text-accent">₹{fv.toLocaleString('en-IN')}</div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
            <div><div className="text-xs text-white/60">Invested</div><div className="font-semibold">₹{invested.toLocaleString('en-IN')}</div></div>
            <div><div className="text-xs text-white/60">Gains</div><div className="font-semibold text-accent">₹{gain.toLocaleString('en-IN')}</div></div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function MutualFunds() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const filtered = useMemo(() =>
    funds.filter(f => (cat === 'All' || f.cat === cat) && f.name.toLowerCase().includes(q.toLowerCase())),
    [q, cat])
  const top = [...funds].sort((a, b) => b.y1 - a.y1).slice(0, 3)
  return (
    <>
      <PageBanner {...getPageBanner('mutual-funds')} />
    <PageSideLayout>
      <div>

      <div className="flex flex-col md:flex-row gap-3">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search funds, AMC..." className="flex-1 px-4 py-2.5 border border-slate-300 rounded-btn focus:outline-none focus:border-secondary" />
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {cats.map(c => <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-full text-sm font-medium ${cat === c ? 'bg-secondary text-white' : 'bg-slate-100 text-ink hover:bg-slate-200'}`}>{c}</button>)}
      </div>

      <h2 className="font-display font-bold text-2xl text-primary mt-10 mb-4">Top Performers (1Y)</h2>
      <div className="grid md:grid-cols-3 gap-5">{top.map(f => <FundCard key={f.name} f={f} />)}</div>

      <h2 className="font-display font-bold text-2xl text-primary mt-10 mb-4">All Funds ({filtered.length})</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{filtered.map(f => <FundCard key={f.name} f={f} />)}</div>

      <div className="mt-12"><SIPCalc /></div>
      </div>
    </PageSideLayout>
    </>
  )
}
