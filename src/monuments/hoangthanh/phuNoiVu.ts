import * as THREE from 'three'
import { buildGate, buildWall } from '../../core/geometry/kit'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { UV_REPEAT_METERS } from '../../core/materials/textures'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildDinhHall } from '../noicung/buildDinhHall'

/**
 * Phủ Nội Vụ — khu hành chính nhiều nhà, không 1 hộp.
 * Factory `buildDinhHall` phiên 8. Anchor [160, 1, -220].
 * [ước lượng hợp lý]
 */
export function buildPhuNoiVu(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'phu-noi-vu'
  root.userData.mode = 'restored'

  const brick = getMaterial('gach_bat_trang', lod)
  const court = new THREE.Mesh(new THREE.BoxGeometry(48, 0.1, 42), brick)
  const uv = court.geometry.getAttribute('uv')
  if (uv) {
    const ru = UV_REPEAT_METERS.gachBatTrang.u
    const rv = UV_REPEAT_METERS.gachBatTrang.v
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (uv.getX(i) * 48) / ru, (uv.getY(i) * 42) / rv)
    }
    uv.needsUpdate = true
  }
  court.position.y = 0.05
  court.receiveShadow = true
  root.add(court)

  const main = buildDinhHall({
    width: 22,
    depth: 13,
    tiers: 1,
    tile: 'ngoi_thanh_luu_ly',
    columnsX: 6,
    columnsZ: 3,
    variant: 'office',
    lod,
    name: 'phu-noi-vu-chinh',
  })
  main.position.set(0, 0, -8)
  root.add(main)

  const east = buildDinhHall({
    width: 11,
    depth: 8,
    tiers: 1,
    tile: 'ngoi_thanh_luu_ly',
    columnsX: 3,
    columnsZ: 2,
    variant: 'office',
    lod,
    name: 'phu-noi-vu-dong',
  })
  east.position.set(16, 0, 6)
  east.rotation.y = Math.PI / 2
  root.add(east)

  const west = buildDinhHall({
    width: 11,
    depth: 8,
    tiers: 1,
    tile: 'ngoi_thanh_luu_ly',
    columnsX: 3,
    columnsZ: 2,
    variant: 'office',
    lod,
    name: 'phu-noi-vu-tay',
  })
  west.position.set(-16, 0, 6)
  west.rotation.y = -Math.PI / 2
  root.add(west)

  const store = buildDinhHall({
    width: 10,
    depth: 7,
    tiers: 1,
    tile: 'ngoi_thanh_luu_ly',
    columnsX: 3,
    columnsZ: 2,
    variant: 'service',
    lod,
    name: 'phu-noi-vu-kho',
  })
  store.position.set(0, 0, 14)
  root.add(store)

  if (lod < 2) {
    const hx = 26
    const hz = 22
    const paths: THREE.Vector3[][] = [
      [new THREE.Vector3(-hx, 0, hz), new THREE.Vector3(-5, 0, hz)],
      [new THREE.Vector3(5, 0, hz), new THREE.Vector3(hx, 0, hz)],
      [new THREE.Vector3(hx, 0, hz), new THREE.Vector3(hx, 0, -hz)],
      [new THREE.Vector3(hx, 0, -hz), new THREE.Vector3(-hx, 0, -hz)],
      [new THREE.Vector3(-hx, 0, -hz), new THREE.Vector3(-hx, 0, hz)],
    ]
    for (const path of paths) {
      root.add(
        buildWall({
          path,
          height: 2.15,
          thickness: 0.38,
          crenellation: false,
          lod,
        }),
      )
    }

    const gate = buildGate({ type: 'vom', lod, width: 7.5, height: 4.2 })
    gate.position.set(0, 0, hz)
    gate.name = 'phu-noi-vu-mon'
    root.add(gate)
  }

  return root
}

export const phuNoiVu: MonumentModule = {
  id: 'phu-noi-vu',
  displayName: { vi: 'Phủ Nội Vụ', en: 'Imperial Household Office' },
  build: buildPhuNoiVu,
  anchor: [160, 1, -220],
  rotationY: 0,
  boundingRadius: 48,
  poi: {
    vi: 'Phủ Nội Vụ — khu hành chính nội vụ phía Đông Hoàng thành; nhiều nhà, sân gạch, tường hoa. Phá sau chiến tranh; bản dựng là phục hồi. Anchor [ước lượng hợp lý].',
    en: 'Imperial Household Office — eastern administrative compound: several halls, brick court, flower walls. Destroyed after the wars; this build is the restored form. Anchor [estimated].',
    year: '1804',
  },
}
