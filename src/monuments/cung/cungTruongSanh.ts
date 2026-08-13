import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildCungCompound } from './buildCungCompound'

/**
 * Cung Trường Sanh (Trường Sinh) — compound Tây-Bắc, nhỏ hơn Diên Thọ.
 * Anchor: buildings.json cung-truong-sanh [-200, 1, -300].
 */
function build(lod: 0 | 1 | 2) {
  return buildCungCompound({
    name: 'cung-truong-sanh',
    lod,
    mainW: 24,
    mainD: 14,
    rear: true,
    scale: lod === 2 ? 0.86 : 0.88,
  })
}

export const cungTruongSanh: MonumentModule = {
  id: 'cung-truong-sanh',
  displayName: { vi: 'Cung Trường Sanh', en: 'Truong Sanh Palace' },
  build,
  anchor: [-200, 1, -300],
  rotationY: 0,
  boundingRadius: 52,
  poi: {
    vi: 'Cung Trường Sanh (Trường Sinh) — khu Tây-Bắc Hoàng thành; nhiều nhà, sân trong, cổng, hành lang, mái thanh lưu ly. Xây 1822; đã trùng tu.',
    en: 'Truong Sanh Palace — northwest Imperial City compound: halls, inner court, gate, galleries, green-glazed roofs. Built 1822; restored.',
    year: '1822',
  },
}
