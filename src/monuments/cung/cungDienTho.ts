import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildCungComplex } from './buildCungComplex'

/**
 * Cung Diên Thọ — cung Thái hậu, phía Tây Hoàng thành.
 * Ngói thanh lưu ly (không hoàng); đầu đao phượng [xác thực — materials.md].
 * Anchor: buildings.json cung-dien-tho [-180, 1, -250].
 */
function build(lod: 0 | 1 | 2) {
  return buildCungComplex({
    name: 'cung-dien-tho',
    lod,
    bays: 7,
    mainWidth: lod === 2 ? 28 : 36,
    mainDepth: lod === 2 ? 16 : 20,
    wallH: lod === 2 ? 4.2 : 5.2,
    wingWidth: lod === 2 ? 8 : 11,
    wingDepth: lod === 2 ? 10 : 14,
    columnRows: lod === 0 ? 4 : 3,
    columnCols: lod === 0 ? 7 : 5,
    ridgeOrnament: 'phoenix',
  })
}

export const cungDienTho: MonumentModule = {
  id: 'cung-dien-tho',
  displayName: { vi: 'Cung Diên Thọ', en: 'Dien Tho Palace' },
  build,
  anchor: [-180, 1, -250],
  rotationY: 0,
  boundingRadius: 55,
  poi: {
    vi: 'Cung Diên Thọ — cung Thái hậu phía Tây Hoàng thành; phức hợp nhiều gian, mái trùng thiềm ngói thanh lưu ly, đầu đao phượng. Xây 1804.',
    en: 'Dien Tho Palace — Queen Mother complex on the west of the Imperial City; multi-bay halls, green-glazed double eaves, phoenix ridge ornaments. Built 1804.',
    year: '1804',
  },
}
