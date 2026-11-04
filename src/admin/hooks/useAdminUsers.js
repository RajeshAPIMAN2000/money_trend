import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api.js'
import { parseAdminUsersList, parseAdminUserDetail, parseAdminUserGoals } from '../../lib/adminUsers.js'

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

/** User goals set in the app — shown on Admin User details */
export function useAdminUserGoals(userId) {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'goals'],
    queryFn: async () => {
      try {
        return parseAdminUserGoals(await api.getAdminUserGoals(userId))
      } catch (err) {
        // Fallback: goals embedded on user detail
        if (err?.status === 404) {
          const detail = parseAdminUserDetail(await api.getAdminUser(userId))
          return detail?.goals ?? []
        }
        throw err
      }
    },
    enabled: Boolean(userId),
    retry: false,
  })
}
