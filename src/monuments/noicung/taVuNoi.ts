import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildInnerWingHall } from './buildInnerWingHall'

/**
 * Tả Vu nội — nhà vu phía Đông trong Tử Cấm (sau Cần Chánh, gần Càn Thành).
 * Phân biệt với `ta-vu` ngoại đình trước Cần Chánh.
 * Anchor [ước lượng hợp lý] trong Tử Cấm.
 */
export const taVuNoi: MonumentModule = {
  id: 'ta-vu-noi',
  displayName: { vi: 'Tả Vu nội', en: 'Inner Left Wing Hall' },
  build(lod) {
    return buildInnerWingHall({ name: 'ta-vu-noi', lod })
  },
  anchor: [38, 1, -230],
  rotationY: 0,
  boundingRadius: 24,
  poi: {
    vi: 'Tả Vu nội — nhà vu phía Đông trong Tử Cấm, sau Cần Chánh; quan văn hầu nội đình. Anchor [ước lượng hợp lý].',
    en: 'Inner Left Wing Hall — east wing inside the Forbidden Purple City; civil attendants. Anchor [estimated].',
    year: '1804',
  },
}
