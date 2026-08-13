import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildTinhTam } from './buildTinhTam'
import { TINH_TAM_LAKE } from './constants'

/**
 * Hồ Tịnh Tâm — cụm hồ–đảo–lâu lớn nhất Kinh thành.
 * Anchor = tâm mặt nước [220, 0, -620]. [ước lượng hợp lý]
 */
export const hoTinhTam: MonumentModule = {
  id: 'ho-tinh-tam',
  displayName: { vi: 'Hồ Tịnh Tâm', en: 'Tinh Tam Lake' },
  build: buildTinhTam,
  anchor: [TINH_TAM_LAKE.cx, 0, TINH_TAM_LAKE.cz],
  rotationY: 0,
  boundingRadius: 190,
  poi: {
    vi: 'Hồ Tịnh Tâm — hồ ngự lớn phía Bắc / Đông-Bắc Hoàng thành: ba đảo Bồng Lai, Phương Trượng, Doanh Châu, lầu Nhất Trụ / Trần Thanh, sen ngự. Tâm [220, −620], mặt nước ~280×180 m [ước lượng hợp lý — dịch khỏi tường Bắc z≈−482].',
    en: 'Tinh Tam Lake — the largest garden lake north/northeast of the Imperial City: three islands (Bồng Lai, Phương Trượng, Doanh Châu), Nhất Trụ / Trần Thanh pavilions, imperial lotus. Centre [220, −620], water ~280×180 m [estimated — moved off the north wall at z≈−482].',
    year: '1822',
  },
}
