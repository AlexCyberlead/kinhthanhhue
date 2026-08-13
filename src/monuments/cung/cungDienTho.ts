import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildCungCompound } from './buildCungCompound'

/**
 * Cung Diên Thọ — compound Thái hậu, phía Tây Hoàng thành.
 * Nhiều nhà, sân trong, cổng, hành lang; mái thanh lưu ly, đầu đao phượng.
 * Anchor: buildings.json cung-dien-tho [-180, 1, -250].
 */
function build(lod: 0 | 1 | 2) {
  return buildCungCompound({
    name: 'cung-dien-tho',
    lod,
    mainW: 32,
    mainD: 16,
    rear: true,
    scale: lod === 2 ? 0.88 : 1,
  })
}

export const cungDienTho: MonumentModule = {
  id: 'cung-dien-tho',
  displayName: { vi: 'Cung Diên Thọ', en: 'Dien Tho Palace' },
  build,
  anchor: [-180, 1, -250],
  rotationY: 0,
  boundingRadius: 62,
  poi: {
    vi: 'Cung Diên Thọ — cung Thái hậu phía Tây Hoàng thành; khu nhiều nhà, sân trong, cổng, hành lang, mái thanh lưu ly, đầu đao phượng. Xây 1804.',
    en: 'Dien Tho Palace — Queen Mother compound west of the Imperial City: several halls, inner court, gate, galleries, green-glazed roofs, phoenix ridge. Built 1804.',
    year: '1804',
  },
}
