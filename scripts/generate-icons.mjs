/**
 * Generates PNG favicons from the MoneyTrend coin emblem (pure JS, no native deps).
 * Run: npm run icons
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { PNG } from 'pngjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'public', 'icons')

const BRAND_GREEN = { r: 18, g: 39, b: 28 }
const COIN_FACE = { r: 247, g: 208, b: 70 }
const COIN_FACE_LIGHT = { r: 255, g: 243, b: 176 }
const COIN_RING = { r: 201, g: 145, b: 14 }
const COIN_RING_DARK = { r: 138, g: 95, b: 8 }
const MONOGRAM = { r: 18, g: 39, b: 28 }

function lerp(a, b, t) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  }
}

function inRoundRect(x, y, size, radius) {
  if (x < 0 || y < 0 || x >= size || y >= size) return false
  const r = radius
  if (x < r && y < r) return (x - r) ** 2 + (y - r) ** 2 <= r * r
  if (x >= size - r && y < r) return (x - (size - r)) ** 2 + (y - r) ** 2 <= r * r
  if (x < r && y >= size - r) return (x - r) ** 2 + (y - (size - r)) ** 2 <= r * r
  if (x >= size - r && y >= size - r) {
    return (x - (size - r)) ** 2 + (y - (size - r)) ** 2 <= r * r
  }
  return true
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(px - x1, py - y1)
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

function distToQuadratic(px, py, x0, y0, cx, cy, x1, y1, steps = 12) {
  let min = Infinity
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const omt = 1 - t
    const qx = omt * omt * x0 + 2 * omt * t * cx + t * t * x1
    const qy = omt * omt * y0 + 2 * omt * t * cy + t * t * y1
    min = Math.min(min, Math.hypot(px - qx, py - qy))
  }
  return min
}

/** Map pixel to logo coordinate space (coin center 620,410 in 420×420 crop). */
function toLogo(x, y, size) {
  const pad = size * 0.06
  const inner = size - pad * 2
  const lx = 410 + (x - pad) * (420 / inner)
  const ly = 200 + (y - pad) * (420 / inner)
  return { lx, ly }
}

function coinColor(lx, ly) {
  const dx = lx - 620
  const dy = ly - 410
  const dist = Math.hypot(dx, dy)
  if (dist > 210) return null
  if (dist > 196) {
    const t = (dist - 196) / 14
    return lerp(COIN_FACE, COIN_RING, t)
  }
  const highlight = Math.max(0, 1 - Math.hypot(dx + 35, dy + 45) / 170)
  return lerp(COIN_FACE, COIN_FACE_LIGHT, highlight * 0.55)
}

function inMonogram(lx, ly, stroke) {
  const d1 = distToSegment(lx, ly, 540, 470, 540, 360)
  const d1q = distToQuadratic(lx, ly, 540, 360, 540, 315, 583, 315)
  const d1q2 = distToQuadratic(lx, ly, 583, 315, 620, 315, 620, 360)
  const d1v = distToSegment(lx, ly, 620, 360, 620, 460)

  const d2 = distToSegment(lx, ly, 620, 460, 620, 360)
  const d2q = distToQuadratic(lx, ly, 620, 360, 620, 315, 657, 315)
  const d2q2 = distToQuadratic(lx, ly, 657, 315, 700, 315, 700, 360)
  const d2v = distToSegment(lx, ly, 700, 360, 700, 470)

  const d3 = distToSegment(lx, ly, 620, 400, 620, 500)
  const d3q = distToQuadratic(lx, ly, 620, 500, 620, 520, 600, 520)
  const d3q2 = distToQuadratic(lx, ly, 600, 520, 583, 520, 583, 502)
  const d4 = distToSegment(lx, ly, 583, 400, 657, 400)

  const minD = Math.min(d1, d1q, d1q2, d1v, d2, d2q, d2q2, d2v, d3, d3q, d3q2, d4)
  return minD <= stroke
}

function renderIcon(size, { withBackground = true } = {}) {
  const png = new PNG({ width: size, height: size })
  const radius = size * 0.22
  const stroke = Math.max(2.2, size * 0.045)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2
      const inShape = withBackground ? inRoundRect(x, y, size, radius) : true
      if (!inShape) {
        png.data[idx + 3] = 0
        continue
      }

      const { lx, ly } = toLogo(x, y, size)
      let c = withBackground ? BRAND_GREEN : null

      const coin = coinColor(lx, ly)
      if (coin) c = coin
      if (inMonogram(lx, ly, stroke)) c = MONOGRAM

      if (!c) {
        png.data[idx + 3] = withBackground ? 0 : 0
        if (!withBackground) continue
        c = BRAND_GREEN
      }

      png.data[idx] = c.r
      png.data[idx + 1] = c.g
      png.data[idx + 2] = c.b
      png.data[idx + 3] = 255
    }
  }
  return PNG.sync.write(png)
}

function renderFaviconIco(size) {
  const png = new PNG({ width: size, height: size })
  const stroke = Math.max(2.2, size * 0.045)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2
      const { lx, ly } = toLogo(x, y, size)
      const coin = coinColor(lx, ly)
      let c = coin
      if (inMonogram(lx, ly, stroke)) c = MONOGRAM
      if (!c) {
        png.data[idx + 3] = 0
        continue
      }
      png.data[idx] = c.r
      png.data[idx + 1] = c.g
      png.data[idx + 2] = c.b
      png.data[idx + 3] = 255
    }
  }
  return PNG.sync.write(png)
}

function renderOg() {
  const w = 1200
  const h = 630
  const png = new PNG({ width: w, height: h })
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (w * y + x) << 2
      png.data[idx] = 248
      png.data[idx + 1] = 250
      png.data[idx + 2] = 252
      png.data[idx + 3] = 255
    }
  }
  const iconSize = 280
  const icon = PNG.sync.read(renderIcon(iconSize))
  const ox = 120
  const oy = Math.floor((h - iconSize) / 2)
  for (let y = 0; y < iconSize; y++) {
    for (let x = 0; x < iconSize; x++) {
      const si = (iconSize * y + x) << 2
      if (icon.data[si + 3] === 0) continue
      const dx = ox + x
      const dy = oy + y
      const di = (w * dy + dx) << 2
      png.data[di] = icon.data[si]
      png.data[di + 1] = icon.data[si + 1]
      png.data[di + 2] = icon.data[si + 2]
      png.data[di + 3] = 255
    }
  }
  return PNG.sync.write(png)
}

function main() {
  mkdirSync(outDir, { recursive: true })

  const files = [
    { name: 'favicon-16x16.png', size: 16, dir: 'public', transparent: true },
    { name: 'favicon-32x32.png', size: 32, dir: 'public', transparent: true },
    { name: 'apple-touch-icon.png', size: 180, dir: 'public', transparent: false },
    { name: 'icon-192.png', size: 192, dir: 'icons', transparent: false },
    { name: 'icon-512.png', size: 512, dir: 'icons', transparent: false },
  ]

  for (const { name, size, dir, transparent } of files) {
    const buf = transparent ? renderFaviconIco(size) : renderIcon(size)
    const path = dir === 'public' ? join(root, 'public', name) : join(outDir, name)
    writeFileSync(path, buf)
    console.log('Wrote', path)
  }

  writeFileSync(join(root, 'public', 'favicon.ico'), renderFaviconIco(32))
  console.log('Wrote public/favicon.ico')

  writeFileSync(join(root, 'public', 'og-image.png'), renderOg())
  console.log('Wrote public/og-image.png')
}

main()
