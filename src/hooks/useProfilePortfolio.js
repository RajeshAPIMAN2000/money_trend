import { useQuery } from '@tanstack/react-query'
import { api, getToken } from '../lib/api.js'
import { parseProfilePortfolio } from '../lib/userPortfolio.js'

/**
 * Dashboard portfolio — GET /api/profile/portfolio with login JWT.
 */
export function useProfilePortfolio(enabled = true) {
  const hasToken = Boolean(getToken())

  return useQuery({
    queryKey: ['profile', 'portfolio'],
    queryFn: async () => parseProfilePortfolio(await api.getProfilePortfolio()),
    enabled: enabled && hasToken,
    retry: false,
  })
}
