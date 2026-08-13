/**
 * Hồ Tịnh Tâm — Bắc / Đông-Bắc Hoàng thành, trong Kinh thành.
 * [ước lượng hợp lý — PLAN phiên 11]
 *
 * WORLD.landmarks.hoTinhTam cũ [180, 0, -420] đè tường Bắc Hoàng thành (z≈−482)
 * → dịch về [220, 0, -620].
 */
export const TINH_TAM_LAKE = {
  cx: 220,
  cz: -620,
  halfX: 140,
  halfZ: 90,
  waterY: 0.08,
} as const

export const ISLANDS = {
  bongLai: { cx: 220, cz: -575, hx: 22, hz: 16, name: 'bong-lai' },
  phuongTruong: { cx: 285, cz: -655, hx: 14, hz: 11, name: 'phuong-truong' },
  doanhChau: { cx: 155, cz: -658, hx: 12, hz: 10, name: 'doanh-chau' },
} as const
