import type { MonumentModule } from '../../core/types/MonumentModule'
import { taVu } from './taVu'
import { huuVu } from './huuVu'
import { dienCanChanh } from './dienCanChanh'

/**
 * WAVE B / B9 — Tả Vu, Hữu Vu, Điện Cần Chánh.
 *
 * Reconstruction toggle (Wave C / orchestrator):
 * - Modules `build(lod)` luôn trả bản **restored**.
 * - Khi `reconstructionMode === 'ruin'`, gọi `buildCanChanhRuin(lod)` thay cho
 *   `dienCanChanh.build(lod)` — không đọc store trong mesh builder (pure).
 */
export const vuModules: MonumentModule[] = [taVu, huuVu, dienCanChanh]

export { taVu, huuVu, dienCanChanh }
export { buildWingHall } from './buildWingHall'
export { buildCanChanhRestored, buildCanChanhRuin } from './dienCanChanh'
