import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildImperialWallGroup } from './buildImperialWalls'
import { IMPERIAL } from './constants'

/**
 * Tường chu vi Hoàng Thành — geometry local tại tâm hình học;
 * registry đặt tại [0, 0, -180].
 */
export const tuongHoangThanh: MonumentModule = {
  id: 'tuong-hoang-thanh',
  displayName: { vi: 'Tường Hoàng Thành', en: 'Imperial City Walls' },
  anchor: [IMPERIAL.centerX, 0, IMPERIAL.centerZ],
  rotationY: 0,
  boundingRadius: 420,
  poi: {
    vi: 'Tường chu vi Hoàng thành ~622×604 m, cao ~4,16 m, dày ~1 m. [xác thực — layout.md]',
    en: 'Imperial City curtain wall ~622×604 m, ~4.16 m high, ~1 m thick.',
    year: '1804',
  },
  build(lod) {
    return buildImperialWallGroup(lod)
  },
}
