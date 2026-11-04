import { ApiError, api, getAdminToken } from './api.js'
import { parseAdminDashboard } from './adminDashboard.js'
import { exportDashboardAuditCsv, exportDashboardAuditXlsx } from './dashboardAuditReport.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

function getFilenameFromDisposition(header, fallback) {
  if (!header) return fallback
  const match = header.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i)
  return match ? decodeURIComponent(match[1].replace(/"/g, '')) : fallback
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

async function downloadFromApi(type, format) {
  const token = getAdminToken()
  const res = await fetch(
    `${API_BASE}/admin/exports/${encodeURIComponent(type)}?format=${encodeURIComponent(format)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    },
  )

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new ApiError(data.message || data.error || 'Export failed', res.status, data)
  }

  const blob = await res.blob()
  const extension = format === 'xlsx' || format === 'excel' ? 'xlsx' : 'csv'
  const fallbackName = `${type}-report.${extension}`
  const filename = getFilenameFromDisposition(res.headers.get('content-disposition'), fallbackName)
  triggerBlobDownload(blob, filename)
  return { filename }
}

async function downloadDashboardAudit(format) {
  const response = await api.getAdminDashboard()
  const data = parseAdminDashboard(response)

  if (format === 'xlsx' || format === 'excel') {
    return exportDashboardAuditXlsx(data)
  }

  return exportDashboardAuditCsv(data)
}

export async function downloadAdminExport(type, format = 'csv') {
  const token = getAdminToken()
  if (!token) {
    throw new ApiError('Please sign in to export reports', 401, {})
  }

  if (type === 'dashboard') {
    return downloadDashboardAudit(format)
  }

  return downloadFromApi(type, format)
}
