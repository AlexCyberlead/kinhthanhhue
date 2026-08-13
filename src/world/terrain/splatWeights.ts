import {
  citadelInteriorWeight,
  citadelOuterSDF,
  forbiddenInteriorWeight,
  imperialInteriorWeight,
  imperialMoatWeight,
  moatWeight,
  noiKimThuyWeight,
  terrainNoise,
  tinhTamWeight,
} from './heightfield'
import { CITADEL, IMPERIAL_CITY, RIVER } from './terrainConfig'

export type SplatWeights = {
  /** gạch Bát Tràng / sân lễ */
  brick: number
  /** đất nền / đường / bờ */
  dirt: number
  /** cỏ */
  grass: number
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

/** Distance to a finite XZ segment, then 1 at center → 0 at halfW. */
function stripWeight(
  x: number,
  z: number,
  ax: number,
  az: number,
  bx: number,
  bz: number,
  halfW: number,
): number {
  const dx = bx - ax
  const dz = bz - az
  const len2 = dx * dx + dz * dz
  if (len2 < 1e-6) {
    const d = Math.hypot(x - ax, z - az)
    return clamp01(1 - d / halfW)
  }
  let t = ((x - ax) * dx + (z - az) * dz) / len2
  if (t < 0) t = 0
  else if (t > 1) t = 1
  const px = ax + dx * t
  const pz = az + dz * t
  const d = Math.hypot(x - px, z - pz)
  return clamp01(1 - d / halfW)
}

/**
 * Classify a world XZ sample into brick / dirt / grass.
 * Cheap — called per terrain vertex (~30k). No allocations.
 */
export function splatWeights(x: number, z: number): SplatWeights {
  const imperial = imperialInteriorWeight(x, z)
  const forbidden = forbiddenInteriorWeight(x, z)
  const citadel = citadelInteriorWeight(x, z)
  const n = terrainNoise(x * 0.012, z * 0.012)
  const n2 = terrainNoise(x * 0.031 + 20, z * 0.029 - 8)

  // Thần đạo: x≈0, Ngọ Môn → Đại Cung / Cần Chánh. [ước lượng hợp lý]
  const thanDao = stripWeight(x, z, 0, 175, 0, -210, 7.2)
  // Sân Đại Triều Nghi — plaza around origin
  const daiTrieuX = clamp01(1 - Math.abs(x) / 46)
  const daiTrieuZ = clamp01(1 - Math.abs(z) / 32)
  const daiTrieu = daiTrieuX * daiTrieuZ
  // Sân hẹp trước Thái Hòa / sau Đại Cung
  const thaiHoaCourt = stripWeight(x, z, 0, -20, 0, -100, 22) * 0.65
  const innerAxis = stripWeight(x, z, 0, -70, 0, -230, 20) * 0.55
  const dienThoCourt = stripWeight(x, z, -180, -230, -180, -270, 18) * 0.5
  const phuCourt = stripWeight(x, z, 160, -200, 160, -250, 16) * 0.5

  let brick = Math.max(thanDao, daiTrieu, thaiHoaCourt * imperial, innerAxis, dienThoCourt, phuCourt)
  brick = Math.max(brick, forbidden * 0.22 * (1 - n * 0.35))

  // Bờ hào / sông: đất + sỏi, không cỏ neon
  const riverProx = Math.abs(z - RIVER.centerZ)
  const riverBank = clamp01(1 - Math.abs(riverProx - RIVER.halfWidth) / (RIVER.bankWidth + 6))
  const outerMoat = moatWeight(x, z)
  const impMoat = imperialMoatWeight(x, z)
  const noiKim = noiKimThuyWeight(x, z)
  const tinh = tinhTamWeight(x, z)
  const banks = Math.max(
    riverBank * 0.85,
    Math.min(1, outerMoat * 1.4),
    Math.min(1, impMoat * 1.5),
    Math.min(1, noiKim * 1.4),
    Math.min(1, tinh * 0.85),
  )

  // Đường đất trong Kinh thành — trục ra 4 hướng + vành đai gần tường
  const roadS = stripWeight(x, z, 0, 190, 0, CITADEL.maxZ - 30, 5.5)
  const roadN = stripWeight(x, z, 0, -500, 0, CITADEL.minZ + 40, 5.5)
  const roadE = stripWeight(x, z, 330, IMPERIAL_CITY.centerZ, CITADEL.maxX - 40, IMPERIAL_CITY.centerZ, 5.5)
  const roadW = stripWeight(x, z, -330, IMPERIAL_CITY.centerZ, CITADEL.minX + 40, IMPERIAL_CITY.centerZ, 5.5)
  const wallRing = citadel > 0.15 ? clamp01(1 - Math.abs(citadelOuterSDF(x, z) + 55) / 14) : 0
  const dirtRoads = Math.max(roadS, roadN, roadE, roadW, wallRing * 0.85) * citadel

  // Hoàng thành: đất sân, không cỏ bóng đá. Cỏ chỉ loang mép / vườn.
  const imperialDirt = imperial * (0.72 + n * 0.18) * (1 - brick)
  const citadelDirt = citadel * (1 - imperial) * (0.18 + n2 * 0.22)

  let dirt = Math.max(imperialDirt, citadelDirt, banks, dirtRoads)
  // Stretch: vệt mòn giữa thần đạo
  dirt = Math.max(dirt, thanDao * stripWeight(x, z, 0, 175, 0, -210, 2.2) * 0.55)

  let grass = 1 - brick - dirt
  if (grass < 0) {
    const s = brick + dirt
    brick /= s
    dirt /= s
    grass = 0
  }

  // Ngoài thành: cỏ + đất loang, không golf một màu
  if (citadel < 0.2 && imperial < 0.05) {
    const patch = 0.12 + n * 0.28 + n2 * 0.12
    dirt = Math.max(dirt, patch * (1 - brick) * 0.55)
    grass = Math.max(0, 1 - brick - dirt)
  }

  // Bên trong Hoàng thành: siết cỏ còn lại (vườn góc)
  if (imperial > 0.5) {
    grass *= 0.45 + n2 * 0.25
    const rest = 1 - brick - grass
    dirt = Math.max(dirt, rest)
  }

  const sum = brick + dirt + grass
  if (sum < 1e-5) return { brick: 0, dirt: 0.35, grass: 0.65 }
  return { brick: brick / sum, dirt: dirt / sum, grass: grass / sum }
}
