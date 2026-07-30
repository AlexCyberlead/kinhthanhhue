import type { Season } from '../sky/skyMath'

/** Temple / ancestral hall emitters for incense (world meters). */
export const INCENSE_EMITTERS: ReadonlyArray<readonly [number, number, number]> = [
  [-95, 2.2, -90], // Thế Miếu
  [-140, 2.0, -55], // Hưng Miếu
  [95, 2.0, -90], // Thái Miếu
  [140, 2.0, -55], // Triệu Miếu
  [-120, 2.0, -80], // Thế Tổ Miếu landmark
  [0, 3.5, -35], // Điện Thái Hòa (ceremonial)
]

/** Soft leaf / petal tint per season. */
export const LEAF_COLORS: Record<Season, string> = {
  xuan: '#e8b4c8', // spring petals
  ha: '#6a9a4a', // summer green
  thu: '#c4782a', // autumn
  dong: '#8a7a5c', // sparse winter
}

/** Particle budgets — GPU-friendly, one Points/mesh per layer. */
export const COUNTS = {
  rain: 900,
  incense: 180,
  dust: 280,
  leaves: 220,
  birds: 28,
  mist: 64,
  godRays: 5,
} as const

/** Max draw calls this system may emit (budget gate). */
export const MAX_DRAW_CALLS = 10

export const RAIN_HALF_XZ = 55
export const RAIN_HEIGHT = 28
export const DUST_RADIUS = 90
export const LEAF_RADIUS = 120
export const BIRD_RADIUS = 180
export const MIST_RADIUS = 140
