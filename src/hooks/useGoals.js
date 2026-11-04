import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import {
  parseGoalDetail,
  parseGoalTypes,
  parseGoalsList,
} from '../lib/goals.js'
import { invalidateMoneyQueries } from './useDummyPayment.js'

function goalsKey(suffix = []) {
  return ['goals', ...suffix]
}

export function useGoalTypes({ enabled = true } = {}) {
  return useQuery({
    queryKey: goalsKey(['types']),
    queryFn: async () => parseGoalTypes(await api.getGoalTypes()),
    enabled: Boolean(enabled),
    staleTime: 60_000,
  })
}

export function useGoals({ enabled = true } = {}) {
  return useQuery({
    queryKey: goalsKey(['list']),
    queryFn: async () => parseGoalsList(await api.getGoals()),
    enabled: Boolean(enabled),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useGoal(id, { enabled = true } = {}) {
  return useQuery({
    queryKey: goalsKey(['detail', id]),
    queryFn: async () => parseGoalDetail(await api.getGoal(id)),
    enabled: Boolean(enabled && id),
  })
}

export function useGoalMutations() {
  const queryClient = useQueryClient()

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['goals'] }),
      queryClient.invalidateQueries({ queryKey: ['home'] }),
      invalidateMoneyQueries(queryClient),
    ])
  }

  const create = useMutation({
    mutationFn: (body) => api.createGoal(body),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, body }) => api.updateGoal(id, body),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id) => api.deleteGoal(id),
    onSuccess: invalidate,
  })

  const contribute = useMutation({
    mutationFn: ({ id, amount, source = 'wallet' }) =>
      api.contributeToGoal(id, { amount: Number(amount), source }),
    onSuccess: invalidate,
  })

  return { create, update, remove, contribute }
}
