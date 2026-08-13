import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildWall } from '../../core/geometry/kit/buildWall'
import { buildDinhHall } from './buildDinhHall'

/**
 * Lục Viện — 1 module: 6 nhà phi tần + tường khu.
 * Layout 2 hàng × 3. Anchor [-100, 1, -220]. [ước lượng hợp lý]
 */
export function buildLucVien(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'luc-vien'
  root.userData.mode = 'restored'

  const slots: Array<{ x: number; z: number }> = [
    { x: -16, z: 10 },
    { x: 0, z: 10 },
    { x: 16, z: 10 },
    { x: -16, z: -10 },
    { x: 0, z: -10 },
    { x: 16, z: -10 },
  ]

  for (let i = 0; i < slots.length; i++) {
    const house = buildDinhHall({
      width: lod === 2 ? 9 : 11,
      depth: lod === 2 ? 7 : 8.5,
      tiers: 1,
      tile: 'ngoi_thanh_luu_ly',
      columnsX: 3,
      columnsZ: 2,
      variant: 'residence',
      lod,
      name: `luc-vien-${i + 1}`,
    })
    house.position.set(slots[i].x, 0, slots[i].z)
    root.add(house)
  }

  if (lod < 2) {
    const hx = 28
    const hz = 22
    const paths: THREE.Vector3[][] = [
      [new THREE.Vector3(-hx, 0, hz), new THREE.Vector3(-3.5, 0, hz)],
      [new THREE.Vector3(3.5, 0, hz), new THREE.Vector3(hx, 0, hz)],
      [new THREE.Vector3(hx, 0, hz), new THREE.Vector3(hx, 0, -hz)],
      [new THREE.Vector3(hx, 0, -hz), new THREE.Vector3(-hx, 0, -hz)],
      [new THREE.Vector3(-hx, 0, -hz), new THREE.Vector3(-hx, 0, hz)],
    ]
    for (const path of paths) {
      root.add(
        buildWall({
          path,
          height: 1.85,
          thickness: 0.34,
          crenellation: false,
          lod,
        }),
      )
    }
  }

  return root
}

export const lucVien: MonumentModule = {
  id: 'luc-vien',
  displayName: { vi: 'Lục Viện', en: 'Six Courts of Concubines' },
  build: buildLucVien,
  anchor: [-100, 1, -220],
  rotationY: 0,
  boundingRadius: 55,
  poi: {
    vi: 'Lục Viện — sáu viện phi tần trong Tử Cấm. Một module instance 6 nhà + tường khu. Anchor [ước lượng hợp lý].',
    en: 'Six Courts — concubine pavilions. One module instances six houses plus a compound wall. Anchor [estimated].',
    year: '1804',
  },
}
