import type { MonumentModule } from '../../core/types/MonumentModule'
import { coHaGardenModule } from './coHaGarden'
import { thieuPhuongModule } from './thieuPhuong'

/**
 * WAVE B / B10 — Vườn Cơ Hạ + Thiệu Phương hardscape.
 * Register via orchestrator `bootstrapMonuments`, OR mount `<GardenPropsSystem />`
 * (not both).
 */
export const vuonModules: MonumentModule[] = [coHaGardenModule, thieuPhuongModule]

export { coHaGardenModule } from './coHaGarden'
export { thieuPhuongModule } from './thieuPhuong'
export { buildGardenHardscape } from './buildHardscape'
export type { GardenHardscapeOpts, GardenStyle } from './buildHardscape'
export { GardenPropsSystem } from './GardenPropsSystem'
export type { GardenPropsSystemProps } from './GardenPropsSystem'
export { countDrawCalls, estimateTris } from './geometry'
