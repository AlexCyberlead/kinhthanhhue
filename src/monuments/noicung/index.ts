import type { MonumentModule } from '../../core/types/MonumentModule'
import { thaiBinhLau } from './thaiBinhLau'
import { dienKienTrung } from './dienKienTrung'
import { taVuNoi } from './taVuNoi'
import { huuVuNoi } from './huuVuNoi'
import { innerHallModules } from './innerHalls'
import { cungKhonThai } from './cungKhonThai'
import { lucVien } from './lucVien'
import { nguTienVanPhong } from './nguTienVanPhong'
import { tuCamGateModules } from './tuCamGates'

/**
 * Nội cung Tử Cấm — Thái Bình / Kiến Trung / Tả–Hữu Vu nội
 * + factory điện còn thiếu (phiên 8).
 *
 * Reconstruction: `build()` luôn restored. Ruin = `buildDinhHallRuin` /
 * `buildCanThanhRuin` / `buildKienTrungRuin` — không đọc store.
 */
export const noiCungModules: MonumentModule[] = [
  thaiBinhLau,
  dienKienTrung,
  taVuNoi,
  huuVuNoi,
  ...innerHallModules,
  cungKhonThai,
  lucVien,
  nguTienVanPhong,
  ...tuCamGateModules,
]

export { thaiBinhLau, dienKienTrung, taVuNoi, huuVuNoi }
export { buildKienTrungRestored, buildKienTrungRuin } from './dienKienTrung'
export { buildInnerWingHall } from './buildInnerWingHall'
export { buildDinhHall, buildDinhHallRuin } from './buildDinhHall'
export type { DinhHallOpts } from './buildDinhHall'
export { buildCanThanhRuin, dienCanThanh } from './innerHalls'
export { cungKhonThai } from './cungKhonThai'
export { lucVien } from './lucVien'
export { nguTienVanPhong } from './nguTienVanPhong'
export { tuCamGateModules } from './tuCamGates'
export { countDrawCalls } from './countDrawCalls'
