import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api.js'
import {
  parseSubAdminsList,
  parseSubAdmin,
  buildCreateSubAdminBody,
  buildUpdateSubAdminBody,
} from '../../lib/adminStaff.js'

export function useAdminSubAdmins() {
  return useQuery({
    queryKey: ['admin', 'sub-admins'],
    queryFn: async () => parseSubAdminsList(await api.getAdminSubAdmins()),
  })
}

export function useAdminSubAdmin(id) {
  return useQuery({
    queryKey: ['admin', 'sub-admins', id],
    queryFn: async () => parseSubAdmin(await api.getAdminSubAdmin(id)),
    enabled: Boolean(id),
  })
}

export function useAdminSubAdminMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'sub-admins'] })

  const create = useMutation({
    mutationFn: (fields) => api.createAdminSubAdmin(buildCreateSubAdminBody(fields)),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, fields }) => api.updateAdminSubAdmin(id, buildUpdateSubAdminBody(fields)),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id) => api.deleteAdminSubAdmin(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
