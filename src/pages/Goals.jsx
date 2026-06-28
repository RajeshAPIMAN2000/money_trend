import { useState } from 'react'
import { goals, milestones } from '../data/goals-data.js'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Modal from '../components/ui/Modal.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'

const fmt = (n) => `₹${(n/100000).toFixed(1)}L`

export default function Goals() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <PageBanner {...getPageBanner('goals')} />
    <PageSideLayout>
      <div>
      <div className="flex justify-end mb-2">
        <Button onClick={() => setOpen(true)}>+ Add New Goal</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {goals.map(g => {
          const pct = Math.round((g.saved / g.target) * 100)
          return (
            <Card key={g.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 grid place-items-center text-2xl">{g.icon}</div>
                  <div>
                    <h3 className="font-display font-bold text-primary text-lg">{g.name}</h3>
                    <div className="text-xs text-slate-500">Target by {g.date}</div>
                  </div>
                </div>
                <Badge tone={pct >= 80 ? 'green' : pct >= 50 ? 'amber' : 'blue'}>{pct}%</Badge>
              </div>
              <div className="mt-4 flex justify-between text-sm">
                <span><span className="font-semibold text-primary">{fmt(g.saved)}</span> <span className="text-slate-500">saved</span></span>
                <span className="text-slate-500">of {fmt(g.target)}</span>
              </div>
              <div className="mt-2"><ProgressBar value={pct} color={pct >= 80 ? 'bg-accent' : 'bg-secondary'} /></div>
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-sm">
                <div><div className="text-xs text-slate-500">Monthly SIP</div><div className="font-semibold">₹{g.sip.toLocaleString('en-IN')}</div></div>
                <div><div className="text-xs text-slate-500">Remaining</div><div className="font-semibold">{fmt(g.target - g.saved)}</div></div>
              </div>
            </Card>
          )
        })}
      </div>

      <h2 className="font-display font-bold text-2xl text-primary mt-12 mb-5">Dream Home — Milestone Timeline</h2>
      <Card hover={false}>
        <div className="relative pl-4">
          <div className="absolute left-[14px] top-2 bottom-2 w-0.5 bg-slate-200" />
          {milestones.map((m, i) => (
            <div key={i} className="relative pl-8 pb-6 last:pb-0">
              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full grid place-items-center text-xs font-bold ${m.done ? 'bg-accent text-white' : 'bg-slate-200 text-slate-600'}`}>{m.done ? '✓' : i + 1}</div>
              <div className="text-sm font-semibold text-primary">{m.y}</div>
              <div className="text-sm text-slate-600">{m.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add a new goal" footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Create Goal</Button></>}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">Goal Type</label>
            <select className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn"><option>Home</option><option>Education</option><option>Retirement</option><option>Travel</option><option>Wedding</option></select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Target Amount (₹)</label>
            <input type="number" defaultValue={1000000} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Target Date</label>
            <input type="date" className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Current Savings (₹)</label>
            <input type="number" defaultValue={0} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn" />
          </div>
        </div>
      </Modal>
      </div>
    </PageSideLayout>
    </>
  )
}
