import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildCungComplex } from './buildCungComplex'

/**
 * Cung Trường Sanh (Trường Sinh) — phía Tây-Bắc Hoàng thành.
 * Ngói thanh lưu ly; phức hợp nhỏ hơn Diên Thọ.
 * Anchor: buildings.json cung-truong-sanh [-200, 1, -300].
 */
function build(lod: 0 | 1 | 2) {
  return buildCungComplex({
    name: 'cung-truong-sanh',
    lod,
    bays: 5,
    mainWidth: lod === 2 ? 22 : 28,
    mainDepth: lod === 2 ? 14 : 17,
    wallH: lod === 2 ? 4.0 : 4.8,
    wingWidth: lod === 2 ? 7 : 9,
    wingDepth: lod === 2 ? 9 : 12,
    columnRows: lod === 0 ? 3 : 3,
    columnCols: lod === 0 ? 5 : 4,
    ridgeOrnament: 'phoenix',
  })
}

export const cungTruongSanh: MonumentModule = {
  id: 'cung-truong-sanh',
  displayName: { vi: 'Cung Trường Sanh', en: 'Truong Sanh Palace' },
  build,
  anchor: [-200, 1, -300],
  rotationY: 0,
  boundingRadius: 45,
  poi: {
    vi: 'Cung Trường Sanh (Trường Sinh) — cung phía Tây-Bắc Hoàng thành; nhiều gian, mái trùng thiềm ngói thanh lưu ly. Xây 1822; đã trùng tu.',
    en: 'Truong Sanh Palace — northwest Imperial City complex; multi-bay halls with green-glazed double eaves. Built 1822; restored.',
    year: '1822',
  },
}
