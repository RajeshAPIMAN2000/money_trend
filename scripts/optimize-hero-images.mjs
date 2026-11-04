import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = path.join(projectDir, 'public', 'assets', 'images')
const outputDir = path.join(projectDir, 'public', 'assets', 'optimized')
const widths = [640, 960, 1600, 1920]
const images = [
  { source: 'Grow Your Wealth Smarter.png', name: 'home-hero-v1' },
  { source: 'Secure Returns, Guaranteed.png', name: 'home-hero-v1-secure' },
]

await mkdir(outputDir, { recursive: true })

for (const image of images) {
  for (const width of widths) {
    const output = path.join(outputDir, `${image.name}-${width}.webp`)
    await sharp(path.join(sourceDir, image.source))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(output)
    console.log(`Generated ${path.relative(projectDir, output)}`)
  }
}

for (const width of [128, 256, 384]) {
  const output = path.join(outputDir, `money-trend-logo-v1-${width}.webp`)
  await sharp(path.join(sourceDir, 'money-trend-logo.png'))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(output)
  console.log(`Generated ${path.relative(projectDir, output)}`)
}