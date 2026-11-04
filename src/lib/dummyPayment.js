/**
 * Dummy payment helpers — MoneyTrend /api/payments/dummy/* only.
 */

export const PAYMENT_PURPOSES = {
  CIBIL_REPORT: 'cibil_report',
  WALLET_DEPOSIT: 'wallet_deposit',
  FD_INVEST: 'fd_invest',
  RD_INVEST: 'rd_invest',
}

export const CIBIL_REPORT_FEE = 99
export const DEMO_OTP_FALLBACK = '1234'

export const DEMO_CARDS_FALLBACK = [
  {
    label: 'Visa success',
    card_number: '4111111111111111',
    cvv: '123',
    expiry_month: '12',
    expiry_year: '30',
    card_holder: 'Demo User',
  },
  {
    label: 'Mastercard success',
    card_number: '5555555555554444',
    cvv: '123',
    expiry_month: '12',
    expiry_year: '30',
    card_holder: 'Demo User',
  },
]

function unwrap(payload) {
  return payload?.data ?? payload ?? {}
}

export function parseDummyPaymentConfig(payload) {
  const root = unwrap(payload)
  const cards = Array.isArray(root.cards)
    ? root.cards
    : (Array.isArray(root.demo_cards) ? root.demo_cards : DEMO_CARDS_FALLBACK)
  const fees = root.fees ?? root.fee ?? {}
  const otpInfo = root.otp && typeof root.otp === 'object' ? root.otp : {}
  const demoOtp = String(
    root.demo_otp
    ?? root.demoOtp
    ?? otpInfo.demo_otp
    ?? otpInfo.code
    ?? DEMO_OTP_FALLBACK,
  )
  return {
    cards: cards.map((c, i) => ({
      label: c.label || c.name || `Demo card ${i + 1}`,
      card_number: String(c.card_number || c.number || ''),
      cvv: String(c.cvv || '123'),
      expiry_month: String(c.expiry_month || c.month || (String(c.expiry || '').split('/')[0] || '12')),
      expiry_year: String(c.expiry_year || c.year || (String(c.expiry || '').split('/')[1] || '30')),
      card_holder: c.card_holder || c.holder || 'Demo User',
    })),
    fees: {
      cibil_report: Number(fees.cibil_report ?? fees.cibilReport ?? CIBIL_REPORT_FEE),
    },
    demoOtp,
    otpLength: Number(
      root.otp_length
      ?? otpInfo.otp_length
      ?? otpInfo.length
      ?? demoOtp.length
      ?? 4,
    ),
    otpRequired: Boolean(otpInfo.otp_required ?? true),
    message: root.message ?? payload?.message ?? otpInfo.otp_hint ?? null,
  }
}

export function parseDummyOrder(payload) {
  const root = unwrap(payload)
  const order = root.order ?? root
  return {
    orderId: order.order_id ?? order.orderId ?? order.id ?? null,
    amount: Number(order.amount ?? root.amount ?? 0),
    currency: order.currency ?? 'INR',
    purpose: order.purpose ?? root.purpose ?? null,
    status: String(order.status ?? root.status ?? 'created').toLowerCase(),
    description: order.description ?? root.description ?? null,
    raw: order,
  }
}

export function parseDummyPayResult(payload) {
  const root = unwrap(payload)
  const status = String(root.status ?? 'paid').toLowerCase()
  const otpInfo = root.otp && typeof root.otp === 'object' ? root.otp : {}
  return {
    success: payload?.success !== false,
    orderId: root.order_id ?? root.orderId ?? null,
    status,
    otpPending: status === 'otp_pending' || Boolean(root.next_step?.includes?.('OTP') || root.next_step?.includes?.('otp')),
    amount: Number(root.amount ?? 0),
    walletCredited: Boolean(root.wallet_credited ?? root.walletCredited),
    cibilUnlocked: Boolean(root.cibil_unlocked ?? root.cibilUnlocked ?? root.unlocked),
    demoOtp: String(otpInfo.demo_otp ?? otpInfo.code ?? root.demo_otp ?? DEMO_OTP_FALLBACK),
    otpLength: Number(otpInfo.otp_length ?? otpInfo.length ?? root.otp_length ?? 4),
    message: payload?.message ?? root.message ?? (status === 'otp_pending'
      ? 'Enter the bank OTP to complete payment'
      : 'Payment successful'),
    card: root.card ?? null,
  }
}

export function buildVerifyOtpBody(orderId, otp) {
  return {
    order_id: orderId,
    otp: String(otp || '').replace(/\D/g, ''),
  }
}

export function parseCibilUnlock(payload) {
  const root = unwrap(payload)
  return {
    unlocked: Boolean(
      root.unlocked
      ?? root.cibil_unlocked
      ?? root.cibilUnlocked
      ?? root.has_access
      ?? root.hasAccess,
    ),
    paidAt: root.paid_at ?? root.paidAt ?? null,
    orderId: root.order_id ?? root.orderId ?? null,
    message: root.message ?? payload?.message ?? null,
  }
}

/**
 * GET /wallet/can-invest (or 402 invest body) — wallet-first gate.
 */
export function parseCanInvest(payload) {
  const root = unwrap(payload)
  const payment = root.payment && typeof root.payment === 'object' ? root.payment : {}
  const canPayFromWallet = Boolean(
    root.can_pay_from_wallet ?? root.canPayFromWallet,
  )
  const showPaymentGateway = Boolean(
    root.show_payment_gateway ?? root.showPaymentGateway ?? (!canPayFromWallet && (
      root.shortfall != null || payment.amount != null
    )),
  )
  const shortfall = Number(
    root.shortfall
    ?? payment.amount
    ?? payment.shortfall
    ?? 0,
  )
  const purpose = payment.purpose
    ?? root.purpose
    ?? null

  return {
    canPayFromWallet,
    showPaymentGateway,
    walletBalance: Number(root.wallet_balance ?? root.walletBalance ?? 0),
    requiredTotal: Number(root.required_total ?? root.requiredTotal ?? 0),
    shortfall,
    payment: {
      purpose,
      amount: Number(payment.amount ?? shortfall ?? 0),
      create: payment.create ?? null,
      pay: payment.pay ?? null,
    },
    message: root.message ?? payload?.message ?? null,
    raw: root,
  }
}

/** Extract can-invest / payment hint from a 402 ApiError (or similar). */
export function parsePaymentRequiredError(err) {
  if (!err) return null
  const status = err.status
  if (status !== 402 && status !== 400) return null
  const body = err.data ?? {}
  const parsed = parseCanInvest(body)
  const hasGatewayHint = Boolean(
    parsed.showPaymentGateway
    || parsed.shortfall > 0
    || parsed.payment?.amount > 0
    || body.show_payment_gateway
    || body.payment,
  )
  if (!hasGatewayHint) return null
  return {
    ...parsed,
    showPaymentGateway: true,
    shortfall: parsed.shortfall || Number(parsed.payment?.amount || 0),
  }
}

export function buildCreatePaymentBody({ purpose, amount, description, meta } = {}) {
  const body = {
    purpose: String(purpose || PAYMENT_PURPOSES.WALLET_DEPOSIT),
  }
  if (purpose !== PAYMENT_PURPOSES.CIBIL_REPORT && amount != null && amount !== '') {
    body.amount = Number(amount)
  }
  if (description) body.description = String(description)
  if (meta && typeof meta === 'object') body.meta = meta
  return body
}

export function buildPayBody(orderId, card) {
  return {
    order_id: orderId,
    card_number: String(card.card_number || '').replace(/\s/g, ''),
    cvv: String(card.cvv || ''),
    expiry_month: String(card.expiry_month || '').padStart(2, '0'),
    expiry_year: String(card.expiry_year || '').slice(-2),
    card_holder: String(card.card_holder || 'Demo User').trim(),
  }
}

export function purposeLabel(purpose) {
  switch (purpose) {
    case PAYMENT_PURPOSES.CIBIL_REPORT:
      return 'CIBIL Report Unlock'
    case PAYMENT_PURPOSES.FD_INVEST:
      return 'FD Investment'
    case PAYMENT_PURPOSES.RD_INVEST:
      return 'RD Investment'
    case PAYMENT_PURPOSES.WALLET_DEPOSIT:
      return 'Wallet Top-up'
    default:
      return 'Payment'
  }
}

export function formatInr(amount) {
  const n = Number(amount)
  if (Number.isNaN(n)) return '—'
  return `₹${n.toLocaleString('en-IN')}`
}

export function mapPaymentError(err) {
  const status = err?.status
  const msg = err?.data?.message || err?.message || 'Payment failed'
  if (status === 401) return 'Please sign in to continue payment.'
  if (status === 403) return 'You do not have permission to complete this payment.'
  if (status === 402) return msg || 'Insufficient wallet balance. Please top up to continue.'
  if (status === 400 || status === 422) return msg || 'Please check card details and try again.'
  if (status === 429) return 'Too many payment attempts. Please wait and try again.'
  if (status >= 500) return 'Payment service is temporarily unavailable.'
  return msg
}
