import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api.js'
import { parseAdminUsersList, parseAdminUserDetail } from '../../lib/adminUsers.js'

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await api.getAdminUsers()
      return parseAdminUsersList(response)
    },
  })
}

export function useAdminUser(id) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const response = await api.getAdminUser(id)
      return parseAdminUserDetail(response)
    },
    enabled: Boolean(id),
  })
}
