import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildPhamSon } from './phamSon'

/**
 * Optional split module — chỉ phẩm sơn.
 * Không đăng ký cùng `san-dai-trieu-nghi` (đã embed phẩm sơn).
 */
export const phamSon: MonumentModule = {
  id: 'pham-son',
  displayName: { vi: 'Phẩm Sơn', en: 'Rank Markers' },
  build(lod: 0 | 1 | 2): THREE.Group {
    const root = new THREE.Group()
    root.name = 'pham-son'
    root.add(buildPhamSon(lod))
    return root
  },
  anchor: [0, 0, 0],
  rotationY: 0,
  boundingRadius: 32,
  poi: {
    vi: 'Phẩm sơn — bia đá ghi phẩm hàm văn/võ hai bên sân Đại Triều Nghi (nhất → cửu phẩm).',
    en: 'Stone rank markers lining both sides of the Grand Audience Courtyard (grades 1–9).',
    year: '1805',
  },
}
