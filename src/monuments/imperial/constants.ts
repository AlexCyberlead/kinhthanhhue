/**
 * Hoàng Thành (Đại Nội) wall dimensions — Hội Điển / layout.md.
 * Local origin of wall geometry = geometric center [0, 0, -180] world.
 * +Z = South.
 */

export const IMPERIAL = {
  /** Đông–Tây [xác thực] */
  width: 622,
  /** Bắc–Nam [xác thực — 604 m] */
  depth: 604,
  halfX: 311,
  halfZ: 302,
  /** World position of geometric center */
  centerX: 0,
  centerZ: -180,
  height: 4.16,
  thickness: 1.04,
  plinthHeight: 0.45,
  parapetHeight: 0.7,
  parapetThickness: 0.55,
  /**
   * Gate opening half-widths (m) — leave gaps in curtain so modules don't clip.
   * Ngọ Môn (B1) is larger; side gates smaller.
   */
  gaps: {
    south: 32, // ngo-mon
    north: 14, // hoa-binh-mon
    east: 14, // hien-nhon-mon
    west: 14, // chuong-duc-mon
  },
} as const

export type LodLevel = 0 | 1 | 2
