import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildMieu } from './buildMieu'

/**
 * Thái Miếu — thờ các chúa Nguyễn (lớn hơn Triệu/Hưng).
 * Anchor: buildings.json thai-mieu [95, 1, -90].
 */
export const thaiMieu: MonumentModule = {
  id: 'thai-mieu',
  displayName: { vi: 'Thái Miếu', en: 'Thai Mieu Temple' },
  anchor: [95, 1, -90],
  rotationY: 0,
  boundingRadius: 45,
  poi: {
    vi: 'Thái Miếu — thờ các chúa Nguyễn; khu Đông-Nam Hoàng thành. Xây 1804; mái hoàng lưu ly.',
    en: 'Thai Mieu — shrine to the Nguyễn lords; southeast Imperial City. Built 1804; yellow glazed-tile roof.',
    year: '1804',
  },
  build(lod) {
    return buildMieu({
      name: 'thai-mieu',
      tiers: 2,
      cols: 5,
      rows: 4,
      roofMaterial: 'ngoi_hoang_luu_ly',
      scale: 1.15,
      courtyard: true,
      courtyardWidth: 52,
      courtyardDepth: 46,
      sideHalls: true,
      lod,
    })
  },
}
