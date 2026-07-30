import { useEffect, useRef } from 'react'
import type { Locale } from '../../state/appStore'
import { HUE } from './theme'
import { t } from './i18n'

/** World coords (m): +X east, +Z south — khớp WORLD / CITADEL / IMPERIAL. */
const KINH = {
  cx: 0,
  cz: -22,
  halfX: 1331,
  halfZ: 1312,
} as const

const HOANG = {
  cx: 0,
  cz: -180,
  halfX: 311,
  halfZ: 302,
} as const

const MARKERS = [
  { id: 'ngoMon' as const, x: 0, z: 155 },
  { id: 'thaiHoa' as const, x: 0, z: -48 },
]

const W = 168
const H = 168
const PAD = 10

type Props = {
  locale: Locale
}

function worldToCanvas(x: number, z: number): [number, number] {
  const span = Math.max(KINH.halfX, KINH.halfZ) * 2.08
  const scale = (Math.min(W, H) - PAD * 2) / span
  const ox = W / 2
  const oy = H / 2 - KINH.cz * scale * 0.15
  return [ox + x * scale, oy + z * scale]
}

function strokeRect(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cz: number,
  halfX: number,
  halfZ: number,
): void {
  const [x0, y0] = worldToCanvas(cx - halfX, cz - halfZ)
  const [x1, y1] = worldToCanvas(cx + halfX, cz + halfZ)
  ctx.strokeRect(x0, y0, x1 - x0, y1 - y0)
}

function fillRect(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cz: number,
  halfX: number,
  halfZ: number,
): void {
  const [x0, y0] = worldToCanvas(cx - halfX, cz - halfZ)
  const [x1, y1] = worldToCanvas(cx + halfX, cz + halfZ)
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0)
}

function draw(ctx: CanvasRenderingContext2D, locale: Locale): void {
  const labels = t(locale).markers
  ctx.clearRect(0, 0, W, H)

  // Ground wash
  ctx.fillStyle = 'rgba(26, 20, 16, 0.92)'
  ctx.fillRect(0, 0, W, H)

  // Soft vignette ring
  const g = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W * 0.72)
  g.addColorStop(0, 'rgba(232, 220, 200, 0.06)')
  g.addColorStop(1, 'rgba(26, 20, 16, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // Kinh Thành fill + outline
  ctx.fillStyle = 'rgba(110, 110, 104, 0.22)'
  fillRect(ctx, KINH.cx, KINH.cz, KINH.halfX, KINH.halfZ)
  ctx.strokeStyle = HUE.stone
  ctx.lineWidth = 1.4
  strokeRect(ctx, KINH.cx, KINH.cz, KINH.halfX, KINH.halfZ)

  // Hoàng Thành
  ctx.fillStyle = 'rgba(139, 26, 26, 0.28)'
  fillRect(ctx, HOANG.cx, HOANG.cz, HOANG.halfX, HOANG.halfZ)
  ctx.strokeStyle = HUE.son
  ctx.lineWidth = 1.6
  strokeRect(ctx, HOANG.cx, HOANG.cz, HOANG.halfX, HOANG.halfZ)

  // Axis hint (N–S)
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.25)'
  ctx.lineWidth = 0.8
  ctx.beginPath()
  const [ax, ay0] = worldToCanvas(0, KINH.cz - KINH.halfZ)
  const [, ay1] = worldToCanvas(0, KINH.cz + KINH.halfZ)
  ctx.moveTo(ax, ay0)
  ctx.lineTo(ax, ay1)
  ctx.stroke()

  for (const m of MARKERS) {
    const [px, py] = worldToCanvas(m.x, m.z)
    ctx.beginPath()
    ctx.fillStyle = HUE.vang
    ctx.arc(px, py, 3.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = HUE.voi
    ctx.lineWidth = 0.9
    ctx.stroke()

    ctx.font = '600 9px "Segoe UI", system-ui, sans-serif'
    ctx.fillStyle = HUE.voi
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const label = m.id === 'ngoMon' ? labels.ngoMon : labels.thaiHoa
    ctx.fillText(label, px + 6, py)
  }

  // Frame
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.45)'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1)
}

/**
 * Stylized 2D minimap — Kinh Thành / Hoàng Thành outlines + POI markers.
 */
export function Minimap({ locale }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw(ctx, locale)
  }, [locale])

  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      className="block rounded-sm"
      aria-label="Minimap Kinh Thành Huế"
      role="img"
    />
  )
}
