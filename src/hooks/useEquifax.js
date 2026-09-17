import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import {
  parseEquifaxEnrollment,
  parseEquifaxScore,
  parseEquifaxScoreHistory,
  parseEquifaxReport,
  parseEquifaxReportSection,
  parseEquifaxMonitoring,
  parseEquifaxMonitoringAlert,
  mapEquifaxApiError,
  DEFAULT_SCORE_FEATURE,
} from '../lib/equifax.js'

function attachMappedError(err) {
  const mapped = mapEquifaxApiError(err)
  err.userMessage = mapped.message
  err.errorCode = mapped.code
  err.needsEnroll = mapped.needsEnroll
  err.needsLogin = mapped.needsLogin
  err.configIncomplete = mapped.configIncomplete
  return err
}

export function useEquifaxEnrollment({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['equifax', 'enrollment'],
    queryFn: async () => {
      try {
        return parseEquifaxEnrollment(await api.getEquifaxEnrollment())
      } catch (err) {
        const mapped = mapEquifaxApiError(err)
        // 404 = not enrolled yet (normal). 503 = Equifax not configured on backend.
        if (
          err?.status === 404
          || mapped.code === 'EQUIFAX_ENROLLMENT_REQUIRED'
          || mapped.code === 'EQUIFAX_RESOURCE_NOT_FOUND'
        ) {
          return {
            enrollmentId: null,
            status: 'not_enrolled',
            enrolled: false,
            features: [],
            lastSyncedAt: null,
            lastSyncedAtLabel: '—',
            message: null,
            configIncomplete: false,
          }
        }
        if (err?.status === 503 || mapped.configIncomplete) {
          return {
            enrollmentId: null,
            status: 'unavailable',
            enrolled: false,
            features: [],
            lastSyncedAt: null,
            lastSyncedAtLabel: '—',
            message: mapped.message || 'Equifax not configured yet',
            configIncomplete: true,
          }
        }
        throw attachMappedError(err)
      }
    },
    enabled: Boolean(enabled),
    retry: false,
  })
}

export function useEnrollEquifax() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      try {
        return parseEquifaxEnrollment(await api.enrollEquifax(payload))
      } catch (err) {
        throw attachMappedError(err)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equifax'] })
    },
  })
}

export function useRequestEquifaxScore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      try {
        return parseEquifaxScore(await api.requestEquifaxScore(payload))
      } catch (err) {
        throw attachMappedError(err)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equifax', 'credit-score'] })
      queryClient.invalidateQueries({ queryKey: ['equifax', 'credit-score-history'] })
    },
  })
}

export function useEquifaxCreditScore(options = {}) {
  const {
    enabled = true,
    featureName = DEFAULT_SCORE_FEATURE,
    scoreType,
  } = options
  return useQuery({
    queryKey: ['equifax', 'credit-score', featureName || '', scoreType || ''],
    queryFn: async () => {
      try {
        return parseEquifaxScore(
          await api.getEquifaxCreditScore({ featureName, scoreType }),
        )
      } catch (err) {
        throw attachMappedError(err)
      }
    },
    enabled: Boolean(enabled),
    retry: false,
  })
}

export function useEquifaxScoreHistory({
  enabled = true,
  historicalLimit = 12,
  featureName = DEFAULT_SCORE_FEATURE,
} = {}) {
  return useQuery({
    queryKey: ['equifax', 'credit-score-history', historicalLimit, featureName || ''],
    queryFn: async () => {
      try {
        return parseEquifaxScoreHistory(
          await api.getEquifaxCreditScoreHistory({ historicalLimit, featureName }),
        )
      } catch (err) {
        throw attachMappedError(err)
      }
    },
    enabled: Boolean(enabled),
    retry: false,
  })
}

export function useEquifaxCreditReport({ enabled = true, reportType } = {}) {
  return useQuery({
    queryKey: ['equifax', 'credit-report', reportType || ''],
    queryFn: async () => {
      try {
        return parseEquifaxReport(await api.getEquifaxCreditReport({ reportType }))
      } catch (err) {
        throw attachMappedError(err)
      }
    },
    enabled: Boolean(enabled),
    retry: false,
  })
}

export function useEquifaxReportDetails({
  enabled = true,
  creditReportId,
  section,
} = {}) {
  return useQuery({
    queryKey: ['equifax', 'report-details', creditReportId || '', section || ''],
    queryFn: async () => {
      try {
        return parseEquifaxReportSection(
          await api.getEquifaxReportDetails({ creditReportId, section }),
        )
      } catch (err) {
        throw attachMappedError(err)
      }
    },
    enabled: Boolean(enabled) && Boolean(section),
    retry: false,
  })
}

export function useEquifaxMonitoring({ enabled = true, sync = true } = {}) {
  return useQuery({
    queryKey: ['equifax', 'monitoring', sync ? 'sync' : 'nosync'],
    queryFn: async () => {
      try {
        return parseEquifaxMonitoring(await api.getEquifaxMonitoring({ sync }))
      } catch (err) {
        const mapped = mapEquifaxApiError(err)
        if (err?.status === 404 || mapped.needsEnroll) {
          return { synced: false, enrolled: false, status: 'empty', alerts: [], message: mapped.message }
        }
        throw attachMappedError(err)
      }
    },
    enabled: Boolean(enabled),
    retry: false,
  })
}

export function useEquifaxMonitoringAlert(alertId, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['equifax', 'monitoring-alert', alertId],
    queryFn: async () => {
      try {
        return parseEquifaxMonitoringAlert(await api.getEquifaxMonitoringAlert(alertId))
      } catch (err) {
        throw attachMappedError(err)
      }
    },
    enabled: Boolean(enabled) && Boolean(alertId),
    retry: false,
  })
}

/** Composite hook for Equifax dashboard */
export function useEquifax({ enabled = true, enrolled = false } = {}) {
  const enrollment = useEquifaxEnrollment({ enabled })
  const isEnrolled = enrolled || Boolean(enrollment.data?.enrolled)
  const enroll = useEnrollEquifax()
  const requestScore = useRequestEquifaxScore()
  const score = useEquifaxCreditScore({ enabled: enabled && isEnrolled })
  const scoreHistory = useEquifaxScoreHistory({ enabled: enabled && isEnrolled })
  const report = useEquifaxCreditReport({ enabled: enabled && isEnrolled })
  const monitoring = useEquifaxMonitoring({ enabled: enabled && isEnrolled, sync: true })

  return {
    enrollment,
    enroll,
    requestScore,
    score,
    scoreHistory,
    report,
    monitoring,
    isEnrolled,
  }
}
