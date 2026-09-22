import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, getToken } from '../lib/api.js'
import {
  buildCreateTestimonialBody,
  parseTestimonialsList,
  mapTestimonial,
} from '../lib/testimonials.js'

const SUBMITTED_KEY = (userId) => `moneytrend-testimonial-submitted:${userId || 'user'}`

export function markTestimonialSubmitted(userId) {
  try {
    localStorage.setItem(SUBMITTED_KEY(userId), '1')
  } catch {
    // ignore
  }
}

export function hasLocalTestimonialSubmitted(userId) {
  try {
    return localStorage.getItem(SUBMITTED_KEY(userId)) === '1'
  } catch {
    return false
  }
}

export function usePublicTestimonials(params = {}, enabled = true) {
  return useQuery({
    queryKey: ['testimonials', 'public', params],
    queryFn: async () => parseTestimonialsList(
      await api.getTestimonials({
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      }),
    ),
    enabled,
    staleTime: 60_000,
  })
}

/** Whether the logged-in user already submitted a testimonial */
export function useMyTestimonial(enabled = true) {
  const hasToken = Boolean(getToken())
  return useQuery({
    queryKey: ['testimonials', 'me'],
    queryFn: async () => {
      try {
        const res = await api.getMyTestimonials()
        const root = res?.data ?? res ?? {}
        if (root.has_submitted === true || root.submitted === true) {
          return { submitted: true, item: mapTestimonial(root.testimonial ?? root.item ?? root) }
        }
        const parsed = parseTestimonialsList(res)
        if (parsed.items.length > 0) {
          return { submitted: true, item: parsed.items[0] }
        }
        const single = mapTestimonial(root.testimonial ?? root.item ?? (root.id || root.description ? root : null))
        if (single?.description) return { submitted: true, item: single }
        return { submitted: false, item: null }
      } catch (err) {
        // Endpoint missing / none yet — treat as not submitted (localStorage still applies)
        if (err?.status === 404 || err?.status === 405 || err?.status === 501) {
          return { submitted: false, item: null }
        }
        return { submitted: false, item: null }
      }
    },
    enabled: enabled && hasToken,
    staleTime: 30_000,
    retry: false,
  })
}

export function useSubmitTestimonial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ rating, description }) =>
      api.createTestimonial(buildCreateTestimonialBody({ rating, description })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    },
  })
}
