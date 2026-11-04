import { useEffect, useMemo, useState } from 'react'
import { Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import {
  usePublicTestimonials,
  useSubmitTestimonial,
  useMyTestimonial,
  markTestimonialSubmitted,
  hasLocalTestimonialSubmitted,
} from '../../hooks/useTestimonials.js'
import { FALLBACK_TESTIMONIALS } from '../../lib/testimonials.js'
import { ApiError } from '../../lib/api.js'
import Button from '../ui/Button.jsx'

function Stars({ rating, size = 'sm' }) {
  const value = Math.min(5, Math.max(0, Number(rating) || 0))
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${cls} ${i < Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  )
}

function TestimonialCard({ item }) {
  return (
    <article className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm flex flex-col">
      <Stars rating={item.rating} />
      <span className="text-4xl text-blue-200 font-serif leading-none select-none mt-3">&ldquo;</span>
      <p className="text-sm text-slate-600 leading-relaxed font-medium -mt-1 flex-1">
        {item.description || item.message}
      </p>
      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0056D2] to-teal-500 text-white text-xs font-bold grid place-items-center shadow-md">
          {item.initials}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-[#0F172A] truncate">{item.name}</div>
          {item.createdAtLabel ? (
            <div className="text-xs text-slate-500 font-medium">{item.createdAtLabel}</div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function SubmitTestimonialForm({ onSubmitted, userId }) {
  const { showToast } = useToast()
  const submit = useSubmitTestimonial()
  const [description, setDescription] = useState('')
  const [rating, setRating] = useState(5)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = description.trim()
    if (text.length < 10) {
      setError('Description must be at least 10 characters')
      return
    }
    const stars = Number(rating)
    if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
      setError('Rating must be between 1 and 5')
      return
    }
    setError('')
    try {
      await submit.mutateAsync({ rating: stars, description: text })
      markTestimonialSubmitted(userId)
      setDescription('')
      setRating(5)
      showToast('Thank you! Your review was submitted.')
      onSubmitted?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit review')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6 space-y-4"
    >
      <div>
        <h3 className="font-display font-bold text-[#0F172A] text-lg">Share your experience</h3>
        <p className="text-xs text-slate-500 mt-1">
          After investing or using MoneyTrend, leave a review for other customers.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-slate-500">Your rating (1–5)</label>
        <div className="flex gap-1 mt-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="p-0.5"
              aria-label={`${n} stars`}
            >
              <Star
                className={`w-6 h-6 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={800}
          placeholder="Great platform for FD and RD investments."
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0056D2] resize-y min-h-[96px]"
        />
        <p className="text-[11px] text-slate-400 mt-1">Minimum 10 characters</p>
      </div>

      <Button type="submit" className="w-full sm:w-auto" disabled={submit.isPending}>
        {submit.isPending ? 'Submitting…' : 'Submit review'}
      </Button>
    </form>
  )
}

export default function TestimonialsSection() {
  const { user, isAuthenticated } = useAuth()
  const hasToken = Boolean(isAuthenticated)
  const userId = user?.id ?? user?.user_id ?? null

  const { data, isLoading, refetch } = usePublicTestimonials({ limit: 20, offset: 0 })
  const myQuery = useMyTestimonial(hasToken)

  const alreadySubmitted = Boolean(
    hasToken
    && (
      myQuery.data?.submitted
      || hasLocalTestimonialSubmitted(userId)
    ),
  )

  const showShareForm = hasToken && !alreadySubmitted && !myQuery.isLoading

  const items = useMemo(() => {
    const list = data?.items?.length ? data.items : FALLBACK_TESTIMONIALS
    return list
  }, [data])

  const averageRating = data?.averageRating
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return undefined
    const id = setInterval(() => {
      setActive((i) => (i + 1) % items.length)
    }, 6000)
    return () => clearInterval(id)
  }, [items.length])

  useEffect(() => {
    if (active >= items.length) setActive(0)
  }, [active, items.length])

  const featured = items[active] || items[0]
  const gridItems = items.slice(0, 3)

  return (
    <section aria-labelledby="testimonials-heading" className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-wider text-[#0056D2]">Customer reviews</p>
        <h2 id="testimonials-heading" className="font-display font-bold text-2xl sm:text-3xl text-[#0F172A] mt-2">
          What Our Investors Say
        </h2>
        <p className="text-sm text-slate-500 mt-2 font-medium">
          Real reviews from customers after investing and using MoneyTrend.
        </p>
        {averageRating != null && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5">
            <Stars rating={averageRating} size="lg" />
            <span className="text-sm font-bold text-[#0F172A] tabular-nums">
              {averageRating}
              <span className="font-medium text-slate-500"> / 5 avg</span>
            </span>
          </div>
        )}
      </div>

      {isLoading && !data?.items?.length ? (
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="hidden sm:grid sm:grid-cols-3 gap-4 lg:gap-5">
            {gridItems.map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </div>

          <div className="sm:hidden">
            {featured ? <TestimonialCard item={featured} /> : null}
            {items.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {items.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Show review ${i + 1}`}
                    onClick={() => setActive(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === active ? 'bg-[#0056D2]' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {showShareForm && (
        <SubmitTestimonialForm
          userId={userId}
          onSubmitted={() => {
            refetch()
            myQuery.refetch()
          }}
        />
      )}
    </section>
  )
}

/** Compact card for NewsBlog sidebar — cycles through live reviews */
export function TestimonialsSidebarCard() {
  const { data } = usePublicTestimonials({ limit: 20, offset: 0 })
  const items = data?.items?.length ? data.items : FALLBACK_TESTIMONIALS
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return undefined
    const id = setInterval(() => setActive((i) => (i + 1) % items.length), 5000)
    return () => clearInterval(id)
  }, [items.length])

  const item = items[active] || items[0]
  if (!item) return null

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
      <h3 className="font-display font-bold text-[#0F172A] text-base mb-4">What Our Investors Say</h3>
      {data?.averageRating != null && (
        <p className="text-xs text-slate-500 mb-2">
          Avg rating <span className="font-semibold text-[#0F172A]">{data.averageRating}/5</span>
        </p>
      )}
      <Stars rating={item.rating} />
      <span className="text-5xl text-blue-200 font-serif leading-none select-none block mt-2">&ldquo;</span>
      <p className="text-sm text-slate-600 leading-relaxed font-medium -mt-2 line-clamp-4">
        {item.description || item.message}
      </p>
      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0056D2] to-teal-500 text-white text-xs font-bold grid place-items-center shadow-md">
          {item.initials}
        </div>
        <div>
          <div className="text-sm font-bold text-[#0F172A]">{item.name}</div>
          {item.createdAtLabel ? (
            <div className="text-xs text-slate-500 font-medium">{item.createdAtLabel}</div>
          ) : null}
        </div>
      </div>
      {items.length > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {items.slice(0, 5).map((t, i) => (
            <button
              key={t.id}
              type="button"
              aria-label={`Review ${i + 1}`}
              onClick={() => setActive(i)}
              className={`w-2.5 h-2.5 rounded-full ${i === active ? 'bg-[#0056D2]' : 'bg-slate-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
