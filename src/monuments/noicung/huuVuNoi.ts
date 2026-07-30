import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildInnerWingHall } from './buildInnerWingHall'

/**
 * Hữu Vu nội — nhà vu phía Tây trong Tử Cấm (sau Cần Chánh, gần Càn Thành).
 * Phân biệt với `huu-vu` ngoại đình trước Cần Chánh.
 * Anchor [ước lượng hợp lý] trong Tử Cấm.
 */
export const huuVuNoi: MonumentModule = {
  id: 'huu-vu-noi',
  displayName: { vi: 'Hữu Vu nội', en: 'Inner Right Wing Hall' },
  build(lod) {
    return buildInnerWingHall({ name: 'huu-vu-noi', lod })
  },
  anchor: [-38, 1, -230],
  rotationY: 0,
  boundingRadius: 24,
  poi: {
    vi: 'Hữu Vu nội — nhà vu phía Tây trong Tử Cấm, sau Cần Chánh; quan võ hầu nội đình. Anchor [ước lượng hợp lý].',
    en: 'Inner Right Wing Hall — west wing inside the Forbidden Purple City; military attendants. Anchor [estimated].',
    year: '1804',
  },
}
