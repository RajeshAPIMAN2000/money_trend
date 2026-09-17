import { bureauDisplayName } from './creditCheck.js'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function money(value) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  return `₹${n.toLocaleString('en-IN')}`
}

/**
 * Opens a print-ready report window so the user can Save as PDF.
 */
export function downloadCreditReportPdf(report, { maskedPan } = {}) {
  if (!report) return
  const bureau = bureauDisplayName(report.bureau)
  const pan = report.pan || maskedPan || '—'
  const accountsRows = (report.accounts || [])
    .map(
      (a) => `<tr>
      <td>${escapeHtml(a.accountType)}</td>
      <td>${escapeHtml(a.lender)}</td>
      <td>${escapeHtml(a.status)}</td>
      <td>${escapeHtml(money(a.creditLimit))}</td>
      <td>${escapeHtml(money(a.currentBalance))}</td>
      <td>${escapeHtml(money(a.overdueAmount))}</td>
    </tr>`,
    )
    .join('')
  const enquiryRows = (report.enquiries || [])
    .map(
      (e) => `<tr>
      <td>${escapeHtml(e.date)}</td>
      <td>${escapeHtml(e.lender)}</td>
      <td>${escapeHtml(e.purpose)}</td>
    </tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(bureau)} Credit Report</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; color: #0f172a; margin: 32px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    h2 { font-size: 14px; margin: 24px 0 8px; text-transform: uppercase; letter-spacing: .06em; color: #334155; }
    .meta { color: #64748b; font-size: 12px; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin: 12px 0 20px; }
    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
    .label { font-size: 10px; text-transform: uppercase; color: #64748b; }
    .value { font-size: 14px; font-weight: 700; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #f8fafc; }
    .disclaimer { margin-top: 24px; font-size: 11px; color: #64748b; }
    @media print { body { margin: 12mm; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(bureau)} Credit Report</h1>
  <p class="meta">MoneyTrend Private Limited · Generated for PAN ${escapeHtml(pan)}</p>
  <div class="grid">
    <div class="card"><div class="label">Score</div><div class="value">${escapeHtml(report.score ?? '—')}</div></div>
    <div class="card"><div class="label">Band</div><div class="value">${escapeHtml(report.scoreBand ?? '—')}</div></div>
    <div class="card"><div class="label">Status</div><div class="value">${escapeHtml(report.status ?? '—')}</div></div>
    <div class="card"><div class="label">Report Ref</div><div class="value">${escapeHtml(report.reportRefId ?? '—')}</div></div>
    <div class="card"><div class="label">Report Date</div><div class="value">${escapeHtml(report.reportDate ?? '—')}</div></div>
    <div class="card"><div class="label">PAN</div><div class="value">${escapeHtml(pan)}</div></div>
  </div>
  <h2>Accounts (${report.accounts?.length || 0})</h2>
  <table>
    <thead><tr><th>Type</th><th>Lender</th><th>Status</th><th>Limit</th><th>Balance</th><th>Overdue</th></tr></thead>
    <tbody>${accountsRows || '<tr><td colspan="6">No account records</td></tr>'}</tbody>
  </table>
  <h2>Enquiries (${report.enquiries?.length || 0})</h2>
  <table>
    <thead><tr><th>Date</th><th>Lender</th><th>Purpose</th></tr></thead>
    <tbody>${enquiryRows || '<tr><td colspan="3">No enquiry records</td></tr>'}</tbody>
  </table>
  <p class="disclaimer">${escapeHtml(report.disclaimer || 'This report is generated from stored bureau data on MoneyTrend. For official disputes, contact the respective credit bureau.')}</p>
  <script>window.onload = function () { window.print(); }</script>
</body>
</html>`

  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
  if (!win) return
  win.document.open()
  win.document.write(html)
  win.document.close()
}
