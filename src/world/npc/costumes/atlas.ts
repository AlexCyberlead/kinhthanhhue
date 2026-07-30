import * as THREE from 'three'
import { COSTUME_IDS, OUTFIT_PALETTES } from './colors'
import { COSTUME_ATLAS_SIZE, costumeCellPx } from './rects'

let cachedTexture: THREE.CanvasTexture | null = null

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  fill: string,
): void {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(cx, cy - r)
  ctx.lineTo(cx + r, cy)
  ctx.lineTo(cx, cy + r)
  ctx.lineTo(cx - r, cy)
  ctx.closePath()
  ctx.fill()
}

function drawStripes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  count: number,
): void {
  ctx.fillStyle = color
  const gap = size / (count * 2)
  for (let i = 0; i < count; i++) {
    const sy = y + gap * (i * 2 + 0.5)
    ctx.fillRect(x + size * 0.08, sy, size * 0.84, gap * 0.55)
  }
}

function paintCostumeCell(
  ctx: CanvasRenderingContext2D,
  index: number,
  id: string,
): void {
  const { x, y, size } = costumeCellPx(index)
  const pal = OUTFIT_PALETTES[id]
  if (!pal) return

  // Base fabric
  ctx.fillStyle = pal.primary
  ctx.fillRect(x, y, size, size)

  // Soft vertical fold
  const grad = ctx.createLinearGradient(x, y, x + size, y)
  grad.addColorStop(0, 'rgba(0,0,0,0.18)')
  grad.addColorStop(0.35, 'rgba(255,255,255,0.08)')
  grad.addColorStop(0.65, 'rgba(0,0,0,0.05)')
  grad.addColorStop(1, 'rgba(0,0,0,0.22)')
  ctx.fillStyle = grad
  ctx.fillRect(x, y, size, size)

  // Collar / neck band
  ctx.fillStyle = pal.secondary
  ctx.fillRect(x + size * 0.18, y + size * 0.06, size * 0.64, size * 0.1)

  // Trim border
  ctx.strokeStyle = pal.trim
  ctx.lineWidth = Math.max(4, size * 0.035)
  ctx.strokeRect(x + size * 0.06, y + size * 0.06, size * 0.88, size * 0.88)

  // Role-specific motif (stylized, low-detail)
  switch (id) {
    case 'npc_vua':
      drawDiamond(ctx, x + size * 0.5, y + size * 0.48, size * 0.16, pal.accent)
      drawDiamond(ctx, x + size * 0.5, y + size * 0.48, size * 0.08, pal.trim)
      break
    case 'npc_quan_van':
    case 'npc_quan_vo':
      // Bổ tử square
      ctx.fillStyle = pal.accent
      ctx.fillRect(x + size * 0.32, y + size * 0.32, size * 0.36, size * 0.36)
      ctx.fillStyle = pal.trim
      ctx.fillRect(x + size * 0.4, y + size * 0.4, size * 0.2, size * 0.2)
      break
    case 'npc_ve_binh':
      drawStripes(ctx, x, y + size * 0.2, size, pal.trim, 4)
      ctx.fillStyle = pal.accent
      ctx.beginPath()
      ctx.arc(x + size * 0.5, y + size * 0.22, size * 0.12, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'npc_cung_nu':
    case 'npc_hoang_hau':
      ctx.fillStyle = pal.accent
      ctx.beginPath()
      ctx.ellipse(x + size * 0.5, y + size * 0.5, size * 0.18, size * 0.1, 0, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'npc_nhac_cong':
      ctx.fillStyle = pal.accent
      ctx.fillRect(x + size * 0.25, y + size * 0.45, size * 0.5, size * 0.12)
      ctx.fillStyle = pal.trim
      ctx.fillRect(x + size * 0.45, y + size * 0.35, size * 0.1, size * 0.35)
      break
    case 'npc_non_la':
      ctx.fillStyle = pal.trim
      ctx.beginPath()
      ctx.ellipse(x + size * 0.5, y + size * 0.28, size * 0.28, size * 0.1, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = pal.accent
      ctx.beginPath()
      ctx.ellipse(x + size * 0.5, y + size * 0.28, size * 0.12, size * 0.04, 0, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'npc_tay_su':
      ctx.fillStyle = pal.trim
      ctx.fillRect(x + size * 0.28, y + size * 0.22, size * 0.44, size * 0.12)
      ctx.fillStyle = pal.accent
      ctx.fillRect(x + size * 0.42, y + size * 0.55, size * 0.16, size * 0.28)
      break
    case 'npc_tourist':
      ctx.fillStyle = pal.accent
      ctx.fillRect(x + size * 0.35, y + size * 0.4, size * 0.3, size * 0.22)
      ctx.fillStyle = pal.trim
      ctx.fillRect(x + size * 0.42, y + size * 0.35, size * 0.16, size * 0.08)
      break
    case 'npc_tang_si':
      drawStripes(ctx, x, y + size * 0.25, size, pal.secondary, 3)
      ctx.fillStyle = pal.accent
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.arc(x + size * (0.3 + i * 0.1), y + size * 0.72, size * 0.025, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    default:
      drawStripes(ctx, x, y + size * 0.28, size, pal.trim, 3)
      break
  }

  // Hem band
  ctx.fillStyle = pal.trim
  ctx.fillRect(x + size * 0.1, y + size * 0.82, size * 0.8, size * 0.08)

  // Cell separator (1px dark) — atlas packing clarity
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  ctx.lineWidth = 1
  ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1)
}

function paintAtlas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('costume atlas: 2d context unavailable')

  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, COSTUME_ATLAS_SIZE, COSTUME_ATLAS_SIZE)

  COSTUME_IDS.forEach((id, i) => paintCostumeCell(ctx, i, id))
}

/**
 * Singleton CanvasTexture 1024² — procedural outfit atlas.
 * Safe gọi nhiều lần; dispose chỉ khi teardown scene (optional).
 */
export function getCostumeAtlasTexture(): THREE.Texture {
  if (cachedTexture) return cachedTexture

  const canvas = document.createElement('canvas')
  canvas.width = COSTUME_ATLAS_SIZE
  canvas.height = COSTUME_ATLAS_SIZE
  paintAtlas(canvas)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.generateMipmaps = true
  tex.needsUpdate = true
  tex.name = 'costume-atlas'

  cachedTexture = tex
  return tex
}

/** Test / HMR — force rebuild. */
export function disposeCostumeAtlas(): void {
  if (!cachedTexture) return
  cachedTexture.dispose()
  cachedTexture = null
}
