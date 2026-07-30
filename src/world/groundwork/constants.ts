/**
 * Groundwork anchors — aligned with WORLD / docs/research/layout.md.
 * Origin (0,0,0) = sân Đại Triều Nghi; +Z = Nam (Ngọ Môn).
 */

export const NGO_MON_Z = 155
export const DAI_TRIEU_Z = 0
export const HO_THAI_DICH_Z = 55
export const TRUNG_DAO_Z = 55

/** Thần đạo continues north toward Đại Cung / Cần Chánh. */
export const THAN_DAO_NORTH_Z = -160

/** Road half-width (full ≈ 10 m central path). */
export const ROAD_WIDTH = 10
export const ROAD_Y = 0.06

/** Hồ Thái Dịch crossing span along Z (bridge deck length). */
export const LAKE_SPAN_Z = 42
export const BRIDGE_DECK_LEN = 48
export const BRIDGE_DECK_W = 9.5
export const BRIDGE_DECK_Y = 1.35

export type Lod = 0 | 1 | 2

/** Small stylized bridges over hào / Ngự Hà. */
export const SMALL_BRIDGES: ReadonlyArray<{
  id: string
  x: number
  z: number
  rotY: number
  length: number
  width: number
}> = [
  { id: 'ngu-ha-truc', x: 0, z: -380, rotY: 0, length: 18, width: 5.5 },
  { id: 'ngu-ha-dong', x: 120, z: -380, rotY: 0, length: 16, width: 4.5 },
  { id: 'hao-dong-hien-nhon', x: 318, z: -180, rotY: Math.PI / 2, length: 16, width: 4.5 },
  { id: 'hao-tay-chuong-duc', x: -318, z: -180, rotY: -Math.PI / 2, length: 16, width: 4.5 },
  { id: 'hao-nam-ky-dai', x: 0, z: 310, rotY: 0, length: 20, width: 5 },
]
