/**
 * Tử Cấm Thành wall dimensions — layout.md / Wikipedia.
 * Local origin of wall geometry = geometric center [0, 0, -235] world.
 * +Z = South (toward Đại Cung Môn / Đại Triều).
 *
 * Note: tường luôn ở trạng thái restored — không đổi theo
 * `reconstructionMode` ('ruin'|'restored'). Cổng Đại Cung Môn (destroyed 1947)
 * dùng bản phục dựng trong `build()`; orchestrator có thể swap ruin sau.
 */

export const TUCAM = {
  /** Đông–Tây [xác thực] */
  width: 324,
  /** Bắc–Nam [xác thực — 290,68 ≈ 290.7 m] */
  depth: 290.7,
  halfX: 162,
  halfZ: 145.35,
  /** World position of geometric center [ước lượng hợp lý — layout.md] */
  centerX: 0,
  centerZ: -235,
  height: 3.72,
  thickness: 0.72,
  plinthHeight: 0.35,
  parapetHeight: 0.55,
  parapetThickness: 0.4,
  /**
   * Gate opening half-widths (m) — gaps in curtain.
   * Chỉ Đại Cung Môn (Nam) trong WAVE C1; cửa phụ để wave sau.
   */
  gaps: {
    south: 14, // dai-cung-mon
    north: 0,
    east: 0,
    west: 0,
  },
} as const

export type LodLevel = 0 | 1 | 2
