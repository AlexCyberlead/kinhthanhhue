import type { MonumentModule } from '../../core/types/MonumentModule'
import { duyetThiDuongModule } from './duyetThiDuong'

/**
 * WAVE C / C2 — Duyệt Thị Đường (nhà hát cổ + nội thất LOD0).
 * Anchor: buildings.json `duyet-thi-duong` [110, 1, -180], rotationY π/2.
 */
export const duyetThiModules: MonumentModule[] = [duyetThiDuongModule]

export { duyetThiDuongModule, buildDuyetThiDuong } from './duyetThiDuong'
export { buildInterior } from './interior'
export { estimateTris, countDrawCalls } from './geometry'
