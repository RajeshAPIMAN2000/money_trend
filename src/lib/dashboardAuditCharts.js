const SEGMENT_COLORS = ['#1E3A5F', '#B91C1C', '#65A30D', '#CA8A04', '#7C3AED', '#0891B2', '#EA580C', '#DB2777']
const SERIES_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']

function createCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function toBase64(canvas) {
  return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '')
}

function drawTitle(ctx, title, width) {
  ctx.fillStyle = '#1E293B'
  ctx.font = 'bold 13px Segoe UI, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(title, width / 2, 22)
  ctx.textAlign = 'left'
}

function scaleValue(value, min, max, height, top) {
  if (max === min) return top + height / 2
  return top + height - ((value - min) / (max - min)) * height
}

export function renderInvestmentTrendChart(points, title = 'Investment Value Trend') {
  if (!points?.length) return null

  const width = 520
  const height = 280
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const padding = { top: 36, right: 88, bottom: 36, left: 52 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, height)

  drawTitle(ctx, title, width)

  const values = points.map((p) => Number(p.value ?? 0))
  const min = Math.min(...values) * 0.92
  const max = Math.max(...values) * 1.08
  const stepX = points.length > 1 ? chartW / (points.length - 1) : chartW

  ctx.strokeStyle = '#E2E8F0'
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (chartH / 4) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()
  }

  ctx.fillStyle = '#64748B'
  ctx.font = '10px Segoe UI, Arial, sans-serif'
  ctx.fillText('₹ Cr', 8, padding.top + 8)

  const coords = points.map((point, index) => ({
    x: padding.left + stepX * index,
    y: scaleValue(Number(point.value ?? 0), min, max, chartH, padding.top),
    label: point.day ?? point.month ?? `P${index + 1}`,
    value: Number(point.value ?? 0),
  }))

  for (let i = 1; i < coords.length; i += 1) {
    ctx.strokeStyle = SEGMENT_COLORS[(i - 1) % SEGMENT_COLORS.length]
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(coords[i - 1].x, coords[i - 1].y)
    ctx.lineTo(coords[i].x, coords[i].y)
    ctx.stroke()
  }

  coords.forEach((coord, index) => {
    ctx.fillStyle = SEGMENT_COLORS[index % SEGMENT_COLORS.length]
    ctx.beginPath()
    ctx.arc(coord.x, coord.y, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#475569'
    ctx.font = '10px Segoe UI, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(coord.label, coord.x, height - 14)
  })

  let legendY = padding.top
  points.forEach((point, index) => {
    const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length]
    const x = width - padding.right + 10
    ctx.fillStyle = color
    ctx.fillRect(x, legendY, 10, 10)
    ctx.fillStyle = '#334155'
    ctx.font = '10px Segoe UI, Arial, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`${point.day ?? point.month}: ${point.value}`, x + 14, legendY + 9)
    legendY += 16
  })

  return toBase64(canvas)
}

export function renderMultiSeriesChart(points, series, title = 'Market Trend') {
  if (!points?.length || !series?.length) return null

  const width = 520
  const height = 280
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const padding = { top: 36, right: 20, bottom: 36, left: 52 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, height)
  drawTitle(ctx, title, width)

  const allValues = points.flatMap((point) => series.map((key) => Number(point[key] ?? 0)))
  const min = Math.min(...allValues) * 0.98
  const max = Math.max(...allValues) * 1.02
  const stepX = points.length > 1 ? chartW / (points.length - 1) : chartW

  ctx.strokeStyle = '#E2E8F0'
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (chartH / 4) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()
  }

  series.forEach((key, seriesIndex) => {
    const color = SERIES_COLORS[seriesIndex % SERIES_COLORS.length]
    const coords = points.map((point, index) => ({
      x: padding.left + stepX * index,
      y: scaleValue(Number(point[key] ?? 0), min, max, chartH, padding.top),
    }))

    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    coords.forEach((coord, index) => {
      if (index === 0) ctx.moveTo(coord.x, coord.y)
      else ctx.lineTo(coord.x, coord.y)
    })
    ctx.stroke()
  })

  points.forEach((point, index) => {
    const x = padding.left + stepX * index
    ctx.fillStyle = '#475569'
    ctx.font = '10px Segoe UI, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(point.month ?? point.day ?? `P${index + 1}`, x, height - 14)
  })

  let legendX = padding.left
  const legendY = 12
  series.forEach((key, index) => {
    const color = SERIES_COLORS[index % SERIES_COLORS.length]
    ctx.fillStyle = color
    ctx.fillRect(legendX, legendY, 10, 10)
    ctx.fillStyle = '#334155'
    ctx.font = '10px Segoe UI, Arial, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(key.toUpperCase(), legendX + 14, legendY + 9)
    legendX += 90
  })

  return toBase64(canvas)
}

export function renderBarChart(points, valueKey, labelKey, title = 'Revenue Trend') {
  if (!points?.length) return null

  const width = 520
  const height = 280
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const padding = { top: 36, right: 20, bottom: 40, left: 52 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, height)
  drawTitle(ctx, title, width)

  const values = points.map((p) => Number(p[valueKey] ?? 0))
  const max = Math.max(...values, 1) * 1.15
  const barWidth = chartW / points.length * 0.6
  const gap = chartW / points.length

  points.forEach((point, index) => {
    const value = Number(point[valueKey] ?? 0)
    const barH = (value / max) * chartH
    const x = padding.left + gap * index + (gap - barWidth) / 2
    const y = padding.top + chartH - barH

    ctx.fillStyle = '#10B981'
    ctx.fillRect(x, y, barWidth, barH)

    ctx.fillStyle = '#475569'
    ctx.font = '10px Segoe UI, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(point[labelKey] ?? point.month ?? `P${index + 1}`, x + barWidth / 2, height - 14)
  })

  return toBase64(canvas)
}

export function renderPieChart(segments, title = 'Allocation') {
  if (!segments?.length) return null

  const width = 360
  const height = 280
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const cx = 120
  const cy = 150
  const radius = 72
  const total = segments.reduce((sum, item) => sum + Number(item.value ?? 0), 0) || 1

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, height)
  drawTitle(ctx, title, width)

  let startAngle = -Math.PI / 2
  segments.forEach((segment, index) => {
    const slice = (Number(segment.value ?? 0) / total) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, radius, startAngle, startAngle + slice)
    ctx.closePath()
    ctx.fillStyle = segment.color ?? SERIES_COLORS[index % SERIES_COLORS.length]
    ctx.fill()
    startAngle += slice
  })

  let legendY = 70
  segments.forEach((segment, index) => {
    const color = segment.color ?? SERIES_COLORS[index % SERIES_COLORS.length]
    ctx.fillStyle = color
    ctx.fillRect(220, legendY, 10, 10)
    ctx.fillStyle = '#334155'
    ctx.font = '11px Segoe UI, Arial, sans-serif'
    ctx.fillText(`${segment.name}: ${segment.value}%`, 236, legendY + 9)
    legendY += 18
  })

  return toBase64(canvas)
}
