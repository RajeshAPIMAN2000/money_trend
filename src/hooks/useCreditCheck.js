import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import {
  parseCreditCheckResult,
  parseCreditCheckHistory,
  parseLatestCreditCheck,
  mapCreditApiError,
} from '../lib/creditCheck.js'

export function useLatestCreditCheck(enabled = true) {
  return useQuery({
    queryKey: ['credit-check', 'latest'],
    queryFn: async () => parseLatestCreditCheck(await api.getCreditCheckLatest()),
    enabled,
    retry: false,
  })
}

export function useCreditCheckHistory(enabled = true) {
  return useQuery({
    queryKey: ['credit-check', 'history'],
    queryFn: async () => parseCreditCheckHistory(await api.getCreditChecks()),
    enabled,
  })
}

export function useCreditCheckDetail(id) {
  return useQuery({
    queryKey: ['credit-check', id],
    queryFn: async () => parseCreditCheckResult(await api.getCreditCheckById(id)),
    enabled: Boolean(id),
  })
}

export function useSubmitCreditCheck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      try {
        return parseCreditCheckResult(await api.submitCreditCheck(payload))
      } catch (err) {
        err.userMessage = mapCreditApiError(err)
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-check'] })
    },
  })
}

export function useAdminCreditChecks(params = {}) {
  return useQuery({
    queryKey: ['admin', 'credit-checks', params],
    queryFn: async () => parseCreditCheckHistory(await api.getAdminCreditChecks(params)),
  })
}
