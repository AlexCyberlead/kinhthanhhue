import type { MonumentModule } from '../../core/types/MonumentModule'
import { kyDai } from './kyDai'
import { cotCo } from './cotCo'
import { phuVanLau } from './phuVanLau'
import { nghinhLuongDinh } from './nghinhLuongDinh'

/**
 * WAVE A / A4 — Kỳ Đài cluster.
 * Note: `ky-dai` already embeds the flagpole; register `cot-co` only if you intentionally
 * split the pole (do not register both or the pole doubles).
 */
export const kyDaiModules: MonumentModule[] = [kyDai, phuVanLau, nghinhLuongDinh, cotCo]

export { kyDai, cotCo, phuVanLau, nghinhLuongDinh }
export { buildFlagPole } from './flagPole'
export { estimateTris, countDrawCalls } from './geometry'
