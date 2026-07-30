/**
 * Kinh Thành (outer citadel) dimensions — Hội Điển / Cố đô Huế.
 * World: origin = Đại Triều Nghi; +Z = South; 1 unit = 1 m.
 */

export const CITADEL = {
  /** Face lengths [xác thực — Hội Điển] */
  south: 2724.25,
  east: 2587.36,
  west: 2660.03,
  north: 2599.64,
  perimeter: 10571.64,

  thickness: 21.25,
  heightOuter: 6.46,
  heightInner: 3.825,

  /**
   * Axis-aligned rectangle approximating the irregular quadrilateral.
   * width = avg(S,N), depth = avg(E,W) → perimeter ≈ 10.572 km.
   * Center offset so south face ≈ z+1290 (near cửa Quảng Đức / Thể Nhơn).
   */
  width: (2724.25 + 2599.64) / 2,
  depth: (2587.36 + 2660.03) / 2,
  centerX: 0,
  centerZ: -22,

  /** 4 giác bảo + 20 intermediate = 24 */
  intermediateBastionsPerSide: 5 as const,
  cornerProjection: 90,
  sideProjection: 55,
  cornerHalfWidth: 55,
  sideHalfWidth: 38,

  plinthHeight: 0.85,
  parapetHeight: 1.1,
  parapetThickness: 2.4,
} as const

export type LodLevel = 0 | 1 | 2
