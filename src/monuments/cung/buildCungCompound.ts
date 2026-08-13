import * as THREE from 'three'
import { buildGate, buildRoof, buildWall } from '../../core/geometry/kit'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { UV_REPEAT_METERS } from '../../core/materials/textures'
import { buildDinhHall } from '../noicung/buildDinhHall'

export type CungCompoundOpts = {
  name: string
  lod: 0 | 1 | 2
  /** Main hall width. */
  mainW: number
  mainD: number
  /** Extra rear hall? */
  rear?: boolean
  scale?: number
}

/**
 * Cung Thái hậu = compound: nhiều nhà, sân trong, cổng, hành lang, mái thanh, đầu đao phượng.
 * Không 1 hộp + 2 cánh. WorldScene lod=1 đọc được xóm nhà.
 */
export function buildCungCompound(opts: CungCompoundOpts): THREE.Group {
  const { name, lod, mainW, mainD, rear = true, scale = 1 } = opts
  const root = new THREE.Group()
  root.name = name
  root.userData.mode = 'restored'

  const brick = getMaterial('gach_bat_trang', lod)
  const courtW = (mainW + 28) * scale
  const courtD = (mainD + 26) * scale
  const court = new THREE.Mesh(new THREE.BoxGeometry(courtW, 0.1, courtD), brick)
  const uv = court.geometry.getAttribute('uv')
  if (uv) {
    const ru = UV_REPEAT_METERS.gachBatTrang.u
    const rv = UV_REPEAT_METERS.gachBatTrang.v
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (uv.getX(i) * courtW) / ru, (uv.getY(i) * courtD) / rv)
    }
    uv.needsUpdate = true
  }
  court.position.y = 0.05
  court.receiveShadow = true
  root.add(court)

  const main = buildDinhHall({
    width: mainW * scale,
    depth: mainD * scale,
    tiers: 2,
    tile: 'ngoi_thanh_luu_ly',
    columnsX: lod === 2 ? 5 : 7,
    columnsZ: 3,
    variant: 'residence',
    lod,
    name: `${name}-chinh`,
  })
  main.position.z = -6 * scale
  root.add(main)

  const wingW = 12 * scale
  const wingD = 8.5 * scale
  const east = buildDinhHall({
    width: wingW,
    depth: wingD,
    tiers: 1,
    tile: 'ngoi_thanh_luu_ly',
    columnsX: 3,
    columnsZ: 2,
    variant: 'residence',
    lod,
    name: `${name}-dong`,
  })
  east.position.set(18 * scale, 0, 6 * scale)
  east.rotation.y = Math.PI / 2
  root.add(east)

  const west = buildDinhHall({
    width: wingW,
    depth: wingD,
    tiers: 1,
    tile: 'ngoi_thanh_luu_ly',
    columnsX: 3,
    columnsZ: 2,
    variant: 'residence',
    lod,
    name: `${name}-tay`,
  })
  west.position.set(-18 * scale, 0, 6 * scale)
  west.rotation.y = -Math.PI / 2
  root.add(west)

  if (rear) {
    const back = buildDinhHall({
      width: 16 * scale,
      depth: 10 * scale,
      tiers: 1,
      tile: 'ngoi_thanh_luu_ly',
      columnsX: 5,
      columnsZ: 2,
      variant: 'residence',
      lod,
      name: `${name}-hau`,
    })
    back.position.z = -20 * scale
    root.add(back)
  }

  if (lod < 2) {
    // Hành lang 2 bên nối nhà chính — mái kit
    for (const sx of [-1, 1] as const) {
      const lang = buildRoof({
        width: 4.2,
        depth: 16 * scale,
        tiers: 1,
        tileMaterial: 'ngoi_thanh_luu_ly',
        ridge: 'none',
        lod,
      })
      lang.position.set(sx * 12 * scale, 4.2, -2 * scale)
      root.add(lang)
    }

    const hx = 26 * scale
    const hz = 24 * scale
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
          height: 2.2,
          thickness: 0.38,
          crenellation: false,
          lod,
        }),
      )
    }

    const gate = buildGate({ type: 'vom', lod, width: 8.2, height: 4.4 })
    gate.position.set(0, 0, hz)
    gate.name = `${name}-mon`
    root.add(gate)
  }

  return root
}
