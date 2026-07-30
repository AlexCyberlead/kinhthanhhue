import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildCourtyard } from './courtyard'
import { buildPhamSon } from './phamSon'
import { buildTuTuong } from './tuTuong'

/**
 * Sân Đại Triều Nghi — gói đầy đủ: lát gạch + phẩm sơn + tứ tượng.
 * Không rebuild cầu Trung Đạo / hồ Thái Dịch (đã có ở Wave A).
 */
function buildSanDaiTrieuNghi(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'san-dai-trieu-nghi'
  root.add(buildCourtyard(lod))
  root.add(buildPhamSon(lod))
  root.add(buildTuTuong(lod))
  return root
}

export const sanDaiTrieuNghi: MonumentModule = {
  id: 'san-dai-trieu-nghi',
  displayName: { vi: 'Sân Đại Triều Nghi', en: 'Grand Audience Courtyard' },
  build: buildSanDaiTrieuNghi,
  anchor: [0, 0, 0],
  rotationY: 0,
  boundingRadius: 45,
  poi: {
    vi: 'Sân Đại Triều Nghi — tâm hệ tọa độ digital twin. Nơi đại triều trước Điện Thái Hòa; phẩm sơn hai bên, tứ tượng góc sân. [ước lượng hợp lý] kích thước.',
    en: 'Grand Audience Courtyard — world origin. Court ceremonies before Thái Hòa; rank markers and four mythical beasts at the corners.',
    year: '1805',
  },
}
