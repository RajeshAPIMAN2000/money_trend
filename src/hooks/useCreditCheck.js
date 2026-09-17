import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import {
  parseCreditCheckResult,
  parseCreditCheckHistory,
  parseLatestCreditCheck,
  parseCreditReport,
  mapCreditApiError,
  formatRetryAfter,
  pollLatestCreditCheck,
} from '../lib/creditCheck.js'

export function useLatestCreditCheck(options = {}) {
  const opts = typeof options === 'boolean' ? { enabled: options } : options
  const { enabled = true, mobile, refetchInterval } = opts
  const cleanMobile = mobile ? String(mobile).replace(/\D/g, '') : ''
  return useQuery({
    queryKey: ['credit-check', 'latest', cleanMobile || 'auth'],
    queryFn: async () =>
      parseLatestCreditCheck(
        await api.getCreditCheckLatest(cleanMobile ? { mobile: cleanMobile } : {}),
      ),
    enabled: Boolean(enabled),
    retry: false,
    refetchInterval: typeof refetchInterval === 'function'
      ? refetchInterval
      : (refetchInterval || false),
  })
}

export function useCreditCheckHistory(options = {}) {
  const opts = typeof options === 'boolean' ? { enabled: options } : options
  const { enabled = true, mobile } = opts
  const cleanMobile = mobile ? String(mobile).replace(/\D/g, '') : ''
  return useQuery({
    queryKey: ['credit-check', 'history', cleanMobile || 'auth'],
    queryFn: async () =>
      parseCreditCheckHistory(
        await api.getCreditChecks(cleanMobile ? { mobile: cleanMobile } : {}),
      ),
    enabled: Boolean(enabled),
  })
}

export function useCreditCheckDetail(id, { mobile, refetchInterval } = {}) {
  const cleanMobile = mobile ? String(mobile).replace(/\D/g, '') : ''
  return useQuery({
    queryKey: ['credit-check', id, cleanMobile],
    queryFn: async () =>
      parseCreditCheckResult(
        await api.getCreditCheckById(id, cleanMobile ? { mobile: cleanMobile } : {}),
      ),
    enabled: Boolean(id),
    refetchInterval: refetchInterval || false,
  })
}

/** Full bureau report via GET /credit-check/:id (+ /report) */
export function useCreditCheckReport(checkId, { mobile, enabled = true, refetchInterval } = {}) {
  const cleanMobile = mobile ? String(mobile).replace(/\D/g, '') : ''
  return useQuery({
    queryKey: ['credit-check', 'report', checkId, cleanMobile || 'auth'],
    queryFn: async () => {
      const params = cleanMobile ? { mobile: cleanMobile } : {}
      let detail = null
      let detailError = null

      try {
        const detailPayload = await api.getCreditCheckById(checkId, params)
        detail = detailPayload?.data ?? detailPayload
      } catch (err) {
        if (err?.status === 401 || err?.status === 403) {
          err.userMessage = mapCreditApiError(err) || 'Please sign in to view the full credit report.'
          err.needsLogin = true
          throw err
        }
        detailError = err
      }

      let reportWrap = null
      let loginRequired = false
      try {
        reportWrap = parseCreditReport(await api.getCreditCheckReport(checkId, params))
      } catch (reportErr) {
        if (reportErr?.status === 401 || reportErr?.status === 403) {
          loginRequired = true
          // If we have no detail either, surface as login-required error
          if (!detail) {
            reportErr.userMessage = mapCreditApiError(reportErr) || 'Please sign in to view the full credit report.'
            reportErr.needsLogin = true
            throw reportErr
          }
        }
      }

      if (!detail && !reportWrap) {
        const err = detailError || new Error('Unable to load credit report')
        err.userMessage = mapCreditApiError(err) || 'Unable to load credit report'
        throw err
      }

      const fromDetail = parseCreditReport({
        data: {
          ...(detail || {}),
          check_id: detail?.id ?? checkId,
          pan_number: detail?.pan_number ?? detail?.pan,
          disclaimer: reportWrap?.disclaimer,
        },
      })

      return {
        ...fromDetail,
        ...(reportWrap || {}),
        pan: reportWrap?.pan || fromDetail.pan,
        accounts: (reportWrap?.accounts?.length ? reportWrap.accounts : fromDetail.accounts) || [],
        enquiries: (reportWrap?.enquiries?.length ? reportWrap.enquiries : fromDetail.enquiries) || [],
        checkId: fromDetail.checkId || checkId,
        status: String(reportWrap?.status || fromDetail.status || detail?.status || '').toLowerCase(),
        loginRequired,
      }
    },
    enabled: Boolean(enabled) && Boolean(checkId),
    retry: false,
    refetchInterval: refetchInterval || false,
  })
}

export function useSubmitCreditCheck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const mobile = payload.mobile
      const latestParams = mobile ? { mobile } : {}

      try {
        let parsed = parseCreditCheckResult(await api.submitCreditCheck(payload))

        // PENDING → SUCCESS: poll GET /credit-check/latest (Bearer or ?mobile=)
        if (parsed.pending || (parsed.score == null && parsed.status === 'pending')) {
          const polled = await pollLatestCreditCheck(async () => {
            const latest = await api.getCreditCheckLatest(latestParams)
            return parseLatestCreditCheck(latest)
          }, { attempts: 15, delayMs: 1500 })
          if (polled) parsed = polled
        }

        return parsed
      } catch (err) {
        // Backend cooldown (often 24h per mobile/PAN): reuse latest stored check
        if (err?.status === 429) {
          try {
            const latest = parseLatestCreditCheck(await api.getCreditCheckLatest(latestParams))
            if (latest && (latest.score != null || latest.pending || latest.availableBureaus?.length)) {
              const wait = formatRetryAfter(err?.data?.retryAfter ?? err?.data?.retry_after)
              return {
                ...latest,
                rateLimited: true,
                message:
                  mapCreditApiError(err)
                  || `A recent credit check already exists.${wait} Showing your latest scores.`,
              }
            }
          } catch {
            // fall through to normal error
          }
        }

        err.userMessage = mapCreditApiError(err)
        if (err?.status === 401 || err?.status === 403) {
          err.needsLogin = true
        }
        throw err
      }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['credit-check'] })
      const mobile = vars?.mobile
      if (mobile) {
        queryClient.invalidateQueries({
          queryKey: ['credit-check', 'latest', String(mobile).replace(/\D/g, '')],
        })
      }
    },
  })
}

export function useAdminCreditChecks(params = {}) {
  return useQuery({
    queryKey: ['admin', 'credit-checks', params],
    queryFn: async () => parseCreditCheckHistory(await api.getAdminCreditChecks(params)),
  })
}
