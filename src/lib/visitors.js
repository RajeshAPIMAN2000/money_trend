/**
 * Device visitor identity + visit counting helpers.
 * Each page open / refresh records a visit; device_id identifies same browser.
 */

const DEVICE_KEY = 'moneytrend-device-id'
const LOCAL_COUNT_KEY = 'moneytrend-visitor-count'

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `d-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function getOrCreateDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = randomId()
      localStorage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch {
    return randomId()
  }
}

export function bumpLocalVisitorCount() {
  try {
    const next = (Number(localStorage.getItem(LOCAL_COUNT_KEY)) || 0) + 1
    localStorage.setItem(LOCAL_COUNT_KEY, String(next))
    return next
  } catch {
    return 1
  }
}

export function getLocalVisitorCount() {
  try {
    return Number(localStorage.getItem(LOCAL_COUNT_KEY)) || 0
  } catch {
    return 0
  }
}

export function parseVisitorStats(payload) {
  const root = payload?.data ?? payload ?? {}
  const count = Number(
    root.count
    ?? root.total
    ?? root.total_visits
    ?? root.visits
    ?? root.visitor_count
    ?? root.page_views
    ?? 0,
  )
  return {
    count: Number.isFinite(count) ? count : 0,
    uniqueDevices: Number(root.unique_devices ?? root.unique_visitors ?? root.devices ?? 0) || null,
    deviceId: root.device_id ?? null,
  }
}
