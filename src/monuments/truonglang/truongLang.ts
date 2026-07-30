import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildTruongLang } from './buildTruongLang'

/**
 * Trường Lang — hành lang hàng trăm cột bao quanh sân Đại Triều Nghi / Thái Hòa.
 * Anchor [ước lượng] tại tâm sân (gốc world).
 */
export const truongLang: MonumentModule = {
  id: 'truong-lang',
  displayName: { vi: 'Trường Lang', en: 'Long Corridor' },
  build: buildTruongLang,
  /** Tâm sân Đại Triều Nghi — hành lang chữ nhật quanh sân / hướng điện Thái Hòa. */
  anchor: [0, 0, 0],
  rotationY: 0,
  boundingRadius: 95,
  poi: {
    vi: 'Trường Lang — hành lang bao quanh khu vực trung tâm Hoàng Thành (sân Đại Triều Nghi / hướng điện Thái Hòa). Hàng cột gỗ son, mái ngói thanh lưu ly, lan can đá. Anchor và quy mô [ước lượng].',
    en: 'Long Corridor — colonnade enclosing the central Imperial City courtyard (Đại Triều Nghi / toward Thái Hòa Hall). Lacquered timber columns, green glazed-tile roofs, stone balustrades. Anchor and scale [estimated].',
    year: '1805',
  },
}
