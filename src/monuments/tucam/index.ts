import type { MonumentModule } from '../../core/types/MonumentModule'
import { tuongTuCamThanh } from './tuongTuCamThanh'
import { daiCungMon } from './daiCungMon'

/**
 * WAVE C / C1 — Tường Tử Cấm Thành + Đại Cung Môn.
 *
 * Note reconstructionMode: tường luôn restored; Đại Cung build() = phục dựng
 * (status destroyed 1947 — ruin builder có thể bổ sung wave sau).
 */
export const tuCamModules: MonumentModule[] = [daiCungMon, tuongTuCamThanh]

export { tuongTuCamThanh } from './tuongTuCamThanh'
export { daiCungMon } from './daiCungMon'
export { TuCamWalls } from './TuCamWalls'
export type { TuCamWallsProps } from './TuCamWalls'
export {
  buildTuCamWallGroup,
  disposeTuCamWallGroup,
  countTuCamWallDrawCalls,
} from './buildTuCamWalls'
export {
  buildDaiCungMon,
  countDaiCungMonDrawCalls,
} from './buildDaiCungMon'
export type { DaiCungMonBuildOpts } from './buildDaiCungMon'
export { TUCAM } from './constants'
export type { LodLevel } from './constants'
