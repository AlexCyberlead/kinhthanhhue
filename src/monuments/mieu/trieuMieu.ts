import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildMieu } from './buildMieu'

/**
 * Triệu Miếu — thờ Nguyễn Kim.
 * Anchor: buildings.json trieu-mieu [140, 1, -55].
 */
export const trieuMieu: MonumentModule = {
  id: 'trieu-mieu',
  displayName: { vi: 'Triệu Miếu', en: 'Trieu Mieu Temple' },
  anchor: [140, 1, -55],
  rotationY: 0,
  boundingRadius: 35,
  poi: {
    vi: 'Triệu Miếu — thờ Nguyễn Kim (Thái tổ Nguyễn triều); khu Đông Hoàng thành. Xây 1804.',
    en: 'Trieu Mieu — shrine to Nguyễn Kim, founder of the Nguyễn line; east Imperial City. Built 1804.',
    year: '1804',
  },
  build(lod) {
    return buildMieu({
      name: 'trieu-mieu',
      tiers: 2,
      cols: 4,
      rows: 3,
      roofMaterial: 'ngoi_thanh_luu_ly',
      scale: 0.95,
      courtyard: true,
      courtyardWidth: 36,
      courtyardDepth: 32,
      sideHalls: true,
      lod,
    })
  },
}
