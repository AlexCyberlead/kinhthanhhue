import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildDaiCungMon } from './buildDaiCungMon'

/**
 * Đại Cung Môn — cổng chính Nam Tử Cấm.
 * Anchor exact từ buildings.json: [0, 1, -95].
 * Status destroyed (1947); build() = bản phục dựng (restored).
 */
export const daiCungMon: MonumentModule = {
  id: 'dai-cung-mon',
  displayName: { vi: 'Đại Cung Môn', en: 'Great Palace Gate' },
  anchor: [0, 1, -95],
  rotationY: 0,
  boundingRadius: 30,
  poi: {
    vi: 'Cổng chính Nam Tử Cấm; gỗ; xây 1833, phá 1947. Đang hiển thị bản phục dựng. Anchor [ước lượng hợp lý].',
    en: 'Main south gate of the Forbidden Purple City; wood; built 1833, destroyed 1947. Showing restored reconstruction.',
    year: '1833',
  },
  build(lod) {
    const g = buildDaiCungMon({ lod, width: 20, height: 7.2 })
    g.name = 'dai-cung-mon'
    return g
  },
}
