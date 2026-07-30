import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildWingHall } from './buildWingHall'

/**
 * Hữu Vu — nhà vu phía Tây, quan võ chờ triều trước điện Cần Chánh.
 * Anchor: buildings.json huu-vu [-35, 1, -125].
 */
export const huuVu: MonumentModule = {
  id: 'huu-vu',
  displayName: { vi: 'Hữu Vu', en: 'Right Wing Hall' },
  build(lod) {
    return buildWingHall({ name: 'huu-vu', lod })
  },
  anchor: [-35, 1, -125],
  rotationY: 0,
  boundingRadius: 28,
  poi: {
    vi: 'Hữu Vu — nhà vu phía Tây trước điện Cần Chánh; quan võ chờ triều. Còn tồn tại (1804). Anchor [ước lượng hợp lý].',
    en: 'Right Wing Hall — west waiting hall before Can Chanh; military officials. Extant (1804). Anchor [estimated].',
    year: '1804',
  },
}
