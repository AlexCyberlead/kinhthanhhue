import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildTuTuong } from './tuTuong'

/**
 * Optional split module — chỉ tứ tượng.
 * Không đăng ký cùng `san-dai-trieu-nghi` (đã embed tứ tượng).
 */
export const tuTuong: MonumentModule = {
  id: 'tu-tuong',
  displayName: { vi: 'Tứ Tượng', en: 'Four Mythical Beasts' },
  build(lod: 0 | 1 | 2): THREE.Group {
    const root = new THREE.Group()
    root.name = 'tu-tuong'
    root.add(buildTuTuong(lod))
    return root
  },
  anchor: [0, 0, 0],
  rotationY: 0,
  boundingRadius: 40,
  poi: {
    vi: 'Tứ tượng — Thanh Long, Bạch Hổ, Chu Tước, Huyền Vũ (stylized) góc sân Đại Triều Nghi.',
    en: 'Four mythical beasts — Azure Dragon, White Tiger, Vermilion Bird, Black Tortoise at courtyard corners.',
    year: '1805',
  },
}
