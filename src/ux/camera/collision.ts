import { WORLD } from '../../data/worldConfig'

const EYE = 1.7
const WALL_THICK = 6

type Aabb = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  /** Openings where walk-through is allowed (gate gaps). */
  gaps?: Array<{ min: number; max: number; axis: 'x' | 'z' }>
}

/** Hollow rectangle wall bands (approx) — imperial + citadel. */
function wallBands(): Aabb[] {
  const bands: Aabb[] = []

  // —— Hoàng Thành (center ≈ [0, -180]) ——
  const icx = 0
  const icz = -180
  const ihx = WORLD.extents.imperialHalfX
  const ihz = WORLD.extents.imperialHalfZ
  const t = WALL_THICK

  // North — Hoa Bình Môn gap
  bands.push({
    minX: icx - ihx - t,
    maxX: icx + ihx + t,
    minZ: icz - ihz - t,
    maxZ: icz - ihz + t,
    gaps: [{ axis: 'x', min: -14, max: 14 }],
  })
  // South — Ngọ Môn gap (wide)
  bands.push({
    minX: icx - ihx - t,
    maxX: icx + ihx + t,
    minZ: icz + ihz - t,
    maxZ: icz + ihz + t,
    gaps: [{ axis: 'x', min: -32, max: 32 }],
  })
  // West — Chương Đức
  bands.push({
    minX: icx - ihx - t,
    maxX: icx - ihx + t,
    minZ: icz - ihz,
    maxZ: icz + ihz,
    gaps: [{ axis: 'z', min: icz - 14, max: icz + 14 }],
  })
  // East — Hiển Nhơn
  bands.push({
    minX: icx + ihx - t,
    maxX: icx + ihx + t,
    minZ: icz - ihz,
    maxZ: icz + ihz,
    gaps: [{ axis: 'z', min: icz - 14, max: icz + 14 }],
  })

  // —— Kinh Thành approx (no detailed gate carve — soft outer fence) ——
  const ccx = 0
  const ccz = -22
  const chx = WORLD.extents.citadelHalfX
  const chz = WORLD.extents.citadelHalfZ
  const ct = WALL_THICK * 1.5
  // South citadel — leave a wide central approach toward Phu Văn / Kỳ Đài axis
  bands.push({
    minX: ccx - chx - ct,
    maxX: ccx + chx + ct,
    minZ: ccz + chz - ct,
    maxZ: ccz + chz + ct,
    gaps: [{ axis: 'x', min: -80, max: 80 }],
  })
  bands.push({
    minX: ccx - chx - ct,
    maxX: ccx + chx + ct,
    minZ: ccz - chz - ct,
    maxZ: ccz - chz + ct,
    gaps: [{ axis: 'x', min: -40, max: 40 }],
  })
  bands.push({
    minX: ccx - chx - ct,
    maxX: ccx - chx + ct,
    minZ: ccz - chz,
    maxZ: ccz + chz,
    gaps: [{ axis: 'z', min: ccz - 40, max: ccz + 40 }],
  })
  bands.push({
    minX: ccx + chx - ct,
    maxX: ccx + chx + ct,
    minZ: ccz - chz,
    maxZ: ccz + chz,
    gaps: [{ axis: 'z', min: ccz - 40, max: ccz + 40 }],
  })

  return bands
}

const BANDS = wallBands()

function inGap(x: number, z: number, b: Aabb): boolean {
  if (!b.gaps) return false
  for (const g of b.gaps) {
    if (g.axis === 'x' && x >= g.min && x <= g.max) return true
    if (g.axis === 'z' && z >= g.min && z <= g.max) return true
  }
  return false
}

function hitsBand(x: number, z: number, b: Aabb): boolean {
  if (x < b.minX || x > b.maxX || z < b.minZ || z > b.maxZ) return false
  if (inGap(x, z, b)) return false
  return true
}

/**
 * Simple walk collision: keep feet on y≈0 terrain, block approx wall AABBs.
 * Separates X/Z so sliding along walls still works. Gate gaps punched for Ngọ Môn etc.
 */
export function resolveWalkPosition(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
): { x: number; y: number; z: number } {
  let x = toX
  let z = toZ

  const blocked = (px: number, pz: number) => BANDS.some((b) => hitsBand(px, pz, b))

  if (blocked(x, fromZ)) x = fromX
  if (blocked(x, z)) z = fromZ
  if (blocked(x, z)) {
    x = fromX
    z = fromZ
  }

  const lim = WORLD.extents.citadelHalfX + 80
  x = Math.max(-lim, Math.min(lim, x))
  z = Math.max(
    -WORLD.extents.citadelHalfZ - 80,
    Math.min(WORLD.extents.citadelHalfZ + 200, z),
  )

  return { x, y: EYE, z }
}

export const WALK_EYE_HEIGHT = EYE
