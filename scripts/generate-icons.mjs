/**
 * Generates PNG favicons from public/icons/icon.svg paths (pure JS, no native deps).
 * Run: npm run icons
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { PNG } from 'pngjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'public', 'icons')

const PRIMARY = { r: 15, g: 23, b: 42 }
const SECONDARY = { r: 37, g: 99, b: 235 }
const WHITE = { r: 255, g: 255, b: 255 }

function lerp(a, b, t) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  }
}

function bgColor(x, y, size) {
  const t = (x + y) / (2 * size)
  return lerp(SECONDARY, PRIMARY, Math.min(1, Math.max(0, t)))
}

function inRoundRect(x, y, size, radius) {
  if (x < 0 || y < 0 || x >= size || y >= size) return false
  const r = radius
  if (x < r && y < r) return (x - r) ** 2 + (y - r) ** 2 <= r * r
  if (x >= size - r && y < r) return (x - (size - r)) ** 2 + (y - r) ** 2 <= r * r
  if (x < r && y >= size - r) return (x - r) ** 2 + (y - (size - r)) ** 2 <= r * r
  if (x >= size - r && y >= size - r) return (x - (size - r)) ** 2 + (y - (size - r)) ** 2 <= r * r
  return true
}

/** Bold “F” mark in normalized 0–1 box */
function inLetterF(nx, ny) {
  if (nx < 0.22 || nx > 0.78 || ny < 0.18 || ny > 0.82) return false
  const bar = nx < 0.38
  const top = ny < 0.38 && nx < 0.72
  const mid = ny > 0.44 && ny < 0.56 && nx < 0.58
  return bar || top || mid
}

function renderIcon(size) {
  const png = new PNG({ width: size, height: size })
  const radius = size * 0.22

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2
      if (!inRoundRect(x, y, size, radius)) {
        png.data[idx + 3] = 0
        continue
      }
      const nx = x / size
      const ny = y / size
      const c = inLetterF(nx, ny) ? WHITE : bgColor(x, y, size)
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
    { name: 'favicon-16x16.png', size: 16, dir: 'public' },
    { name: 'favicon-32x32.png', size: 32, dir: 'public' },
    { name: 'apple-touch-icon.png', size: 180, dir: 'public' },
    { name: 'icon-192.png', size: 192, dir: 'icons' },
    { name: 'icon-512.png', size: 512, dir: 'icons' },
  ]

  for (const { name, size, dir } of files) {
    const buf = renderIcon(size)
    const path = dir === 'public' ? join(root, 'public', name) : join(outDir, name)
    writeFileSync(path, buf)
    console.log('Wrote', path)
  }

  writeFileSync(join(root, 'public', 'favicon.ico'), renderIcon(32))
  console.log('Wrote public/favicon.ico')

  writeFileSync(join(root, 'public', 'og-image.png'), renderOg())
  console.log('Wrote public/og-image.png')
}

main()
