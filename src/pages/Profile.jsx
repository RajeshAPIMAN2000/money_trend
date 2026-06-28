import { useState } from 'react'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'

const TABS = ['Personal', 'Bank Accounts', 'Nominees', 'Preferences', 'Security']

function Field({ label, value }) {
  return <div><label className="text-xs font-semibold text-slate-500">{label}</label><div className="mt-1 px-3 py-2 border border-slate-200 rounded-btn bg-slate-50">{value}</div></div>
}

function Toggle({ label, def = false }) {
  const [on, setOn] = useState(def)
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="text-sm font-medium text-primary">{label}</div>
      <button onClick={() => setOn(!on)} className={`w-11 h-6 rounded-full relative ${on ? 'bg-accent' : 'bg-slate-300'}`}><span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full ${on ? 'left-5' : 'left-0.5'}`} /></button>
    </div>
  )
}

export default function Profile() {
  const [tab, setTab] = useState('Personal')
  return (
    <>
      <PageBanner {...getPageBanner('profile')} />
    <PageSideLayout className="!max-w-5xl">
      <div>
      <Card hover={false} className="bg-gradient-to-br from-primary to-secondary text-white">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="w-20 h-20 rounded-full bg-white text-primary grid place-items-center font-display font-bold text-2xl">RS</div>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold">Rahul Sharma</h1>
            <div className="text-white/70 text-sm">rahul@example.com • Member since Jan 2023</div>
            <Badge tone="green" className="mt-2">✓ KYC Verified</Badge>
          </div>
        </div>
      </Card>

      <div className="mt-6"><Tabs tabs={TABS} active={tab} onChange={setTab} /></div>

      <Card hover={false} className="mt-6 animate-fade-in">
        {tab === 'Personal' && (
          <>
            <div className="flex justify-between mb-5"><h3 className="font-display font-bold text-xl text-primary">Personal Details</h3><Button variant="outline" size="sm">Edit</Button></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" value="Rahul Sharma" />
              <Field label="Phone" value="+91 98765 43210" />
              <Field label="Email" value="rahul@example.com" />
              <Field label="Address" value="42, MG Road, Bengaluru 560001" />
              <Field label="PAN" value="ABCDE1234F" />
              <Field label="Aadhaar" value="XXXX-XXXX-3456" />
            </div>
          </>
        )}
        {tab === 'Bank Accounts' && (
          <>
            <div className="flex justify-between mb-5"><h3 className="font-display font-bold text-xl text-primary">Linked Bank Accounts</h3><Button size="sm">+ Add New</Button></div>
            <div className="space-y-3">
              {[['HDFC Bank', 'XXXX 4521', true], ['State Bank of India', 'XXXX 8834', false]].map(([b, n, p]) => (
                <div key={b} className="flex items-center justify-between p-4 border border-slate-200 rounded-card">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 grid place-items-center font-bold text-secondary">{b[0]}{b[1]}</div>
                    <div><div className="font-semibold text-primary">{b}</div><div className="text-xs text-slate-500">Acc: {n}</div></div>
                  </div>
                  {p && <Badge tone="green">Primary</Badge>}
                </div>
              ))}
            </div>
          </>
        )}
        {tab === 'Nominees' && (
          <>
            <div className="flex justify-between mb-5"><h3 className="font-display font-bold text-xl text-primary">Nominees</h3><Button size="sm">+ Add Nominee</Button></div>
            <div className="p-4 border border-slate-200 rounded-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 text-accent grid place-items-center font-bold">PS</div>
                <div><div className="font-semibold text-primary">Priya Sharma</div><div className="text-xs text-slate-500">Wife · DOB 1994</div></div>
              </div>
              <Badge tone="blue">50% Share</Badge>
            </div>
          </>
        )}
        {tab === 'Preferences' && (
          <>
            <h3 className="font-display font-bold text-xl text-primary mb-3">Notifications</h3>
            <Toggle label="Email Alerts" def={true} />
            <Toggle label="SMS Alerts" def={true} />
            <Toggle label="Weekly Portfolio Reports" def={true} />
            <Toggle label="Monthly Portfolio Reports" />
            <Toggle label="Two-Factor Authentication" def={true} />
          </>
        )}
        {tab === 'Security' && (
          <>
            <h3 className="font-display font-bold text-xl text-primary mb-4">Change Password</h3>
            <div className="space-y-3 max-w-md">
              <input type="password" placeholder="Current password" className="w-full px-3 py-2 border border-slate-300 rounded-btn" />
              <input type="password" placeholder="New password" className="w-full px-3 py-2 border border-slate-300 rounded-btn" />
              <input type="password" placeholder="Confirm new password" className="w-full px-3 py-2 border border-slate-300 rounded-btn" />
              <Button>Update Password</Button>
            </div>
            <h3 className="font-display font-bold text-xl text-primary mt-8 mb-3">Two-Factor Auth</h3>
            <Toggle label="Enable 2FA via OTP" def={true} />
            <h3 className="font-display font-bold text-xl text-primary mt-8 mb-3">Active Sessions</h3>
            <div className="space-y-2">
              {[['MacBook Pro · Chrome', 'Bengaluru · Current', true], ['iPhone 14 · MoneyTrend App', 'Mumbai · 2h ago', false]].map(([d, m, c]) => (
                <div key={d} className="p-3 border border-slate-200 rounded-card flex justify-between items-center"><div><div className="font-semibold text-primary text-sm">{d}</div><div className="text-xs text-slate-500">{m}</div></div>{c ? <Badge tone="green">Active</Badge> : <button className="text-xs text-red-600 hover:underline">Sign out</button>}</div>
              ))}
            </div>
          </>
        )}
      </Card>
      </div>
    </PageSideLayout>
    </>
  )
}
