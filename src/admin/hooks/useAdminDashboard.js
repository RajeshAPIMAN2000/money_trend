import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api.js'
import { parseAdminDashboard } from '../../lib/adminDashboard.js'

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const response = await api.getAdminDashboard()
      return parseAdminDashboard(response)
    },
  })
}
