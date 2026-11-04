import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../lib/api.js'
import {
  parseDemoConfig,
  parseDemoWallet,
  parseDemoTransactions,
  parseAddDemoMoney,
  parseDemoInvestments,
  parseCancelInvestment,
  clampAddAmount,
} from '../lib/demoWallet.js'
import { invalidateMoneyQueries } from './useDummyPayment.js'

export function invalidateDemoWalletQueries(queryClient) {
  if (!queryClient) return Promise.resolve()
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['demo'] }),
    queryClient.invalidateQueries({ queryKey: ['wallet'] }),
    queryClient.invalidateQueries({ queryKey: ['profile', 'portfolio'] }),
    queryClient.invalidateQueries({ queryKey: ['fd'] }),
    queryClient.invalidateQueries({ queryKey: ['rd'] }),
  ])
}

export function useDemoConfig({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['demo', 'config'],
    queryFn: async () => parseDemoConfig(await api.getDemoConfig()),
    enabled: Boolean(enabled),
    staleTime: 60_000,
    retry: 1,
  })
}

export function useDemoWallet({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['demo', 'wallet'],
    queryFn: async () => {
      try {
        return parseDemoWallet(await api.getDemoWallet())
      } catch (err) {
        // Fallback: GET /wallet → data.demo_wallet
        if (err instanceof ApiError && (err.status === 404 || err.status === 501)) {
          return parseDemoWallet(await api.getWallet())
        }
        throw err
      }
    },
    enabled: Boolean(enabled),
    retry: false,
    refetchOnWindowFocus: true,
  })
}

export function useDemoWalletTransactions({ enabled = true, limit = 50 } = {}) {
  return useQuery({
    queryKey: ['demo', 'wallet', 'transactions', limit],
    queryFn: async () => parseDemoTransactions(
      await api.getDemoWalletTransactions({ limit }),
    ),
    enabled: Boolean(enabled),
    staleTime: 0,
  })
}

export function useAddDemoMoney() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (amount) => {
      const value = clampAddAmount(amount)
      return parseAddDemoMoney(await api.addDemoMoney({ amount: value }))
    },
    onSuccess: async () => {
      await invalidateDemoWalletQueries(queryClient)
      await invalidateMoneyQueries(queryClient)
    },
  })
}

export function useDemoInvestments({ enabled = true, type, status } = {}) {
  const params = {}
  if (type) params.type = type
  if (status) params.status = status

  return useQuery({
    queryKey: ['demo', 'investments', params],
    queryFn: async () => parseDemoInvestments(await api.getDemoInvestments(params)),
    enabled: Boolean(enabled),
    staleTime: 0,
  })
}

/**
 * Cancel order: returns principal + interest/profit to wallet.
 * Tries demo cancel first, then FD/RD break endpoints.
 */
export function useCancelDemoInvestment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ type, id }) => {
      const t = String(type || 'FD').toUpperCase()
      const tryEndpoints = [
        () => api.cancelDemoInvestment(t, id),
        () => api.breakDemoInvestment(t, id),
        () => (t === 'RD' ? api.breakRd(id) : api.breakFd(id)),
      ]
      let lastError = null
      for (const run of tryEndpoints) {
        try {
          return parseCancelInvestment(await run())
        } catch (err) {
          lastError = err
          if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
            continue
          }
          throw err
        }
      }
      throw lastError || new Error('Failed to cancel investment')
    },
    onSuccess: async () => {
      await invalidateDemoWalletQueries(queryClient)
      await invalidateMoneyQueries(queryClient)
    },
  })
}
