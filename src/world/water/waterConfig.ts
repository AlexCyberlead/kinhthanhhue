/**
 * Water body anchors for Kinh Thành Huế (Wave A / A5).
 * Coords from docs/research/layout.md — [ước lượng hợp lý] trừ mốc đã ghi.
 * Origin (0,0,0) = tâm sân Đại Triều Nghi; +Z = Nam; 1 unit = 1 m.
 */

export const WATER_Y = -0.95

/** Hồ Thái Dịch — trước Ngọ Môn / quanh cầu Trung Đạo [layout: ho-thai-dich ≈ (0,-1,55)] */
export const HO_THAI_DICH = {
  id: 'ho-thai-dich' as const,
  center: [0, WATER_Y, 55] as [number, number, number],
  /** Đông–Tây × Bắc–Nam [ước lượng hợp lý — hai bên cầu Trung Đạo] */
  size: [110, 38] as [number, number],
  segments: [36, 14] as [number, number],
}

/**
 * Hồ Tịnh Tâm — vườn Bắc/Đông Bắc trong Kinh Thành, ngoài Hoàng Thành.
 * [ước lượng hợp lý — chữ nhật cảnh quan + 3 đảo lịch sử; mesh đơn giản không cắt đảo]
 */
export const HO_TINH_TAM = {
  id: 'ho-tinh-tam' as const,
  center: [260, WATER_Y, -720] as [number, number, number],
  size: [170, 210] as [number, number],
  segments: [42, 48] as [number, number],
}

/**
 * Ngự Hà — sông nhỏ xuyên Kinh Thành, cửa thủy Đông/Tây.
 * layout: dong-thanh-thuy-quan [1100,0,-200], tay-thanh-thuy-quan [-1100,0,-80]
 * Path uốn phía Bắc Hoàng Thành (Hòa Bình ≈ z=-480) rồi nối hai cửa.
 */
export const NGU_HA = {
  id: 'ngu-ha' as const,
  width: 16,
  /** polyline XZ (y bỏ qua — set WATER_Y khi build) */
  path: [
    [-1100, -80],
    [-780, -100],
    [-520, -320],
    [-420, -540],
    [-200, -590],
    [200, -595],
    [420, -560],
    [520, -340],
    [760, -220],
    [1100, -200],
  ] as [number, number][],
  /** subdivisions per segment */
  segsPerEdge: 8,
  widthSegs: 4,
}

export type WaterBodyId =
  | typeof HO_THAI_DICH.id
  | typeof HO_TINH_TAM.id
  | typeof NGU_HA.id
