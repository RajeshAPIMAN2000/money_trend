import ExcelJS from 'exceljs'
import {
  renderInvestmentTrendChart,
  renderMultiSeriesChart,
  renderBarChart,
  renderPieChart,
} from './dashboardAuditCharts.js'

const THEME = {
  navy: 'FF1E3A5F',
  headerBlue: 'FF2563EB',
  white: 'FFFFFFFF',
  slate900: 'FF0F172A',
  slate700: 'FF334155',
  slate500: 'FF64748B',
  border: 'FFE2E8F0',
  blueBg: 'FFEFF6FF',
  greenBg: 'FFECFDF5',
  amberBg: 'FFFFFBEB',
  roseBg: 'FFFFF1F2',
  violetBg: 'FFF5F3FF',
}

function enrichInvestmentTrend(trend) {
  return trend.map((row, index) => {
    const prev = index > 0 ? Number(trend[index - 1].value ?? 0) : Number(row.value ?? 0)
    const current = Number(row.value ?? 0)
    const growth = index === 0 || !prev ? 0 : ((current - prev) / prev) * 100
    let status = 'Stable'
    if (growth > 0.5) status = 'Positive'
    else if (growth < -0.5) status = 'Negative'

    return {
      day: row.day ?? row.month,
      value: current,
      growth,
      status,
    }
  })
}

function kycTotal(kycSummary, kycMeta) {
  if (kycMeta?.total) return kycMeta.total
  return kycSummary.reduce((sum, item) => sum + Number(item.value ?? 0), 0)
}

function styleCell(cell, {
  bold = false,
  color = THEME.slate900,
  bg,
  size = 11,
  align = 'left',
  wrap = false,
} = {}) {
  cell.font = { bold, size, color: { argb: color } }
  cell.alignment = { horizontal: align, vertical: 'middle', wrapText: wrap }
  if (bg) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
  }
  cell.border = {
    top: { style: 'thin', color: { argb: THEME.border } },
    left: { style: 'thin', color: { argb: THEME.border } },
    bottom: { style: 'thin', color: { argb: THEME.border } },
    right: { style: 'thin', color: { argb: THEME.border } },
  }
}

function mergeSectionTitle(sheet, row, text, endCol = 10) {
  sheet.mergeCells(row, 1, row, endCol)
  const cell = sheet.getCell(row, 1)
  cell.value = text
  styleCell(cell, { bold: true, color: THEME.white, bg: THEME.headerBlue, align: 'left' })
  sheet.getRow(row).height = 22
}

function addTableHeader(sheet, row, headers) {
  headers.forEach((header, index) => {
    const cell = sheet.getCell(row, index + 1)
    cell.value = header
    styleCell(cell, { bold: true, color: THEME.white, bg: THEME.navy, align: 'center' })
  })
  sheet.getRow(row).height = 20
}

function addTableRow(sheet, row, values, { boldFirst = false } = {}) {
  values.forEach((value, index) => {
    const cell = sheet.getCell(row, index + 1)
    cell.value = value
    styleCell(cell, {
      bold: boldFirst && index === 0,
      align: index === 0 ? 'left' : 'center',
    })
  })
}

function addKpiRow(sheet, row, items) {
  let col = 1
  items.forEach((item) => {
    sheet.mergeCells(row, col, row, col + 1)
    const labelCell = sheet.getCell(row, col)
    labelCell.value = item.label
    styleCell(labelCell, { bold: true, color: THEME.slate500, bg: item.bg, align: 'center', size: 10 })

    sheet.mergeCells(row + 1, col, row + 1, col + 1)
    const valueCell = sheet.getCell(row + 1, col)
    valueCell.value = item.value
    styleCell(valueCell, {
      bold: true,
      color: item.valueColor ?? THEME.slate900,
      bg: item.bg,
      align: 'center',
      size: 14,
    })

    col += 2
  })
}

async function addChartImage(workbook, sheet, base64, position) {
  if (!base64) return
  const imageId = workbook.addImage({
    base64,
    extension: 'png',
  })
  sheet.addImage(imageId, position)
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function buildDashboardAuditWorkbook(data) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'MoneyTrend Admin'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Audit Report', {
    views: [{ showGridLines: false }],
  })

  sheet.columns = [
    { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 },
    { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 },
  ]

  const period = data.dateRangeLabel || 'Current reporting period'
  const kycCount = kycTotal(data.kycSummary, data.kycMeta)
  const investmentRows = enrichInvestmentTrend(data.investmentTrend)

  sheet.mergeCells(1, 1, 1, 10)
  const titleCell = sheet.getCell(1, 1)
  titleCell.value = 'INVESTMENT PLATFORM — ADMIN AUDIT REPORT'
  styleCell(titleCell, { bold: true, color: THEME.white, bg: THEME.navy, align: 'center', size: 16 })
  sheet.getRow(1).height = 30

  sheet.mergeCells(2, 1, 2, 10)
  const subtitleCell = sheet.getCell(2, 1)
  subtitleCell.value = `Management & Audit Reporting | Reporting Period: ${period} | Prepared from dashboard metrics`
  styleCell(subtitleCell, { color: THEME.slate700, bg: 'FFF8FAFC', align: 'center', size: 10 })
  sheet.getRow(2).height = 20

  addKpiRow(sheet, 4, [
    { label: 'Total Users', value: data.mainKpis.totalUsers.value, bg: THEME.blueBg, valueColor: 'FF2563EB' },
    { label: 'Total Investments', value: data.mainKpis.totalInvestments.value, bg: THEME.greenBg, valueColor: 'FF059669' },
    { label: 'Portfolio Value', value: data.mainKpis.portfolioValue.value, bg: THEME.blueBg, valueColor: 'FF2563EB' },
    { label: 'Revenue Generated', value: data.mainKpis.revenueGenerated.value, bg: THEME.amberBg, valueColor: 'FFD97706' },
    { label: 'Pending KYC', value: data.secondaryKpis.pendingKyc.value, bg: THEME.roseBg, valueColor: 'FFDC2626' },
  ])

  addKpiRow(sheet, 7, [
    { label: "Today's Deposits", value: data.secondaryKpis.todaysDeposits.value, bg: THEME.greenBg, valueColor: 'FF059669' },
    { label: "Today's Withdrawals", value: data.secondaryKpis.todaysWithdrawals.value, bg: THEME.amberBg, valueColor: 'FFD97706' },
    { label: 'Active SIPs', value: data.secondaryKpis.activeSips.value, bg: THEME.blueBg, valueColor: 'FF2563EB' },
    { label: 'KYC Total', value: kycCount, bg: THEME.violetBg, valueColor: 'FF7C3AED' },
    { label: 'Report Status', value: 'READY', bg: THEME.greenBg, valueColor: 'FF059669' },
  ])

  let row = 10
  mergeSectionTitle(sheet, row, 'AUDIT & REPORT METADATA')
  row += 1
  addTableHeader(sheet, row, ['Field', 'Value', '', '', '', '', '', '', '', ''])
  row += 1

  const metadata = [
    ['Report Type', 'Investment Platform — Management & Audit Report'],
    ['Period', period],
    ['Prepared For', 'Internal Audit / Compliance / Management'],
    ['Currency', 'INR (₹)'],
    ['Data Status', 'Live dashboard snapshot'],
    ['Confidentiality', 'Internal Use Only'],
  ]
  metadata.forEach(([field, value]) => {
    sheet.mergeCells(row, 2, row, 10)
    sheet.getCell(row, 1).value = field
    sheet.getCell(row, 2).value = value
    styleCell(sheet.getCell(row, 1), { bold: true, bg: 'FFF8FAFC' })
    styleCell(sheet.getCell(row, 2), { bg: 'FFFFFFFF' })
    row += 1
  })

  row += 1
  mergeSectionTitle(sheet, row, 'INVESTMENT OVERVIEW — WEEKLY TREND')
  row += 1
  addTableHeader(sheet, row, ['Day', 'Investment Value (₹ Cr)', 'Growth %', 'Status'])
  row += 1
  const investmentTableStart = row
  investmentRows.forEach((item) => {
    addTableRow(sheet, row, [
      item.day,
      item.value.toFixed(2),
      `${item.growth.toFixed(1)}%`,
      item.status,
    ])
    row += 1
  })

  const investmentChart = renderInvestmentTrendChart(data.investmentTrend, 'Investment Value Trend')
  await addChartImage(workbook, sheet, investmentChart, {
    tl: { col: 4.2, row: investmentTableStart - 1 },
    ext: { width: 520, height: 280 },
  })

  row += 1
  mergeSectionTitle(sheet, row, data.marketTrendMeta?.title ?? 'MARKET OVERVIEW')
  row += 1
  addTableHeader(sheet, row, ['Period', 'NIFTY 50', 'SENSEX', 'Gold'])
  row += 1
  const marketTableStart = row
  data.marketTrend.forEach((item) => {
    addTableRow(sheet, row, [item.month, item.nifty, item.sensex, item.gold])
    row += 1
  })

  const marketChart = renderMultiSeriesChart(
    data.marketTrend,
    ['nifty', 'sensex', 'gold'],
    data.marketTrendMeta?.title ?? 'Market Overview',
  )
  await addChartImage(workbook, sheet, marketChart, {
    tl: { col: 4.2, row: marketTableStart - 1 },
    ext: { width: 520, height: 280 },
  })

  row += 1
  mergeSectionTitle(sheet, row, data.revenueMeta?.title ?? 'REVENUE OVERVIEW')
  row += 1
  addTableHeader(sheet, row, ['Month', 'Revenue (₹ Cr)'])
  row += 1
  const revenueTableStart = row
  data.revenueTrend.forEach((item) => {
    addTableRow(sheet, row, [item.month, item.revenue])
    row += 1
  })

  const revenueChart = renderBarChart(
    data.revenueTrend,
    'revenue',
    'month',
    data.revenueMeta?.title ?? 'Revenue Overview',
  )
  await addChartImage(workbook, sheet, revenueChart, {
    tl: { col: 2.2, row: revenueTableStart - 1 },
    ext: { width: 520, height: 280 },
  })

  row += 1
  mergeSectionTitle(sheet, row, data.assetAllocationMeta?.title ?? 'ASSET ALLOCATION OVERVIEW')
  row += 1
  addTableHeader(sheet, row, ['Asset Class', 'Allocation %'])
  row += 1
  const allocationTableStart = row
  data.assetAllocation.forEach((item) => {
    addTableRow(sheet, row, [item.name, `${item.value}%`])
    row += 1
  })

  const allocationChart = renderPieChart(
    data.assetAllocation,
    data.assetAllocationMeta?.title ?? 'Asset Allocation',
  )
  await addChartImage(workbook, sheet, allocationChart, {
    tl: { col: 2.2, row: allocationTableStart - 1 },
    ext: { width: 360, height: 280 },
  })

  row += 1
  mergeSectionTitle(sheet, row, 'TOP PERFORMING INVESTMENTS')
  row += 1
  addTableHeader(sheet, row, ['Investment', 'Return %', 'Progress %'])
  row += 1
  data.topInvestments.forEach((item) => {
    addTableRow(sheet, row, [item.name, `+${item.return}%`, item.progress])
    row += 1
  })

  row += 1
  mergeSectionTitle(sheet, row, 'MARKET INDICES')
  row += 1
  addTableHeader(sheet, row, ['Index', 'Value', 'Change'])
  row += 1
  data.marketIndices.forEach((item) => {
    addTableRow(sheet, row, [item.name, item.value, item.change])
    row += 1
  })

  row += 1
  mergeSectionTitle(sheet, row, 'RECENT TRANSACTIONS')
  row += 1
  addTableHeader(sheet, row, ['User', 'Action', 'Amount', 'Time'])
  row += 1
  if (data.recentTransactions.length === 0) {
    sheet.mergeCells(row, 1, row, 4)
    const cell = sheet.getCell(row, 1)
    cell.value = 'No recent transactions in this period'
    styleCell(cell, { align: 'center', color: THEME.slate500 })
    row += 1
  } else {
    data.recentTransactions.forEach((item) => {
      addTableRow(sheet, row, [item.user, item.action, item.amount, item.time])
      row += 1
    })
  }

  row += 1
  mergeSectionTitle(sheet, row, data.kycMeta?.title ?? 'KYC VERIFICATION SUMMARY')
  row += 1
  addTableHeader(sheet, row, ['Status', 'Count', 'Share %'])
  row += 1
  const kycTableStart = row
  const kycSum = kycTotal(data.kycSummary, data.kycMeta) || 1
  data.kycSummary.forEach((item) => {
    addTableRow(sheet, row, [
      item.name,
      item.value,
      `${Math.round((item.value / kycSum) * 100)}%`,
    ])
    row += 1
  })

  const kycChart = renderPieChart(data.kycSummary, data.kycMeta?.title ?? 'KYC Summary')
  await addChartImage(workbook, sheet, kycChart, {
    tl: { col: 3.2, row: kycTableStart - 1 },
    ext: { width: 360, height: 280 },
  })

  row += 1
  mergeSectionTitle(sheet, row, 'SYSTEM STATUS')
  row += 1
  addTableHeader(sheet, row, ['Service', 'Status'])
  row += 1
  data.systemStatus.forEach((item) => {
    addTableRow(sheet, row, [item.name, item.status])
    row += 1
  })

  return workbook
}

export async function exportDashboardAuditXlsx(data) {
  const workbook = await buildDashboardAuditWorkbook(data)
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const filename = `dashboard-audit-report-${new Date().toISOString().slice(0, 10)}.xlsx`
  triggerDownload(blob, filename)
  return { filename }
}

function csvEscape(value) {
  const text = String(value ?? '')
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function csvSection(title, headers, rows) {
  const lines = [title, headers.map(csvEscape).join(',')]
  rows.forEach((row) => lines.push(row.map(csvEscape).join(',')))
  return lines.join('\n')
}

export function exportDashboardAuditCsv(data) {
  const period = data.dateRangeLabel || 'Current reporting period'
  const kycCount = kycTotal(data.kycSummary, data.kycMeta)
  const investmentRows = enrichInvestmentTrend(data.investmentTrend)

  const sections = [
    csvSection('INVESTMENT PLATFORM — ADMIN AUDIT REPORT', ['Field', 'Value'], [
      ['Reporting Period', period],
      ['Total Users', data.mainKpis.totalUsers.value],
      ['Total Investments', data.mainKpis.totalInvestments.value],
      ['Portfolio Value', data.mainKpis.portfolioValue.value],
      ['Revenue Generated', data.mainKpis.revenueGenerated.value],
      ["Today's Deposits", data.secondaryKpis.todaysDeposits.value],
      ["Today's Withdrawals", data.secondaryKpis.todaysWithdrawals.value],
      ['Pending KYC', data.secondaryKpis.pendingKyc.value],
      ['Active SIPs', data.secondaryKpis.activeSips.value],
      ['KYC Total', kycCount],
    ]),
    '',
    csvSection('INVESTMENT OVERVIEW', ['Day', 'Investment Value (Cr)', 'Growth %', 'Status'], investmentRows.map((row) => [
      row.day, row.value.toFixed(2), `${row.growth.toFixed(1)}%`, row.status,
    ])),
    '',
    csvSection('MARKET OVERVIEW', ['Period', 'NIFTY 50', 'SENSEX', 'Gold'], data.marketTrend.map((row) => [
      row.month, row.nifty, row.sensex, row.gold,
    ])),
    '',
    csvSection('REVENUE OVERVIEW', ['Month', 'Revenue (Cr)'], data.revenueTrend.map((row) => [
      row.month, row.revenue,
    ])),
    '',
    csvSection('ASSET ALLOCATION', ['Asset Class', 'Allocation %'], data.assetAllocation.map((row) => [
      row.name, row.value,
    ])),
    '',
    csvSection('TOP INVESTMENTS', ['Investment', 'Return %'], data.topInvestments.map((row) => [
      row.name, row.return,
    ])),
    '',
    csvSection('MARKET INDICES', ['Index', 'Value', 'Change'], data.marketIndices.map((row) => [
      row.name, row.value, row.change,
    ])),
    '',
    csvSection('RECENT TRANSACTIONS', ['User', 'Action', 'Amount', 'Time'], data.recentTransactions.map((row) => [
      row.user, row.action, row.amount, row.time,
    ])),
    '',
    csvSection('KYC SUMMARY', ['Status', 'Count'], data.kycSummary.map((row) => [
      row.name, row.value,
    ])),
    '',
    csvSection('SYSTEM STATUS', ['Service', 'Status'], data.systemStatus.map((row) => [
      row.name, row.status,
    ])),
  ]

  const blob = new Blob([sections.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const filename = `dashboard-audit-report-${new Date().toISOString().slice(0, 10)}.csv`
  triggerDownload(blob, filename)
  return { filename }
}
