import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildWall } from '../../core/geometry/kit/buildWall'
import { buildDinhHall } from './buildDinhHall'

/**
 * Cung Khôn Thái — khu Hoàng hậu: nhà chính + hai nhà phụ + tường sân.
 * Không 1 hộp. Anchor [0, 1, -245]. [ước lượng hợp lý]
 */
export function buildKhonThai(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'cung-khon-thai'
  root.userData.mode = 'restored'

  const main = buildDinhHall({
    width: 28,
    depth: 16,
    tiers: 2,
    tile: 'ngoi_thanh_luu_ly',
    columnsX: 7,
    columnsZ: 4,
    variant: 'residence',
    lod,
    name: 'khon-thai-chinh',
  })
  main.position.z = -4
  root.add(main)

  const east = buildDinhHall({
    width: 12,
    depth: 9,
    tiers: 1,
    tile: 'ngoi_thanh_luu_ly',
    columnsX: 3,
    columnsZ: 2,
    variant: 'residence',
    lod,
    name: 'khon-thai-dong',
  })
  east.position.set(18, 0, 6)
  east.rotation.y = Math.PI / 2
  root.add(east)

  const west = buildDinhHall({
    width: 12,
    depth: 9,
    tiers: 1,
    tile: 'ngoi_thanh_luu_ly',
    columnsX: 3,
    columnsZ: 2,
    variant: 'residence',
    lod,
    name: 'khon-thai-tay',
  })
  west.position.set(-18, 0, 6)
  west.rotation.y = -Math.PI / 2
  root.add(west)

  if (lod < 2) {
    const hx = 24
    const hz = 18
    const paths: THREE.Vector3[][] = [
      [new THREE.Vector3(-hx, 0, hz), new THREE.Vector3(-4, 0, hz)],
      [new THREE.Vector3(4, 0, hz), new THREE.Vector3(hx, 0, hz)],
      [new THREE.Vector3(hx, 0, hz), new THREE.Vector3(hx, 0, -hz)],
      [new THREE.Vector3(hx, 0, -hz), new THREE.Vector3(-hx, 0, -hz)],
      [new THREE.Vector3(-hx, 0, -hz), new THREE.Vector3(-hx, 0, hz)],
    ]
    for (const path of paths) {
      root.add(
        buildWall({
          path,
          height: 2.1,
          thickness: 0.38,
          crenellation: false,
          lod,
        }),
      )
    }
  }

  return root
}

export const cungKhonThai: MonumentModule = {
  id: 'cung-khon-thai',
  displayName: { vi: 'Cung Khôn Thái', en: 'Khon Thai Palace' },
  build: buildKhonThai,
  anchor: [0, 1, -245],
  rotationY: 0,
  boundingRadius: 45,
  poi: {
    vi: 'Cung Khôn Thái — nơi ở Hoàng hậu (điện Cao Minh Trung Chính). Khu nhiều nhà, không một khối. Anchor [ước lượng hợp lý].',
    en: 'Khon Thai Palace — empress’s compound (Cao Minh Trung Chính). A cluster, not a single hall. Anchor [estimated].',
    year: '1804',
  },
}
