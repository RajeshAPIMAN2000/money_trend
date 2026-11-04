import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api.js'
import { parseAdminBannersList, parseAdminBannerDetail } from '../../lib/adminBanners.js'

const queryKey = (suffix = []) => ['admin', 'banners', ...suffix]

export function useAdminBanners(params = {}) {
  return useQuery({
    queryKey: queryKey(['list', params]),
    queryFn: async () => parseAdminBannersList(await api.getAdminBanners(params)),
  })
}

export function useAdminBanner(id) {
  return useQuery({
    queryKey: queryKey([id]),
    queryFn: async () => parseAdminBannerDetail(await api.getAdminBanner(id)),
    enabled: Boolean(id),
  })
}

export function useAdminBannerMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKey() })

  const create = useMutation({
    mutationFn: (formData) => api.createAdminBanner(formData),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, formData }) => api.updateAdminBanner(id, formData),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id) => api.deleteAdminBanner(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
