/**
 * Groundwork anchors — aligned with WORLD / docs/research/layout.md.
 * Origin (0,0,0) = sân Đại Triều Nghi; +Z = Nam (Ngọ Môn).
 */

export const NGO_MON_Z = 155
export const DAI_TRIEU_Z = 0
export const HO_THAI_DICH_Z = 55
export const TRUNG_DAO_Z = 55

/** Thần đạo continues north toward Đại Cung / Cần Chánh. */
export const THAN_DAO_NORTH_Z = -210

/** Road half-width (full ≈ 10 m central path). */
export const ROAD_WIDTH = 10
export const ROAD_Y = 0.06

/**
 * Sân Đại Triều Nghi — lát gạch, không box trắng.
 * [ước lượng hợp lý — rộng hơn thần đạo, ôm gốc tọa độ]
 */
export const DAI_TRIEU_PLAZA = {
  width: 92,
  depth: 64,
} as const

/**
 * Đường vòng ôm Tử Cấm, bên trong Hoàng thành.
 * Offset ngoài tường Tử Cấm ~12 m. [ước lượng hợp lý]
 */
export const IMPERIAL_LOOP = {
  centerX: 0,
  centerZ: -235,
  halfX: 174,
  halfZ: 157.4,
  width: 6.5,
  y: 0.05,
} as const

/** Hồ Thái Dịch crossing span along Z (bridge deck length). */
export const LAKE_SPAN_Z = 42
export const BRIDGE_DECK_LEN = 48
export const BRIDGE_DECK_W = 9.5
export const BRIDGE_DECK_Y = 1.35

export type Lod = 0 | 1 | 2

/**
 * Hồ Nội Kim Thủy — hào nhỏ ôm 3 mặt Tử Cấm (Đông / Tây / Bắc).
 * Bỏ cạnh Nam để giữ trục lễ Đại Cung. [ước lượng hợp lý]
 */
export const NOI_KIM_THUY = {
  centerX: 0,
  centerZ: -235,
  innerHalfX: 166,
  innerHalfZ: 149,
  width: 7.5,
  waterY: 0.06,
  bedY: -0.38,
  copeW: 0.65,
  copeH: 0.3,
  gateGap: 7,
} as const

/**
 * Sân gạch nội — giữa các điện, không cỏ. [ước lượng hợp lý]
 * World XZ, y ≈ ROAD_Y.
 */
export const INNER_COURTS: ReadonlyArray<{
  id: string
  x: number
  z: number
  w: number
  d: number
}> = [
  { id: 'thai-hoa-dai-cung', x: 0, z: -72, w: 68, d: 36 },
  { id: 'dai-cung-can-chanh', x: 0, z: -120, w: 48, d: 22 },
  { id: 'can-chanh-can-thanh', x: 0, z: -175, w: 42, d: 26 },
  { id: 'can-thanh-khon-thai', x: 0, z: -226, w: 36, d: 18 },
  { id: 'dien-tho-court', x: -180, z: -248, w: 52, d: 36 },
  { id: 'truong-sanh-court', x: -200, z: -298, w: 40, d: 28 },
  { id: 'phung-tien-court', x: -120, z: -198, w: 28, d: 20 },
  { id: 'the-mieu-forecourt', x: -95, z: -62, w: 44, d: 22 },
  { id: 'thai-mieu-forecourt', x: 95, z: -62, w: 40, d: 20 },
]

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
