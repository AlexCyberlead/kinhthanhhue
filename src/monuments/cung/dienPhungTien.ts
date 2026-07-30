import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildCungComplex } from './buildCungComplex'

/**
 * Điện Phụng Tiên — hư hại nặng sau chiến tranh (ruin / partial).
 * Ngói thanh lưu ly còn lại; tường vôi sụt, mái nghiêng, đổ nát InstancedMesh.
 * Anchor: buildings.json dien-phung-tien [-120, 1, -200].
 */
function build(lod: 0 | 1 | 2) {
  return buildCungComplex({
    name: 'dien-phung-tien',
    lod,
    bays: 5,
    mainWidth: lod === 2 ? 18 : 24,
    mainDepth: lod === 2 ? 12 : 15,
    wallH: lod === 2 ? 3.6 : 4.4,
    wingWidth: lod === 2 ? 5 : 7,
    wingDepth: lod === 2 ? 7 : 10,
    columnRows: 3,
    columnCols: lod === 0 ? 5 : 3,
    ruin: true,
    ridgeOrnament: 'none',
  })
}

export const dienPhungTien: MonumentModule = {
  id: 'dien-phung-tien',
  displayName: { vi: 'Điện Phụng Tiên', en: 'Phung Tien Hall' },
  build,
  anchor: [-120, 1, -200],
  rotationY: 0,
  boundingRadius: 35,
  poi: {
    vi: 'Điện Phụng Tiên — điện thờ tổ mẫu / phụng tiên trong Hoàng thành; hư hại nặng sau chiến tranh, còn nền–tường–mái partial. Xây 1804. [status ước lượng hợp lý]',
    en: 'Phung Tien Hall — ancestral / phoenix hall in the Imperial City; heavily damaged postwar, partial walls and roofs remain. Built 1804.',
    year: '1804',
  },
}
