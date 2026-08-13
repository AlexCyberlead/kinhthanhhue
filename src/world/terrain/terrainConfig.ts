/**
 * Terrain extents & feature anchors for Kinh Thành Huế.
 * Numbers from docs/research/layout.md + WORLD landmarks; stylized where noted.
 * Origin (0,0,0) = tâm sân Đại Triều Nghi; +Z = Nam; 1 unit = 1 m.
 */

/** Full heightfield coverage ~4.5–5 km */
export const TERRAIN_BOUNDS = {
  minX: -2500,
  maxX: 2500,
  minZ: -2200,
  maxZ: 2800,
} as const

export type TerrainBounds = typeof TERRAIN_BOUNDS

/** Kinh thành footprint — south face ~2724 m [xác thực — Hội Điển / Cố đô Huế] */
export const CITADEL = {
  minX: -1362,
  maxX: 1362,
  /** Bắc — gần cửa Chính Bắc [ước lượng hợp lý] */
  minZ: -1300,
  /** Nam — sát Kỳ Đài (WORLD z≈420), trước sông Hương [ước lượng hợp lý] */
  maxZ: 480,
  wallThickness: 21.25,
} as const

/** Hào Hộ Thành — band ngoài tường [ước lượng hợp lý] */
export const MOAT = {
  /** khoảng cách từ mặt tường ngoài → mép trong hào */
  inset: 8,
  width: 48,
  waterY: -1.8,
  bedY: -2.8,
  /** bán kính “pháo đài” Vauban stylized tại góc / giữa cạnh */
  bastionRadius: 55,
  bastionDepth: 42,
} as const

/**
 * Hoàng thành AABB — 622 × 604 m, tâm [0, −180].
 * [xác thực — kích thước; tâm ước lượng từ layout.md]
 */
export const IMPERIAL_CITY = {
  centerX: 0,
  centerZ: -180,
  halfX: 311,
  halfZ: 302,
} as const

/**
 * Tử Cấm AABB — 324 × 290,7 m, tâm [0, −235].
 * [xác thực — kích thước; tâm ước lượng từ layout.md]
 */
export const FORBIDDEN_CITY = {
  centerX: 0,
  centerZ: -235,
  halfX: 162,
  halfZ: 145.35,
} as const

/**
 * Hồ Thái Dịch — trước sân Đại Triều / sau Ngọ Môn.
 * [ước lượng hợp lý — khớp waterConfig HO_THAI_DICH]
 */
export const THAI_DICH = {
  cx: 0,
  cz: 55,
  halfX: 55,
  halfZ: 19,
  waterY: 0.08,
  bedY: -0.45,
} as const

/**
 * Ngoại Kim Thủy — hào ôm Hoàng thành.
 * Rộng / inset không có số Hội Điển trong research → [ước lượng hợp lý].
 * Cạnh Nam đẩy ra ngoài Ngọ Môn (module z≈155) để cổng không ngồi trong nước.
 */
export const IMPERIAL_MOAT = {
  inset: 4,
  width: 18,
  waterY: 0.05,
  bedY: -0.55,
  /** đẩy cạnh Nam ra sau đài Ngọ Môn */
  southExtra: 46,
  gateGapSouth: 16,
  gateGap: 11,
} as const

/**
 * Hồ Nội Kim Thủy — hào nhỏ ôm Tử Cấm (Đông/Tây/Bắc).
 * [ước lượng hợp lý — research chưa khóa polygon]
 */
export const NOI_KIM_THUY = {
  centerX: 0,
  centerZ: -235,
  innerHalfX: 166,
  innerHalfZ: 149,
  width: 7.5,
  waterY: 0.06,
  bedY: -0.38,
  gateGap: 7,
} as const

/**
 * Hồ Tịnh Tâm — Bắc / Đông-Bắc Hoàng thành, trong Kinh thành.
 * [ước lượng hợp lý — PLAN phiên 11; dịch khỏi tường Bắc z≈−482]
 */
export const TINH_TAM = {
  cx: 220,
  cz: -620,
  halfX: 140,
  halfZ: 90,
  waterY: 0.08,
  bedY: -0.55,
} as const

/**
 * Sông Hương (minh đường) — task Z+700..900; WORLD.landmarks.songHuong z=750.
 * [ước lượng hợp lý — digital twin; layout.md ghi đoạn gần ~z=1600 ở scale cửa ngoài]
 */
export const RIVER = {
  centerZ: 800,
  halfWidth: 95,
  waterY: -1.6,
  bedY: -3.2,
  /** sông chạy Đông–Tây, mở rộng hai đầu */
  minX: -2200,
  maxX: 2200,
  bankWidth: 28,
} as const

/** Cồn Hến — tả thanh long (+X). Dài ~1660 m, rộng ~237 m [xác thực — Dân Việt] */
export const CON_HEN = {
  cx: 780,
  cz: 805,
  lengthX: 1660,
  widthZ: 237,
  height: 1.6,
} as const

/** Cồn Dã Viên — hữu bạch hổ (−X). Dài ~890 m, rộng ~185 m [xác thực — Dân Việt] */
export const CON_DA_VIEN = {
  cx: -720,
  cz: 798,
  lengthX: 890,
  widthZ: 185,
  height: 1.4,
} as const

/** LOD1 segment budget: segs²×2 ≤ 80k → segs ≤ 200 */
export const TERRAIN_LOD = {
  /** ~64.8k tris */
  lod1Segments: 180,
  /** far / low quality ~18k tris */
  lod2Segments: 96,
  farDistance: 900,
} as const

export const TERRAIN_SIZE = {
  width: TERRAIN_BOUNDS.maxX - TERRAIN_BOUNDS.minX,
  depth: TERRAIN_BOUNDS.maxZ - TERRAIN_BOUNDS.minZ,
  centerX: (TERRAIN_BOUNDS.minX + TERRAIN_BOUNDS.maxX) * 0.5,
  centerZ: (TERRAIN_BOUNDS.minZ + TERRAIN_BOUNDS.maxZ) * 0.5,
} as const
