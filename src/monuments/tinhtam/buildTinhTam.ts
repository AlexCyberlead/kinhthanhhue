import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { buildGate, buildPlatform, buildRoof, buildWall } from '../../core/geometry/kit'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { UV_REPEAT_METERS } from '../../core/materials/textures'
import { buildDinhHall } from '../noicung/buildDinhHall'
import { ISLANDS, TINH_TAM_LAKE } from './constants'

type Lod = 0 | 1 | 2

function paveIsland(
  hx: number,
  hz: number,
  lod: Lod,
): THREE.Mesh {
  const brick = getMaterial('gach_vo', lod)
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(hx * 2, 0.55, hz * 2), brick)
  const uv = mesh.geometry.getAttribute('uv')
  if (uv) {
    const ru = UV_REPEAT_METERS.gachVo.u
    const rv = UV_REPEAT_METERS.gachVo.v
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (uv.getX(i) * hx * 2) / ru, (uv.getY(i) * hz * 2) / rv)
    }
    uv.needsUpdate = true
  }
  mesh.position.y = 0.28
  mesh.receiveShadow = true
  mesh.castShadow = lod < 2
  return mesh
}

function buildPavilion(
  name: string,
  width: number,
  depth: number,
  lod: Lod,
  royal = false,
): THREE.Group {
  return buildDinhHall({
    width,
    depth,
    tiers: royal ? 2 : 1,
    tile: royal ? 'ngoi_hoang_luu_ly' : 'ngoi_thanh_luu_ly',
    columnsX: royal ? 5 : 3,
    columnsZ: 2,
    variant: royal ? 'royal' : 'residence',
    lod,
    name,
  })
}

function buildArchBridge(
  length: number,
  width: number,
  lod: Lod,
): THREE.Group {
  const g = new THREE.Group()
  const stone = getMaterial('da_thanh', lod)
  const deckY = 1.05
  const deck = new THREE.Mesh(new THREE.BoxGeometry(width, 0.28, length), stone)
  deck.position.y = deckY
  deck.receiveShadow = true
  g.add(deck)

  if (lod < 2) {
    const rise = 0.85
    const arch = new THREE.Mesh(
      new THREE.CylinderGeometry(length * 0.28, length * 0.28, width * 0.9, lod === 0 ? 10 : 7, 1, true, 0, Math.PI),
      stone,
    )
    arch.rotation.z = Math.PI / 2
    arch.rotation.y = Math.PI / 2
    arch.position.y = rise * 0.45
    g.add(arch)

    const railH = 0.62
    for (const sx of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, railH, length - 0.8), stone)
      rail.position.set(sx * (width / 2 - 0.16), deckY + railH / 2, 0)
      g.add(rail)
    }
  }
  return g
}

/**
 * Cụm Tịnh Tâm — kè, đường bao, cửa vườn, 3 đảo, cầu, lầu.
 * Nước + sen nằm ở WaterSystem (mặt riêng, không recycle Thái Dịch).
 */
export function buildTinhTam(lod: Lod): THREE.Group {
  const root = new THREE.Group()
  root.name = 'ho-tinh-tam'

  const { cx, cz, halfX, halfZ } = TINH_TAM_LAKE
  const stone = getMaterial('da_thanh', lod)
  const dirt = getMaterial('dat_nen', lod)

  // Kè + đường bao — 4 cạnh
  const copeW = 1.1
  const copeH = 0.42
  const pathW = lod === 2 ? 3.2 : 4.2
  const ring: Array<{ w: number; d: number; x: number; z: number }> = [
    { w: halfX * 2 + 6, d: copeW, x: 0, z: halfZ + 1.2 },
    { w: halfX * 2 + 6, d: copeW, x: 0, z: -halfZ - 1.2 },
    { w: copeW, d: halfZ * 2, x: halfX + 1.2, z: 0 },
    { w: copeW, d: halfZ * 2, x: -halfX - 1.2, z: 0 },
    { w: halfX * 2 + 10, d: pathW, x: 0, z: halfZ + 3.6 },
    { w: halfX * 2 + 10, d: pathW, x: 0, z: -halfZ - 3.6 },
    { w: pathW, d: halfZ * 2 + 4, x: halfX + 3.6, z: 0 },
    { w: pathW, d: halfZ * 2 + 4, x: -halfX - 3.6, z: 0 },
  ]
  const keGeos: THREE.BufferGeometry[] = []
  const pathGeos: THREE.BufferGeometry[] = []
  ring.forEach((r, idx) => {
    const box = new THREE.BoxGeometry(r.w, idx < 4 ? copeH : 0.14, r.d)
    box.translate(r.x, idx < 4 ? copeH / 2 : 0.08, r.z)
    if (idx < 4) keGeos.push(box)
    else pathGeos.push(box)
  })
  const ke = new THREE.Mesh(mergeSafe(keGeos), stone)
  ke.name = 'tinh-tam-ke'
  ke.castShadow = lod === 0
  ke.receiveShadow = true
  root.add(ke)
  const path = new THREE.Mesh(mergeSafe(pathGeos), dirt)
  path.name = 'tinh-tam-path'
  path.receiveShadow = true
  root.add(path)

  if (lod < 2) {
    const hx = halfX + 8
    const hz = halfZ + 8
    const paths: THREE.Vector3[][] = [
      [new THREE.Vector3(-hx, 0, hz), new THREE.Vector3(-6, 0, hz)],
      [new THREE.Vector3(6, 0, hz), new THREE.Vector3(hx, 0, hz)],
      [new THREE.Vector3(hx, 0, hz), new THREE.Vector3(hx, 0, -hz)],
      [new THREE.Vector3(hx, 0, -hz), new THREE.Vector3(-hx, 0, -hz)],
      [new THREE.Vector3(-hx, 0, -hz), new THREE.Vector3(-hx, 0, hz)],
    ]
    for (const p of paths) {
      root.add(
        buildWall({
          path: p,
          height: 2.1,
          thickness: 0.4,
          crenellation: false,
          lod,
        }),
      )
    }
    const gate = buildGate({ type: 'vom', lod, width: 8.5, height: 4.6 })
    gate.position.set(0, 0, hz)
    gate.name = 'tinh-tam-mon'
    root.add(gate)
  }

  // Đảo Bồng Lai — lớn, hơi Nam tâm hồ + lầu Nhất Trụ
  {
    const isle = new THREE.Group()
    isle.name = ISLANDS.bongLai.name
    isle.position.set(ISLANDS.bongLai.cx - cx, 0, ISLANDS.bongLai.cz - cz)
    isle.add(paveIsland(ISLANDS.bongLai.hx, ISLANDS.bongLai.hz, lod))
    const hall = buildPavilion('nhat-tru', 11, 8, lod, true)
    hall.position.y = 0.5
    isle.add(hall)
    if (lod < 2) {
      isle.add(
        buildPlatform({
          width: 8,
          depth: 5,
          height: 0.45,
          steps: 2,
          balustrade: lod === 0,
          lod,
        }),
      )
    }
    root.add(isle)
  }

  // Phương Trượng — lầu Trần Thanh
  {
    const isle = new THREE.Group()
    isle.name = ISLANDS.phuongTruong.name
    isle.position.set(ISLANDS.phuongTruong.cx - cx, 0, ISLANDS.phuongTruong.cz - cz)
    isle.add(paveIsland(ISLANDS.phuongTruong.hx, ISLANDS.phuongTruong.hz, lod))
    const hall = buildPavilion('tran-thanh', 8, 6.5, lod, false)
    hall.position.y = 0.5
    isle.add(hall)
    root.add(isle)
  }

  // Doanh Châu — đình nhỏ
  {
    const isle = new THREE.Group()
    isle.name = ISLANDS.doanhChau.name
    isle.position.set(ISLANDS.doanhChau.cx - cx, 0, ISLANDS.doanhChau.cz - cz)
    isle.add(paveIsland(ISLANDS.doanhChau.hx, ISLANDS.doanhChau.hz, lod))
    if (lod === 2) {
      const mass = new THREE.Mesh(
        new THREE.BoxGeometry(5, 2.4, 4),
        getMaterial('tuong_voi', lod),
      )
      mass.position.y = 1.7
      isle.add(mass)
    } else {
      const dinh = buildRoof({
        width: 6.4,
        depth: 5.2,
        tiers: 1,
        tileMaterial: 'ngoi_thanh_luu_ly',
        ridge: lod < 2 ? 'bau-phap-lam' : 'none',
        lod,
      })
      dinh.position.y = 3.4
      isle.add(dinh)
      const posts = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 2.6, 3.4),
        getMaterial('go_son_son', lod),
      )
      posts.position.y = 1.8
      isle.add(posts)
    }
    root.add(isle)
  }

  // Cầu nối: bờ Nam → Bồng Lai → hai đảo Bắc
  const bridges: Array<{ x: number; z: number; len: number; w: number; ry: number }> = [
    { x: 0, z: (halfZ + ISLANDS.bongLai.cz - cz) / 2, len: 38, w: 3.6, ry: 0 },
    {
      x: (ISLANDS.phuongTruong.cx - cx) * 0.5,
      z: (ISLANDS.bongLai.cz + ISLANDS.phuongTruong.cz) / 2 - cz,
      len: 42,
      w: 3.2,
      ry: Math.atan2(ISLANDS.phuongTruong.cx - ISLANDS.bongLai.cx, ISLANDS.phuongTruong.cz - ISLANDS.bongLai.cz),
    },
    {
      x: (ISLANDS.doanhChau.cx - cx) * 0.5,
      z: (ISLANDS.bongLai.cz + ISLANDS.doanhChau.cz) / 2 - cz,
      len: 44,
      w: 3.2,
      ry: Math.atan2(ISLANDS.doanhChau.cx - ISLANDS.bongLai.cx, ISLANDS.doanhChau.cz - ISLANDS.bongLai.cz),
    },
  ]
  for (const b of bridges) {
    const br = buildArchBridge(b.len, b.w, lod)
    br.position.set(b.x, 0, b.z)
    br.rotation.y = b.ry
    root.add(br)
  }

  return root
}

function mergeSafe(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (geos.length === 1) return geos[0]
  const m = mergeGeometries(geos, false)
  for (const g of geos) g.dispose()
  return m ?? new THREE.BufferGeometry()
}
