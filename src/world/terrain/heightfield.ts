import {
  CITADEL,
  CON_DA_VIEN,
  CON_HEN,
  FORBIDDEN_CITY,
  IMPERIAL_CITY,
  IMPERIAL_MOAT,
  MOAT,
  NOI_KIM_THUY,
  RIVER,
  THAI_DICH,
  TINH_TAM,
} from './terrainConfig'

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

/** Axis-aligned box SDF. Negative = inside. */
export function boxSdf(
  x: number,
  z: number,
  cx: number,
  cz: number,
  halfX: number,
  halfZ: number,
): number {
  const dx = Math.abs(x - cx) - halfX
  const dz = Math.abs(z - cz) - halfZ
  return Math.min(Math.max(dx, dz), 0) + Math.hypot(Math.max(dx, 0), Math.max(dz, 0))
}

/** 1 = inside Hoàng thành. */
export function imperialInteriorWeight(x: number, z: number): number {
  const d = boxSdf(
    x,
    z,
    IMPERIAL_CITY.centerX,
    IMPERIAL_CITY.centerZ,
    IMPERIAL_CITY.halfX,
    IMPERIAL_CITY.halfZ,
  )
  return 1 - smoothstep(-6, 6, d)
}

/** 1 = inside Tử Cấm. */
export function forbiddenInteriorWeight(x: number, z: number): number {
  const d = boxSdf(
    x,
    z,
    FORBIDDEN_CITY.centerX,
    FORBIDDEN_CITY.centerZ,
    FORBIDDEN_CITY.halfX,
    FORBIDDEN_CITY.halfZ,
  )
  return 1 - smoothstep(-5, 5, d)
}

/**
 * South face of the imperial AABB, pushed past Ngọ Môn so the gate sits on land.
 * [ước lượng hợp lý]
 */
export function imperialMoatSouthZ(): number {
  return IMPERIAL_CITY.centerZ + IMPERIAL_CITY.halfZ + IMPERIAL_MOAT.southExtra
}

/** True on the 4 land bridges that cross Ngoại Kim Thủy. */
export function imperialMoatGateBridge(x: number, z: number): boolean {
  const southZ = imperialMoatSouthZ()
  const northZ = IMPERIAL_CITY.centerZ - IMPERIAL_CITY.halfZ
  const eastX = IMPERIAL_CITY.centerX + IMPERIAL_CITY.halfX
  const westX = IMPERIAL_CITY.centerX - IMPERIAL_CITY.halfX
  const mid = IMPERIAL_MOAT.inset + IMPERIAL_MOAT.width * 0.5
  if (Math.abs(x) < IMPERIAL_MOAT.gateGapSouth && Math.abs(z - (southZ + mid)) < IMPERIAL_MOAT.width) {
    return true
  }
  if (Math.abs(x) < IMPERIAL_MOAT.gateGap && Math.abs(z - (northZ - mid)) < IMPERIAL_MOAT.width) {
    return true
  }
  if (Math.abs(z - IMPERIAL_CITY.centerZ) < IMPERIAL_MOAT.gateGap && Math.abs(x - (eastX + mid)) < IMPERIAL_MOAT.width) {
    return true
  }
  if (Math.abs(z - IMPERIAL_CITY.centerZ) < IMPERIAL_MOAT.gateGap && Math.abs(x - (westX - mid)) < IMPERIAL_MOAT.width) {
    return true
  }
  return false
}

/**
 * Signed distance to the Ngoại Kim Thủy ring (0 ≈ inner lip, width ≈ outer).
 * Uses a rectangle whose south edge is pushed past Ngọ Môn.
 */
export function imperialMoatSdf(x: number, z: number): number {
  const southZ = imperialMoatSouthZ()
  const northZ = IMPERIAL_CITY.centerZ - IMPERIAL_CITY.halfZ
  const cx = IMPERIAL_CITY.centerX
  const halfX = IMPERIAL_CITY.halfX
  const halfZ = (southZ - northZ) * 0.5
  const cz = (southZ + northZ) * 0.5
  return boxSdf(x, z, cx, cz, halfX, halfZ)
}

/** 0..1 depth weight inside Ngoại Kim Thủy (V-profile). */
export function imperialMoatWeight(x: number, z: number): number {
  if (imperialMoatGateBridge(x, z)) return 0
  const d = imperialMoatSdf(x, z)
  const inner = IMPERIAL_MOAT.inset
  const outer = IMPERIAL_MOAT.inset + IMPERIAL_MOAT.width
  if (d < inner || d > outer) return 0
  const t = (d - inner) / (outer - inner)
  return Math.sin(t * Math.PI)
}

/** True on land bridges crossing Nội Kim Thủy (cửa Tử Cấm). */
export function noiKimThuyGateBridge(x: number, z: number): boolean {
  const mid = NOI_KIM_THUY.innerHalfX + NOI_KIM_THUY.width * 0.5
  const eastX = NOI_KIM_THUY.centerX + mid
  const westX = NOI_KIM_THUY.centerX - mid
  const northZ = NOI_KIM_THUY.centerZ - NOI_KIM_THUY.innerHalfZ - NOI_KIM_THUY.width * 0.5
  const gap = NOI_KIM_THUY.gateGap
  // Hưng Khánh / Gia Tường — z world −200
  if (Math.abs(z + 200) < gap && Math.abs(x - eastX) < NOI_KIM_THUY.width) return true
  if (Math.abs(z + 200) < gap && Math.abs(x - westX) < NOI_KIM_THUY.width) return true
  // Tường Loan / Nghi Phụng
  if (Math.abs(z - northZ) < NOI_KIM_THUY.width && Math.abs(x + 40) < gap) return true
  if (Math.abs(z - northZ) < NOI_KIM_THUY.width && Math.abs(x - 40) < gap) return true
  return false
}

/** 0..1 depth weight inside Nội Kim Thủy (3 mặt, bỏ Nam). */
export function noiKimThuyWeight(x: number, z: number): number {
  if (noiKimThuyGateBridge(x, z)) return 0
  const { centerX, centerZ, innerHalfX, innerHalfZ, width } = NOI_KIM_THUY
  const dx = Math.abs(x - centerX)
  const dz = z - centerZ
  // North band
  if (dx <= innerHalfX + width && dz < -innerHalfZ && dz > -innerHalfZ - width) {
    const t = (-innerHalfZ - dz) / width
    return Math.sin(Math.min(1, Math.max(0, t)) * Math.PI)
  }
  // East / west — only north of south lip (skip south ceremonial)
  if (dz > -innerHalfZ - width && dz < innerHalfZ) {
    if (dx > innerHalfX && dx < innerHalfX + width) {
      const t = (dx - innerHalfX) / width
      return Math.sin(Math.min(1, Math.max(0, t)) * Math.PI)
    }
  }
  return 0
}

/** 0..1 inside Hồ Tịnh Tâm (soft ellipse), 0 on islands. */
export function tinhTamWeight(x: number, z: number): number {
  const u = (x - TINH_TAM.cx) / TINH_TAM.halfX
  const v = (z - TINH_TAM.cz) / TINH_TAM.halfZ
  const r = Math.hypot(u, v)
  if (r > 1.18) return 0
  const water = 1 - smoothstep(0.78, 1.12, r)
  return water * (1 - tinhTamIslandMask(x, z))
}

/** Island pads in Tịnh Tâm — Bồng Lai / Phương Trượng / Doanh Châu. */
export function tinhTamIslandMask(x: number, z: number): number {
  const a = islandMask(x, z, 220, -575, 22, 16)
  const b = islandMask(x, z, 285, -655, 14, 11)
  const c = islandMask(x, z, 155, -658, 12, 10)
  return Math.max(a, b, c)
}

/** 0..1 inside Hồ Thái Dịch basin (soft). */
export function thaiDichWeight(x: number, z: number): number {
  const u = (x - THAI_DICH.cx) / THAI_DICH.halfX
  const v = (z - THAI_DICH.cz) / THAI_DICH.halfZ
  const r = Math.hypot(u, v)
  if (r > 1.25) return 0
  return 1 - smoothstep(0.72, 1.18, r)
}

/**
 * Sample terrain height (metres / Y).
 * Flat-ish in citadel, gentle slope south to river, dug moat + river bed, raised cồn.
 */
export function sampleHeight(x: number, z: number): number {
  const inside = citadelInteriorWeight(x, z)
  const imperial = imperialInteriorWeight(x, z)

  // Base: slight southward fall toward minh đường
  let h = 0.35 - Math.max(0, z - 100) * 0.0018
  // Northern gentle rise
  h += Math.max(0, -z - 400) * 0.0006

  // Kinh thành / Hoàng thành must sit at ~0 so groundwork (y≈0.06) is visible.
  // The old 0.55 m green plateau buried every brick road. [phiên 4]
  h = mix(h, 0.04, inside * 0.92)
  h = mix(h, 0.0, imperial * 0.97)

  // Micro relief — weaker inside walls, almost none on imperial courtyards
  const n = fbm(x * 0.004, z * 0.004)
  h += n * mix(0.55, 0.04, Math.max(inside, imperial * 1.2))

  // Hào Hộ Thành trench
  const moat = moatWeight(x, z)
  if (moat > 0) {
    h = mix(h, MOAT.bedY, moat)
  }

  // Ngoại Kim Thủy — widen the dip so the coarse heightfield still catches it
  const impMoat = imperialMoatWeight(x, z)
  if (impMoat > 0) {
    h = mix(h, IMPERIAL_MOAT.bedY, Math.min(1, impMoat * 1.15))
  }

  // Hồ Thái Dịch basin
  const lake = thaiDichWeight(x, z)
  if (lake > 0) {
    h = mix(h, THAI_DICH.bedY, lake)
  }

  const noiKim = noiKimThuyWeight(x, z)
  if (noiKim > 0) {
    h = mix(h, NOI_KIM_THUY.bedY, Math.min(1, noiKim * 1.1))
  }

  const tinh = tinhTamWeight(x, z)
  if (tinh > 0) {
    h = mix(h, TINH_TAM.bedY, tinh)
  }
  const tinhIsle = tinhTamIslandMask(x, z)
  if (tinhIsle > 0.2) {
    h = mix(h, 0.35 + n * 0.08, tinhIsle)
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
  if (imperialMoatWeight(x, z) > 0.25) return true
  if (thaiDichWeight(x, z) > 0.45) return true
  if (noiKimThuyWeight(x, z) > 0.35) return true
  if (tinhTamWeight(x, z) > 0.4) return true
  if (riverWeight(x, z) > 0.35) return true
  return false
}

export function waterSurfaceY(x: number, z: number): number {
  if (imperialMoatWeight(x, z) > 0.25) return IMPERIAL_MOAT.waterY
  if (thaiDichWeight(x, z) > 0.45) return THAI_DICH.waterY
  if (noiKimThuyWeight(x, z) > 0.35) return NOI_KIM_THUY.waterY
  if (tinhTamWeight(x, z) > 0.4) return TINH_TAM.waterY
  if (moatWeight(x, z) > 0.25) return MOAT.waterY
  return RIVER.waterY
}

/** Exposed for terrain splat variation (deterministic). */
export function terrainNoise(x: number, z: number): number {
  return valueNoise(x, z)
}
