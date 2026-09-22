import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api.js'
import { parseAdminTestimonialsList } from '../../lib/testimonials.js'

const queryKey = (suffix = []) => ['admin', 'testimonials', ...suffix]

export function useAdminTestimonials(params = {}) {
  return useQuery({
    queryKey: queryKey(['list', params]),
    queryFn: async () => parseAdminTestimonialsList(await api.getAdminTestimonials(params)),
    staleTime: 0,
  })
}

export function useAdminTestimonialMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKey() })

  const remove = useMutation({
    mutationFn: (id) => api.deleteAdminTestimonial(id),
    onSuccess: invalidate,
  })

  return { remove }
}
