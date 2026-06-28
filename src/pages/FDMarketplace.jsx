import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { fdList, rdList, rateTrend } from '../data/fd-data.js'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'

const types = ['All', 'PSU', 'Private', 'NBFC']
const tenures = ['All', '3M', '6M', '1Y', '2Y', '3Y', '5Y']

function FDCard({ d }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-primary grid place-items-center text-white font-bold">{d.logo}</div>
          <div>
            <div className="font-semibold text-primary">{d.bank}</div>
            <Badge tone="slate" className="mt-1">{d.type}</Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-display font-bold text-accent">{d.rate}%</div>
          <div className="text-xs text-slate-500">p.a.</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <div><div className="text-slate-500 text-xs">Tenure</div><div className="font-semibold">{d.tenure}</div></div>
        <div><div className="text-slate-500 text-xs">Min Amount</div><div className="font-semibold">₹{d.min.toLocaleString('en-IN')}</div></div>
      </div>
      <Button className="w-full mt-4">Invest Now</Button>
    </Card>
  )
}

export default function FDMarketplace() {
  const [type, setType] = useState('All')
  const [tenure, setTenure] = useState('All')
  const filtered = fdList.filter(f => (type === 'All' || f.type === type) && (tenure === 'All' || f.tenure === tenure))

  return (
    <>
      <PageBanner {...getPageBanner('fd-rd')} />
    <PageSideLayout>
      <div>

      <Card hover={false} className="mb-8">
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Bank Type</div>
            <div className="flex flex-wrap gap-2">
              {types.map(t => <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-full text-sm font-medium ${type === t ? 'bg-secondary text-white' : 'bg-slate-100 text-ink hover:bg-slate-200'}`}>{t}</button>)}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Tenure</div>
            <div className="flex flex-wrap gap-2">
              {tenures.map(t => <button key={t} onClick={() => setTenure(t)} className={`px-3 py-1.5 rounded-full text-sm font-medium ${tenure === t ? 'bg-secondary text-white' : 'bg-slate-100 text-ink hover:bg-slate-200'}`}>{t}</button>)}
            </div>
          </div>
        </div>
      </Card>

      <h2 className="font-display font-bold text-2xl text-primary mb-4">Fixed Deposits ({filtered.length})</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map(f => <FDCard key={f.bank} d={f} />)}
      </div>

      <h2 className="font-display font-bold text-2xl text-primary mt-12 mb-4">Recurring Deposits</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rdList.map(r => <FDCard key={r.bank} d={r} />)}
      </div>

      <h2 className="font-display font-bold text-2xl text-primary mt-12 mb-4">Top FDs Compared</h2>
      <Card hover={false} className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500 border-b border-slate-200"><th className="py-3">Bank</th><th>Rate</th><th>Tenure</th><th>Min</th></tr></thead>
          <tbody>
            {fdList.slice(0, 3).map(f => (
              <tr key={f.bank} className="border-b border-slate-100">
                <td className="py-3 font-semibold text-primary">{f.bank}</td>
                <td className="text-accent font-semibold">{f.rate}%</td>
                <td>{f.tenure}</td><td>₹{f.min.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <h2 className="font-display font-bold text-2xl text-primary mt-12 mb-4">12-Month Interest Rate Trend</h2>
      <Card hover={false}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={rateTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="m" stroke="#64748B" />
            <YAxis stroke="#64748B" domain={[6.5, 8]} />
            <Tooltip />
            <Line type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      </div>
    </PageSideLayout>
    </>
  )
}
