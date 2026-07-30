import type { MonumentModule } from '../../core/types/MonumentModule'
import { tuongHoangThanh } from './tuongHoangThanh'
import { imperialGateModules } from './gateDefs'

/**
 * WAVE B / B4 — Tường Hoàng Thành + Hiển Nhơn / Chương Đức / Hòa Bình.
 * Ngọ Môn = B1 (không nằm trong list này).
 */
export const imperialWallModules: MonumentModule[] = [
  tuongHoangThanh,
  ...imperialGateModules,
]

export { tuongHoangThanh }
export { imperialGateModules, imperialGateIds } from './gateDefs'
export { ImperialWalls } from './ImperialWalls'
export type { ImperialWallsProps } from './ImperialWalls'
export {
  buildImperialWallGroup,
  disposeImperialWallGroup,
  countImperialWallDrawCalls,
} from './buildImperialWalls'
export { buildImperialGate, countGateDrawCalls } from './buildImperialGate'
export type { ImperialGateStyle, ImperialGateBuildOpts } from './buildImperialGate'
export { IMPERIAL } from './constants'
export type { LodLevel } from './constants'
