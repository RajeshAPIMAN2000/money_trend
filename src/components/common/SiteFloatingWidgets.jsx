import { useEffect, useRef, useState } from 'react'
import { Bot, Eye, Send, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import {
  bumpLocalVisitorCount,
  getLocalVisitorCount,
  getOrCreateDeviceId,
  parseVisitorStats,
} from '../../lib/visitors.js'
import { cn } from '../../lib/utils.js'

const WHATSAPP_NUMBER = '8249585580'
const WHATSAPP_URL = `https://wa.me/91${WHATSAPP_NUMBER}`

const AI_REPLIES = [
  {
    match: /fd|fixed\s*deposit/i,
    text: 'Our Fixed Deposits offer competitive rates from partner banks. Open FD & RD from the marketplace to compare and invest.',
  },
  {
    match: /rd|recurring/i,
    text: 'Recurring Deposits let you invest a fixed amount every month. Browse RD options under FD & RD.',
  },
  {
    match: /goal|invest/i,
    text: 'You can set goals on the Goals page and track progress from your dashboard after signing in.',
  },
  {
    match: /kyc|verify/i,
    text: 'Complete KYC from your profile or the KYC page to unlock investments. DigiLocker and manual upload are supported.',
  },
  {
    match: /wallet|withdraw|money/i,
    text: 'Use the Wallet to add money, invest, and request withdrawals to your linked bank account.',
  },
  {
    match: /hello|hi|hey|help/i,
    text: 'Hi! I\'m the MoneyTrend assistant. Ask me about FD, RD, goals, KYC, or wallet.',
  },
]

function aiReply(input) {
  const hit = AI_REPLIES.find((r) => r.match.test(input))
  if (hit) return hit.text
  return 'Thanks for your message. For personal help, tap WhatsApp below to chat with our team, or browse FD & RD and Goals on the site.'
}

function useVisitorCounter() {
  const [count, setCount] = useState(() => getLocalVisitorCount())
  const recorded = useRef(false)

  useEffect(() => {
    if (recorded.current) return
    recorded.current = true

    const deviceId = getOrCreateDeviceId()
    const local = bumpLocalVisitorCount()
    setCount(local)

    ;(async () => {
      try {
        const res = await api.recordVisitorHit({
          device_id: deviceId,
          path: window.location.pathname,
          user_agent: navigator.userAgent,
        })
        const stats = parseVisitorStats(res)
        if (stats.count > 0) setCount(stats.count)
      } catch {
        try {
          const res = await api.getVisitorStats()
          const stats = parseVisitorStats(res)
          if (stats.count > 0) setCount(stats.count)
        } catch {
          // keep local count
        }
      }
    })()
  }, [])

  return count
}

function formatCount(n) {
  return Number(n || 0).toLocaleString('en-IN')
}

export default function SiteFloatingWidgets() {
  const visitCount = useVisitorCounter()
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m MoneyTrend AI. Ask about FD, RD, goals, KYC, or wallet.' },
  ])
  const [draft, setDraft] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    if (!chatOpen) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, chatOpen])

  const sendChat = (e) => {
    e?.preventDefault()
    const text = draft.trim()
    if (!text) return
    setDraft('')
    setMessages((prev) => [
      ...prev,
      { role: 'user', text },
      { role: 'bot', text: aiReply(text) },
    ])
  }

  return (
    <>
      {/* Left — visitor counter */}
      <div className="fixed bottom-4 left-3 sm:bottom-6 sm:left-5 z-[45] pointer-events-none">
        <div
          className="pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur shadow-lg px-3.5 py-2.5"
          title="Total visits (counts each visit; device id tracks same browser)"
        >
          <span className="w-9 h-9 rounded-xl bg-[#0056D2]/10 text-[#0056D2] grid place-items-center shrink-0">
            <Eye className="w-4.5 h-4.5 w-[18px] h-[18px]" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Visitors</p>
            <p className="text-sm font-bold text-[#0F172A] tabular-nums">{formatCount(visitCount)}</p>
          </div>
        </div>
      </div>

      {/* Right — AI chat + WhatsApp */}
      <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-5 z-[45] flex flex-col items-end gap-3">
        {chatOpen && (
          <div className="w-[min(100vw-1.5rem,22rem)] h-[24rem] max-h-[70vh] rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-gradient-to-r from-[#0B1F3A] to-[#0056D2] text-white shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Bot className="w-5 h-5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">MoneyTrend AI</p>
                  <p className="text-[10px] text-white/70">Ask about investing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
              {messages.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                      m.role === 'user'
                        ? 'bg-[#0056D2] text-white rounded-br-md'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md',
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendChat} className="p-2 border-t border-slate-100 flex gap-2 bg-white shrink-0">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#0056D2]"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-[#0056D2] text-white grid place-items-center hover:bg-[#003FA3]"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          onClick={() => setChatOpen((v) => !v)}
          className={cn(
            'w-14 h-14 rounded-full shadow-lg grid place-items-center text-white transition-transform hover:scale-105',
            chatOpen ? 'bg-slate-700' : 'bg-gradient-to-br from-[#0056D2] to-teal-500',
          )}
          aria-label={chatOpen ? 'Close AI chat' : 'Open AI chatbot'}
          title="AI Chatbot"
        >
          {chatOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </button>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-[#25D366] shadow-lg grid place-items-center text-white hover:scale-105 transition-transform"
          aria-label="Chat on WhatsApp"
          title={`WhatsApp ${WHATSAPP_NUMBER}`}
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
    </>
  )
}
