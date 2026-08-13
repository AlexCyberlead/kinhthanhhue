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
  boundingRadius: 145,
  poi: {
    vi: 'Trường Lang — hành lang bao quanh sân Đại Triều Nghi và nối Thái Hòa với Tả–Hữu Vu / Đại Cung môn. Hàng cột gỗ son, mái ngói thanh lưu ly. Anchor và quy mô [ước lượng].',
    en: 'Long Corridor — colonnade around Đại Triều Nghi, linking Thái Hòa with the Left/Right Wings and Đại Cung Gate. Lacquered columns, green glazed-tile roofs. Anchor and scale [estimated].',
    year: '1805',
  },
}
