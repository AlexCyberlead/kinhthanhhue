import * as THREE from 'three'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'

/**
 * 80 cột lim sơn son thếp vàng — kit `buildColumnGrid` (tảng + đấu + đai).
 * Tiền điện 9×5 (7 gian 2 chái) + chính điện 7×5 = 80.
 * [xác thực — Wikipedia / VnExpress] 80 cột; bước gian [ước lượng hợp lý].
 */
export function buildThaiHoaColumns(opts: {
  height: number
  radius?: number
  floorY: number
  frontCenterZ: number
  rearCenterZ: number
  lod: 0 | 1 | 2
}): THREE.Group {
  const { height, radius = 0.3, floorY, frontCenterZ, rearCenterZ, lod } = opts
  const group = new THREE.Group()
  group.name = 'thaiHoaColumns'

  const front = buildColumnGrid({
    rows: 5,
    cols: 9,
    spacing: [4.1, 2.85],
    height,
    radius,
    material: 'go_son_son',
    lod,
    plinth: true,
    capital: lod < 2,
  })
  front.name = 'columns-tien'
  front.position.set(0, floorY, frontCenterZ)
  group.add(front)

  const rear = buildColumnGrid({
    rows: 5,
    cols: 7,
    spacing: [4.4, 2.85],
    height,
    radius,
    material: 'go_son_son',
    lod,
    plinth: true,
    capital: lod < 2,
  })
  rear.name = 'columns-chinh'
  rear.position.set(0, floorY, rearCenterZ)
  group.add(rear)

  return group
}
