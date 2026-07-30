import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildTuCamWallGroup } from './buildTuCamWalls'
import { TUCAM } from './constants'

/**
 * Tường chu vi Tử Cấm Thành — geometry local tại tâm hình học;
 * registry đặt tại [0, 0, -235].
 *
 * Note: luôn restored. `reconstructionMode` không ảnh hưởng tường này
 * (tường còn nền/dấu tích; cổng gỗ Đại Cung là phần destroyed).
 */
export const tuongTuCamThanh: MonumentModule = {
  id: 'tuong-tu-cam-thanh',
  displayName: { vi: 'Tường Tử Cấm Thành', en: 'Forbidden Purple City Walls' },
  anchor: [TUCAM.centerX, 0, TUCAM.centerZ],
  rotationY: 0,
  boundingRadius: 230,
  poi: {
    vi: 'Tường chu vi Tử Cấm ~324×290,7 m, cao ~3,72 m, dày ~0,72 m. Luôn hiển thị restored. [xác thực — layout.md]',
    en: 'Forbidden Purple City curtain ~324×290.7 m, ~3.72 m high, ~0.72 m thick. Always restored.',
    year: '1804',
  },
  build(lod) {
    return buildTuCamWallGroup(lod)
  },
}
