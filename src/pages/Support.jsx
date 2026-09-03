import { useState } from 'react'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Accordion from '../components/ui/Accordion.jsx'
import Modal from '../components/ui/Modal.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'

const faqs = [
  { q: 'How do I create a Fintech Demo account?', a: 'Sign up with your email or phone, complete e-KYC using PAN & Aadhaar, and you\'re ready in under 5 minutes.' },
  { q: 'Is Fintech Demo SEBI registered?', a: 'Yes. Fintech Demo is a SEBI-registered investment intermediary (INA000012345) and is RBI compliant.' },
  { q: 'What is the minimum investment in mutual funds?', a: 'You can start a SIP with as little as ₹500/month or invest a lumpsum from ₹100.' },
  { q: 'How long does KYC take?', a: 'Aadhaar-based eKYC is instant. Manual verification, when required, takes up to 48 hours.' },
  { q: 'Which documents are required?', a: 'PAN, Aadhaar, a clear selfie, and a cancelled cheque or bank statement for bank linking.' },
  { q: 'How fast are withdrawals processed?', a: 'Liquid funds: T+1. Equity funds: T+3. FDs: at maturity (premature with penalty).' },
  { q: 'Are there any hidden charges?', a: 'No. We offer ₹0 commission on direct mutual funds. Statutory taxes (STT, stamp duty) apply.' },
  { q: 'How is my money safe?', a: 'Money flows directly to the AMC/Bank via NPCI rails. We never hold client funds.' },
  { q: 'Can NRIs invest?', a: 'Yes, NRIs with NRE/NRO accounts can invest in most schemes. FATCA declaration required.' },
  { q: 'How do I update my bank account?', a: 'Go to Profile → Bank Accounts → Add New. New bank is verified via penny-drop in 5 minutes.' },
]

const metrics = [['2 hrs', 'Avg response'], ['98%', 'Satisfaction'], ['24×7', 'Support hours'], ['50K+', 'Tickets resolved']]

export default function Support() {
  const [chat, setChat] = useState(false)
  const [msg, setMsg] = useState('')
  return (
    <>
      <PageBanner {...getPageBanner('support')} breadcrumbs={[{ label: 'Support' }]} />

      <PageSideLayout className="!max-w-5xl">
      <div>
      <input placeholder="Search for help articles..." className="w-full mb-6 px-5 py-3 rounded-xl border border-slate-200 text-ink focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 shadow-sm" />
      <div className="grid md:grid-cols-4 gap-4">
        {metrics.map(([n, l]) => (
          <Card key={l} className="text-center">
            <div className="text-2xl font-display font-bold text-secondary">{n}</div>
            <div className="text-xs text-slate-500 mt-1">{l}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mt-12 pb-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-primary mb-4">Frequently Asked</h2>
          <Accordion items={faqs} />
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-primary mb-4">Contact Support</h2>
          <Card hover={false}>
            <div className="space-y-4">
              <div><label className="text-xs font-semibold text-slate-500">Subject</label><select className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn"><option>Technical Issue</option><option>Investment Query</option><option>KYC Help</option><option>Payment Problem</option></select></div>
              <div><label className="text-xs font-semibold text-slate-500">Description</label><textarea rows="5" className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn" placeholder="Describe your issue..." /></div>
              <button className="w-full text-sm border-2 border-dashed border-slate-300 rounded-btn py-3 text-slate-500 hover:bg-slate-50">📎 Attach a file</button>
              <Button className="w-full">Submit Ticket</Button>
            </div>
          </Card>
        </div>
      </div>
      </div>
      </PageSideLayout>

      <button onClick={() => setChat(true)} className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-white shadow-lift grid place-items-center text-2xl hover:scale-110">💬</button>
      <Modal open={chat} onClose={() => setChat(false)} title="Live Chat — Priya (Support)">
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          <div className="flex gap-2"><div className="w-8 h-8 rounded-full bg-secondary text-white grid place-items-center text-xs">P</div><div className="bg-slate-100 rounded-card rounded-tl-none px-3 py-2 text-sm max-w-xs">Hi! How can I help you today?</div></div>
          <div className="flex gap-2 justify-end"><div className="bg-secondary text-white rounded-card rounded-tr-none px-3 py-2 text-sm max-w-xs">I want to start a SIP — what's the minimum?</div></div>
          <div className="flex gap-2"><div className="w-8 h-8 rounded-full bg-secondary text-white grid place-items-center text-xs">P</div><div className="bg-slate-100 rounded-card rounded-tl-none px-3 py-2 text-sm max-w-xs">You can begin a SIP with just ₹500/month. Want me to recommend funds?</div></div>
        </div>
        <div className="flex gap-2"><input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message..." className="flex-1 px-3 py-2 border border-slate-300 rounded-btn" /><Button onClick={() => setMsg('')}>Send</Button></div>
      </Modal>
    </>
  )
}
