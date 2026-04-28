// node scripts/gen-icons.mjs
import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

function draw(size) {
  const c = createCanvas(size, size)
  const ctx = c.getContext('2d')
  const r = size * 0.12

  // Background
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, '#1e40af')
  grad.addColorStop(1, '#0f172a')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, r)
  ctx.fill()

  // Camera body
  const cx = size / 2, cy = size / 2
  const bw = size * 0.6, bh = size * 0.42
  const bx = cx - bw / 2, by = cy - bh / 2 + size * 0.04
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath()
  ctx.roundRect(bx, by, bw, bh, size * 0.06)
  ctx.fill()

  // Lens
  ctx.fillStyle = '#1e40af'
  ctx.beginPath()
  ctx.arc(cx, cy + size * 0.04, size * 0.13, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#93c5fd'
  ctx.beginPath()
  ctx.arc(cx, cy + size * 0.04, size * 0.08, 0, Math.PI * 2)
  ctx.fill()

  // Viewfinder bump
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath()
  ctx.roundRect(cx - size * 0.1, by - size * 0.08, size * 0.2, size * 0.1, size * 0.03)
  ctx.fill()

  return c.toBuffer('image/png')
}

writeFileSync(join(outDir, 'icon-192.png'), draw(192))
writeFileSync(join(outDir, 'icon-512.png'), draw(512))
console.log('Icons generated.')
