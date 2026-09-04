import { useRef, useState } from 'react'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Accordion from '../components/ui/Accordion.jsx'
import Badge from '../components/ui/Badge.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useAuthModal } from '../context/AuthModalContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import {
  useSupportHelp,
  useMySupportTickets,
  useSubmitSupportTicket,
} from '../hooks/useSupport.js'
import { SUPPORT_SUBJECTS, supportStatusBadgeTone } from '../lib/support.js'

const FALLBACK_METRICS = [
  ['2 hrs', 'Avg response'],
  ['98%', 'Satisfaction'],
  ['24×7', 'Support hours'],
  ['50K+', 'Tickets resolved'],
]

export default function Support() {
  const { user } = useAuth()
  const { openLogin } = useAuthModal()
  const { showToast } = useToast()
  const fileRef = useRef(null)

  const { data: help, isLoading: helpLoading } = useSupportHelp()
  const [ticketStatus, setTicketStatus] = useState('')
  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    error: ticketsError,
  } = useMySupportTickets(
    ticketStatus ? { status: ticketStatus } : {},
    Boolean(user),
  )
  const submitMutation = useSubmitSupportTicket()

  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [faqQuery, setFaqQuery] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)

  const subjects = help?.subjects?.length ? help.subjects : SUPPORT_SUBJECTS
  const metrics = help?.metrics?.length ? help.metrics : FALLBACK_METRICS
  const faqs = (help?.faqs ?? []).filter((item) => {
    if (!faqQuery.trim()) return true
    const q = faqQuery.toLowerCase()
    return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
  })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) {
      openLogin()
      showToast('Please sign in to submit a support ticket', 'error')
      return
    }
    if (!subject.trim() || !description.trim()) {
      showToast('Subject and description are required', 'error')
      return
    }
    try {
      await submitMutation.mutateAsync({ subject, description, attachment })
      showToast('Ticket submitted — we emailed info@moneytrend.in', 'success')
      setSubject('')
      setDescription('')
      setAttachment(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      showToast(err.message || 'Failed to submit ticket', 'error')
    }
  }

  return (
    <>
      <PageBanner {...getPageBanner('support')} breadcrumbs={[{ label: 'Support' }]} />

      <PageSideLayout className="!max-w-5xl">
        <div>
          <input
            value={faqQuery}
            onChange={(e) => setFaqQuery(e.target.value)}
            placeholder="Search for help articles..."
            className="w-full mb-6 px-5 py-3 rounded-xl border border-slate-200 text-ink focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 shadow-sm"
          />

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
              {helpLoading ? (
                <p className="text-sm text-slate-500">Loading FAQs…</p>
              ) : faqs.length ? (
                <Accordion items={faqs} />
              ) : (
                <p className="text-sm text-slate-500">No FAQs match your search.</p>
              )}
              {help?.inbox && (
                <p className="mt-4 text-sm text-slate-500">
                  Email us at{' '}
                  <a href={`mailto:${help.inbox}`} className="text-secondary font-semibold hover:underline">
                    {help.inbox}
                  </a>
                </p>
              )}
            </div>

            <div>
              <h2 className="font-display font-bold text-2xl text-primary mb-4">Contact Support</h2>
              <Card hover={false}>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn bg-white"
                      required
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Description</label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn"
                      placeholder="Describe your issue..."
                      required
                    />
                  </div>
                  <div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full text-sm border-2 border-dashed border-slate-300 rounded-btn py-3 text-slate-500 hover:bg-slate-50"
                    >
                      {attachment ? `📎 ${attachment.name}` : '📎 Attach image or PDF (optional)'}
                    </button>
                  </div>
                  <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
                    {submitMutation.isPending ? 'Submitting…' : user ? 'Submit Ticket' : 'Sign in to Submit'}
                  </Button>
                </form>
              </Card>
            </div>
          </div>

          <div className="mt-10 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="font-display font-bold text-2xl text-primary">My Tickets</h2>
              {user && (
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-btn bg-white"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_process">In Process</option>
                  <option value="fixed">Fixed</option>
                </select>
              )}
            </div>

            {!user ? (
              <Card hover={false}>
                <p className="text-sm text-slate-600 mb-3">Sign in to view and track your support tickets.</p>
                <Button type="button" onClick={openLogin}>Sign in</Button>
              </Card>
            ) : ticketsLoading ? (
              <p className="text-sm text-slate-500">Loading tickets…</p>
            ) : ticketsError ? (
              <p className="text-sm text-red-600">{ticketsError.message || 'Failed to load tickets'}</p>
            ) : !(ticketsData?.tickets?.length) ? (
              <Card hover={false}>
                <p className="text-sm text-slate-500">You have not submitted any tickets yet.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {ticketsData.tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    className="w-full text-left"
                  >
                    <Card className="hover:border-secondary/40 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="text-xs text-slate-400 font-mono">{ticket.ticketNumber}</div>
                          <div className="font-semibold text-primary mt-0.5">{ticket.subject}</div>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{ticket.description}</p>
                        </div>
                        <Badge tone={supportStatusBadgeTone(ticket.status)}>{ticket.statusLabel}</Badge>
                      </div>
                      <div className="text-xs text-slate-400 mt-3">{ticket.createdAtLabel}</div>
                    </Card>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageSideLayout>

      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-xs text-slate-400 font-mono">{selectedTicket.ticketNumber}</div>
                <h3 className="font-display font-bold text-xl text-primary">{selectedTicket.subject}</h3>
              </div>
              <Badge tone={supportStatusBadgeTone(selectedTicket.status)}>{selectedTicket.statusLabel}</Badge>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedTicket.description}</p>
            {selectedTicket.attachment && (
              <a
                href={selectedTicket.attachment}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 text-sm text-secondary font-semibold hover:underline"
              >
                View attachment
              </a>
            )}
            {selectedTicket.adminNote && (
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Admin note</div>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{selectedTicket.adminNote}</p>
              </div>
            )}
            <div className="mt-4 text-xs text-slate-400 space-y-1">
              <div>Created: {selectedTicket.createdAtLabel}</div>
              {selectedTicket.resolvedAt && <div>Resolved: {selectedTicket.resolvedAtLabel}</div>}
            </div>
            <Button type="button" className="w-full mt-5" variant="outline" onClick={() => setSelectedTicket(null)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
