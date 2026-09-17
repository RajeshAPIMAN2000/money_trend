import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import {
  parseDummyPaymentConfig,
  parseDummyOrder,
  parseDummyPayResult,
  parseCibilUnlock,
  parseCanInvest,
  parsePaymentRequiredError,
  buildCreatePaymentBody,
  buildPayBody,
  mapPaymentError,
  DEMO_CARDS_FALLBACK,
  CIBIL_REPORT_FEE,
} from '../lib/dummyPayment.js'

function attachPayError(err) {
  err.userMessage = mapPaymentError(err)
  return err
}

export function useDummyPaymentConfig({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['payments', 'dummy', 'config'],
    queryFn: async () => {
      try {
        return parseDummyPaymentConfig(await api.getDummyPaymentConfig())
      } catch {
        return {
          cards: DEMO_CARDS_FALLBACK,
          fees: { cibil_report: CIBIL_REPORT_FEE },
          message: null,
        }
      }
    },
    enabled: Boolean(enabled),
    staleTime: 60_000,
  })
}

export function useCibilUnlock({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['payments', 'dummy', 'cibil-unlock'],
    queryFn: async () => {
      try {
        return parseCibilUnlock(await api.getDummyCibilUnlock())
      } catch (err) {
        if (err?.status === 401 || err?.status === 403) {
          return { unlocked: false, paidAt: null, orderId: null, message: null }
        }
        throw attachPayError(err)
      }
    },
    enabled: Boolean(enabled),
    retry: false,
  })
}

export function useCreateDummyPayment() {
  return useMutation({
    mutationFn: async (input) => {
      try {
        return parseDummyOrder(await api.createDummyPayment(buildCreatePaymentBody(input)))
      } catch (err) {
        throw attachPayError(err)
      }
    },
  })
}

export function usePayDummyPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, card }) => {
      try {
        return parseDummyPayResult(await api.payDummyPayment(buildPayBody(orderId, card)))
      } catch (err) {
        throw attachPayError(err)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['credit-check'] })
      queryClient.invalidateQueries({ queryKey: ['fd'] })
      queryClient.invalidateQueries({ queryKey: ['rd'] })
    },
  })
}

/** Full flow: create order → pay with card */
export async function runDummyCheckout({ purpose, amount, description, meta, card }) {
  const order = parseDummyOrder(
    await api.createDummyPayment(buildCreatePaymentBody({ purpose, amount, description, meta })),
  )
  if (!order.orderId) {
    const err = new Error('Payment order was not created')
    err.userMessage = 'Payment order was not created'
    throw err
  }
  const paid = parseDummyPayResult(
    await api.payDummyPayment(buildPayBody(order.orderId, card)),
  )
  return { order, paid }
}

export function useWallet({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      const res = await api.getWallet()
      const data = res?.data ?? res
      return {
        balance: Number(data.balance ?? data.wallet_balance ?? data.available_balance ?? 0),
        currency: data.currency ?? 'INR',
        raw: data,
      }
    },
    enabled: Boolean(enabled),
    retry: false,
  })
}

/** Check whether wallet can fund an FD/RD invest (GET /wallet/can-invest). */
export async function checkWalletCanInvest(type, amount) {
  try {
    return parseCanInvest(await api.getWalletCanInvest({ type, amount }))
  } catch (err) {
    // Some backends return 402 for insufficient balance on the check itself
    const from402 = parsePaymentRequiredError(err)
    if (from402) return from402
    throw attachPayError(err)
  }
}

export { parseCanInvest, parsePaymentRequiredError }
