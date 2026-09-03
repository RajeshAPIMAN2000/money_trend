import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api.js'
import {
  parseDepositsList,
  parseDepositDetail,
  parseOrdersList,
  parseOrderDetail,
  parseWithdrawalsList,
  parseWithdrawalDetail,
  parseTransactionsList,
  parseTransactionDetail,
} from '../../lib/adminTransactions.js'

export function useAdminDeposits(params = {}) {
  return useQuery({
    queryKey: ['admin', 'deposits', params],
    queryFn: async () => parseDepositsList(await api.getAdminDeposits(params)),
  })
}

export function useAdminDeposit(id) {
  return useQuery({
    queryKey: ['admin', 'deposits', id],
    queryFn: async () => parseDepositDetail(await api.getAdminDeposit(id)),
    enabled: Boolean(id),
  })
}

export function useAdminUserDeposits(userId) {
  return useQuery({
    queryKey: ['admin', 'deposits', 'user', userId],
    queryFn: async () => parseDepositsList(await api.getAdminUserDeposits(userId)),
    enabled: Boolean(userId),
  })
}

export function useAdminOrders(params = {}) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: async () => parseOrdersList(await api.getAdminOrders(params)),
  })
}

export function useAdminOrder(id) {
  return useQuery({
    queryKey: ['admin', 'orders', id],
    queryFn: async () => parseOrderDetail(await api.getAdminOrder(id)),
    enabled: Boolean(id),
  })
}

export function useAdminWithdrawals(params = {}) {
  return useQuery({
    queryKey: ['admin', 'withdrawals', params],
    queryFn: async () => parseWithdrawalsList(await api.getAdminWithdrawals(params)),
  })
}

export function useAdminWithdrawal(id) {
  return useQuery({
    queryKey: ['admin', 'withdrawals', id],
    queryFn: async () => parseWithdrawalDetail(await api.getAdminWithdrawal(id)),
    enabled: Boolean(id),
  })
}

export function useAdminTransactions(params = {}) {
  return useQuery({
    queryKey: ['admin', 'transactions', params],
    queryFn: async () => parseTransactionsList(await api.getAdminTransactions(params)),
  })
}

export function useAdminTransaction(id) {
  return useQuery({
    queryKey: ['admin', 'transactions', id],
    queryFn: async () => parseTransactionDetail(await api.getAdminTransaction(id)),
    enabled: Boolean(id),
  })
}
