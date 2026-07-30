import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildWingHall } from './buildWingHall'

/**
 * Tả Vu — nhà vu phía Đông, quan văn chờ triều trước điện Cần Chánh.
 * Anchor: buildings.json ta-vu [35, 1, -125].
 */
export const taVu: MonumentModule = {
  id: 'ta-vu',
  displayName: { vi: 'Tả Vu', en: 'Left Wing Hall' },
  build(lod) {
    return buildWingHall({ name: 'ta-vu', lod })
  },
  anchor: [35, 1, -125],
  rotationY: 0,
  boundingRadius: 28,
  poi: {
    vi: 'Tả Vu — nhà vu phía Đông trước điện Cần Chánh; quan văn chờ triều. Còn tồn tại (1804). Anchor [ước lượng hợp lý].',
    en: 'Left Wing Hall — east waiting hall before Can Chanh; civil officials. Extant (1804). Anchor [estimated].',
    year: '1804',
  },
}
