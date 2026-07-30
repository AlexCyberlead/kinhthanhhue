import type { MonumentModule } from '../../core/types/MonumentModule'
import { thaiBinhLau } from './thaiBinhLau'
import { dienKienTrung } from './dienKienTrung'
import { taVuNoi } from './taVuNoi'
import { huuVuNoi } from './huuVuNoi'

/**
 * WAVE C / C3 — Nội cung cực Bắc Tử Cấm:
 * Thái Bình Lâu + Điện Kiến Trung + Tả/Hữu Vu nội.
 *
 * Reconstruction toggle (orchestrator):
 * - Modules `build(lod)` luôn trả bản **restored**.
 * - Khi `reconstructionMode === 'ruin'`, gọi `buildKienTrungRuin(lod)` thay cho
 *   `dienKienTrung.build(lod)` — không đọc store trong mesh builder (pure).
 */
export const noiCungModules: MonumentModule[] = [
  thaiBinhLau,
  dienKienTrung,
  taVuNoi,
  huuVuNoi,
]

export { thaiBinhLau, dienKienTrung, taVuNoi, huuVuNoi }
export { buildKienTrungRestored, buildKienTrungRuin } from './dienKienTrung'
export { buildInnerWingHall } from './buildInnerWingHall'
export { countDrawCalls } from './countDrawCalls'
