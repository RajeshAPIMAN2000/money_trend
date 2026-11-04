import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api.js'
import {
  parseFixedDepositsList,
  parseRecurringDepositsList,
  parseDepositDetail,
  parseFundPerformance,
  parseAssetAllocation,
  parseUserPortfolio,
} from '../../lib/adminInvestments.js'

export function useAdminFixedDeposits(params = {}) {
  return useQuery({
    queryKey: ['admin', 'investments', 'fixed-deposits', params],
    queryFn: async () => parseFixedDepositsList(await api.getAdminFixedDeposits(params)),
  })
}

export function useAdminFixedDeposit(id) {
  return useQuery({
    queryKey: ['admin', 'investments', 'fixed-deposits', id],
    queryFn: async () => parseDepositDetail(await api.getAdminFixedDeposit(id), 'FD'),
    enabled: Boolean(id),
  })
}

export function useAdminRecurringDeposits(params = {}) {
  return useQuery({
    queryKey: ['admin', 'investments', 'recurring-deposits', params],
    queryFn: async () => parseRecurringDepositsList(await api.getAdminRecurringDeposits(params)),
  })
}

export function useAdminRecurringDeposit(id) {
  return useQuery({
    queryKey: ['admin', 'investments', 'recurring-deposits', id],
    queryFn: async () => parseDepositDetail(await api.getAdminRecurringDeposit(id), 'RD'),
    enabled: Boolean(id),
  })
}

export function useAdminFundPerformance(productType = 'FD') {
  return useQuery({
    queryKey: ['admin', 'investments', 'fund-performance', productType],
    queryFn: async () => {
      const response = await api.getAdminFundPerformance({ product_type: productType })
      return parseFundPerformance(response, productType)
    },
  })
}

export function useAdminAssetAllocation(productType = 'FD') {
  return useQuery({
    queryKey: ['admin', 'investments', 'asset-allocation', productType],
    queryFn: async () => parseAssetAllocation(await api.getAdminAssetAllocation(), productType),
  })
}

export function useAdminUserPortfolio(userId) {
  return useQuery({
    queryKey: ['admin', 'investments', 'portfolio', userId],
    queryFn: async () => parseUserPortfolio(await api.getAdminUserPortfolio(userId)),
    enabled: Boolean(userId),
  })
}
