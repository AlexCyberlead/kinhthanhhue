import type { MonumentModule } from '../../core/types/MonumentModule'
import { theMieu } from './theMieu'
import { hienLamCac } from './hienLamCac'
import { cuuDinh } from './cuuDinh'

/**
 * WAVE B / B5 — Thế Tổ Miếu cluster:
 * Thế Miếu + Hiển Lâm Các + Cửu Đỉnh.
 */
export const theMieuModules: MonumentModule[] = [theMieu, hienLamCac, cuuDinh]

export { theMieu, hienLamCac, cuuDinh }
export { estimateTris, countDrawCalls, buildUrnGeometry } from './geometry'
