import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildDinhHallRuin } from '../noicung/buildDinhHall'

/**
 * Điện Phụng Tiên — ruin/partial: nền, cột gãy, tường thấp đọc được.
 * Pure — không đọc store. Anchor: buildings.json dien-phung-tien [-120, 1, -200].
 */
function build(lod: 0 | 1 | 2) {
  const root = new THREE.Group()
  root.name = 'dien-phung-tien'
  root.userData.mode = 'ruin'

  const main = buildDinhHallRuin({
    width: 24,
    depth: 15,
    tiers: 1,
    tile: 'ngoi_thanh_luu_ly',
    columnsX: lod === 0 ? 5 : 4,
    columnsZ: 3,
    variant: 'residence',
    status: 'ruin',
    lod,
    name: 'phung-tien-chinh',
  })
  root.add(main)

  const wing = buildDinhHallRuin({
    width: 10,
    depth: 8,
    tiers: 1,
    tile: 'ngoi_thanh_luu_ly',
    columnsX: 3,
    columnsZ: 2,
    variant: 'residence',
    status: 'ruin',
    lod,
    name: 'phung-tien-canh',
  })
  wing.position.set(16, 0, 2)
  root.add(wing)

  if (lod < 2) {
    const plaster = getMaterial('tuong_voi', lod)
    const stub = new THREE.Mesh(new THREE.BoxGeometry(18, 1.1, 0.4), plaster)
    stub.position.set(-4, 1.3, -8)
    stub.castShadow = true
    root.add(stub)
  }

  return root
}

export const dienPhungTien: MonumentModule = {
  id: 'dien-phung-tien',
  displayName: { vi: 'Điện Phụng Tiên', en: 'Phung Tien Hall' },
  build,
  anchor: [-120, 1, -200],
  rotationY: 0,
  boundingRadius: 35,
  poi: {
    vi: 'Điện Phụng Tiên — điện thờ tổ mẫu trong Hoàng thành; hư hại nặng sau chiến tranh — còn nền, cột gãy, tường thấp. Xây 1804. [status ước lượng hợp lý]',
    en: 'Phung Tien Hall — ancestral hall in the Imperial City; heavily damaged postwar — readable foundation, broken columns and low walls. Built 1804.',
    year: '1804',
  },
}
