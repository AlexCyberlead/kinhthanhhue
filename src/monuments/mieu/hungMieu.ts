import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildMieu } from './buildMieu'

/**
 * Hưng Miếu — thờ Nguyễn Phúc Luân (thân phụ Gia Long).
 * Anchor: buildings.json hung-mieu [-140, 1, -55].
 */
export const hungMieu: MonumentModule = {
  id: 'hung-mieu',
  displayName: { vi: 'Hưng Miếu', en: 'Hung Mieu Temple' },
  anchor: [-140, 1, -55],
  rotationY: 0,
  boundingRadius: 35,
  poi: {
    vi: 'Hưng Miếu — thờ Nguyễn Phúc Luân (Hưng Tổ); khu Tây Hoàng thành. Xây 1804.',
    en: 'Hung Mieu — shrine to Nguyễn Phúc Luân (Hung To, father of Gia Long); west Imperial City. Built 1804.',
    year: '1804',
  },
  build(lod) {
    return buildMieu({
      name: 'hung-mieu',
      tiers: 2,
      cols: 4,
      rows: 3,
      roofMaterial: 'ngoi_thanh_luu_ly',
      scale: 1,
      courtyard: true,
      lod,
    })
  },
}
