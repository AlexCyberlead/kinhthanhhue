import type { MonumentModule } from '../../core/types/MonumentModule'
import { trieuMieu } from './trieuMieu'
import { thaiMieu } from './thaiMieu'
import { hungMieu } from './hungMieu'

/**
 * WAVE B / B6 — Triệu Tổ / Thái Tổ / Hưng Tổ Miếu + sân.
 */
export const ancestralMieuModules: MonumentModule[] = [trieuMieu, thaiMieu, hungMieu]

export { trieuMieu, thaiMieu, hungMieu }
export { buildMieu } from './buildMieu'
export type { BuildMieuOpts } from './buildMieu'
export { buildMieuCourtyard, buildNghiMon } from './courtyard'
export type { MieuCourtyardOpts } from './courtyard'
export { countDrawCalls } from './buildMieu'
