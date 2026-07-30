import { CITADEL, CON_DA_VIEN, CON_HEN, MOAT, RIVER } from './terrainConfig'

/** Smoothstep 0..1 */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Cheap value-noise for subtle ground variation (deterministic). */
function hash2(x: number, z: number): number {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function valueNoise(x: number, z: number): number {
  const xi = Math.floor(x)
  const zi = Math.floor(z)
  const xf = x - xi
  const zf = z - zi
  const u = xf * xf * (3 - 2 * xf)
  const v = zf * zf * (3 - 2 * zf)
  const a = hash2(xi, zi)
  const b = hash2(xi + 1, zi)
  const c = hash2(xi, zi + 1)
  const d = hash2(xi + 1, zi + 1)
  return mix(mix(a, b, u), mix(c, d, u), v)
}

function fbm(x: number, z: number): number {
  let amp = 0.5
  let freq = 1
  let sum = 0
  for (let i = 0; i < 3; i++) {
    sum += amp * valueNoise(x * freq, z * freq)
    amp *= 0.5
    freq *= 2.05
  }
  return sum * 2 - 1
}

/**
 * Signed distance to citadel outer wall with Vauban-ish bastion bumps.
 * Negative = inside citadel footprint; 0 ≈ wall outer face.
 */
export function citadelOuterSDF(x: number, z: number): number {
  const cx = (CITADEL.minX + CITADEL.maxX) * 0.5
  const cz = (CITADEL.minZ + CITADEL.maxZ) * 0.5
  const hw = (CITADEL.maxX - CITADEL.minX) * 0.5
  const hd = (CITADEL.maxZ - CITADEL.minZ) * 0.5

  const lx = x - cx
  const lz = z - cz

  // Box SDF (outside positive)
  const dx = Math.abs(lx) - hw
  const dz = Math.abs(lz) - hd
  const boxOutside = Math.min(Math.max(dx, dz), 0) + Math.hypot(Math.max(dx, 0), Math.max(dz, 0))

  // Bastions: corners + mid-edge protrusions (stylized Vauban)
  let bastion = 0
  const br = MOAT.bastionRadius
  const bd = MOAT.bastionDepth

  const corners: [number, number][] = [
    [-hw, -hd],
    [hw, -hd],
    [-hw, hd],
    [hw, hd],
  ]
  for (const [bx, bz] of corners) {
    const d = Math.hypot(lx - bx, lz - bz)
    bastion = Math.max(bastion, br - d)
  }

  const mids: [number, number][] = [
    [0, -hd],
    [0, hd],
    [-hw, 0],
    [hw, 0],
  ]
  for (const [bx, bz] of mids) {
    const d = Math.hypot(lx - bx * 0.92, lz - bz * 0.92)
    bastion = Math.max(bastion, br * 0.85 - d)
  }

  // Push perimeter outward where bastions exist
  return boxOutside - Math.min(bastion, bd) * 0.55
}

/** 0..1 depth weight inside hào channel (V-profile). */
export function moatWeight(x: number, z: number): number {
  const d = citadelOuterSDF(x, z)
  const inner = MOAT.inset
  const outer = MOAT.inset + MOAT.width
  if (d < inner || d > outer) return 0
  const t = (d - inner) / (outer - inner)
  return Math.sin(t * Math.PI)
}

/** 0..1 inside sông Hương channel (excluding islands). */
export function riverWeight(x: number, z: number): number {
  if (x < RIVER.minX || x > RIVER.maxX) return 0
  const dz = Math.abs(z - RIVER.centerZ)
  const half = RIVER.halfWidth
  if (dz > half + RIVER.bankWidth) return 0
  // Soft channel
  const core = 1 - smoothstep(half * 0.55, half, dz)
  return core
}

/** Elliptical island mask 0..1 */
function islandMask(
  x: number,
  z: number,
  cx: number,
  cz: number,
  halfLen: number,
  halfWid: number,
): number {
  const u = (x - cx) / halfLen
  const v = (z - cz) / halfWid
  const r = u * u + v * v
  if (r > 1.15) return 0
  return 1 - smoothstep(0.55, 1.05, Math.sqrt(Math.max(r, 0)))
}

export function conHenMask(x: number, z: number): number {
  return islandMask(x, z, CON_HEN.cx, CON_HEN.cz, CON_HEN.lengthX * 0.5, CON_HEN.widthZ * 0.5)
}

export function conDaVienMask(x: number, z: number): number {
  return islandMask(
    x,
    z,
    CON_DA_VIEN.cx,
    CON_DA_VIEN.cz,
    CON_DA_VIEN.lengthX * 0.5,
    CON_DA_VIEN.widthZ * 0.5,
  )
}

/** Inside Kinh thành (plateau) — soft edge. */
export function citadelInteriorWeight(x: number, z: number): number {
  const d = citadelOuterSDF(x, z)
  // interior when d < -wallThickness roughly
  return 1 - smoothstep(-CITADEL.wallThickness - 40, -8, d)
}

/**
 * Sample terrain height (metres / Y).
 * Flat-ish in citadel, gentle slope south to river, dug moat + river bed, raised cồn.
 */
export function sampleHeight(x: number, z: number): number {
  const inside = citadelInteriorWeight(x, z)

  // Base: slight southward fall toward minh đường
  let h = 0.35 - Math.max(0, z - 100) * 0.0018
  // Northern gentle rise
  h += Math.max(0, -z - 400) * 0.0006

  // Keep citadel interior flatter / slightly elevated pavement feel
  h = mix(h, 0.55, inside * 0.85)

  // Micro relief — weaker inside walls
  const n = fbm(x * 0.004, z * 0.004)
  h += n * mix(0.55, 0.08, inside)

  // Hào Hộ Thành trench
  const moat = moatWeight(x, z)
  if (moat > 0) {
    h = mix(h, MOAT.bedY, moat)
  }

  // Sông Hương bed
  const river = riverWeight(x, z)
  const hen = conHenMask(x, z)
  const daVien = conDaVienMask(x, z)
  const island = Math.max(hen, daVien)

  if (river > 0) {
    // Dig channel, then raise islands above water
    const bed = mix(h, RIVER.bedY, river * (1 - island * 0.95))
    h = bed
  }

  // Soft banks outside channel
  const bankDist = Math.abs(z - RIVER.centerZ)
  if (bankDist > RIVER.halfWidth * 0.5 && bankDist < RIVER.halfWidth + RIVER.bankWidth) {
    const bt = 1 - smoothstep(RIVER.halfWidth * 0.5, RIVER.halfWidth + RIVER.bankWidth, bankDist)
    h = mix(h, mix(RIVER.bedY + 0.4, 0.2, bt), bt * 0.35 * (1 - island))
  }

  // Cồn surfaces
  if (hen > 0) {
    h = mix(h, CON_HEN.height + n * 0.15, hen)
  }
  if (daVien > 0) {
    h = mix(h, CON_DA_VIEN.height + n * 0.12, daVien)
  }

  return h
}

/** True if a water surface patch should sit here (river or moat, not dry island). */
export function isWaterSurface(x: number, z: number): boolean {
  const island = Math.max(conHenMask(x, z), conDaVienMask(x, z))
  if (island > 0.45) return false
  if (moatWeight(x, z) > 0.25) return true
  if (riverWeight(x, z) > 0.35) return true
  return false
}

export function waterSurfaceY(x: number, z: number): number {
  if (moatWeight(x, z) > 0.25) return MOAT.waterY
  return RIVER.waterY
}
