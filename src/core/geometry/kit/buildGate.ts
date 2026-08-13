import * as THREE from 'three'
import { getMaterial } from '../../materials/MaterialLibrary'
import { buildColumnGrid } from './buildColumnGrid'
import { buildPlatform } from './buildPlatform'
import { buildRoof } from './buildRoof'
import { hoiVanBandGeo } from './ornament'
import { mergeKit, meshOf } from './roof/merge'
import { copyUvToUv2, scaleBoxUvToMeters, uvRepeat } from './uvMeters'

export type GateOpts = {
  type: 'vom' | 'tam-quan' | 'ngo-mon'
  lod?: 0 | 1 | 2
  width?: number
  height?: number
}

type Opening = { x: number; hw: number; hh: number }

function worldUv(geo: THREE.BufferGeometry, tileU: number, tileV: number): void {
  const pos = geo.getAttribute('position')
  const uvs = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = pos.getX(i) / tileU
    uvs[i * 2 + 1] = pos.getY(i) / tileV
  }
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  copyUvToUv2(geo)
}

/**
 * Thân cửa đùn — hình chữ nhật có lỗ vòm (không hộp thủng màu tối).
 * Vòm Hội Điển: rộng 3.825 × cao 5.185. [xác thực — Cố đô Huế]
 */
function archBodyGeo(
  width: number,
  height: number,
  thickness: number,
  openings: Opening[],
  lod: 0 | 1 | 2,
  tile = uvRepeat('tuongVoi'),
): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  shape.moveTo(-width / 2, 0)
  shape.lineTo(width / 2, 0)
  shape.lineTo(width / 2, height)
  shape.lineTo(-width / 2, height)
  shape.closePath()

  const segs = lod === 0 ? 12 : lod === 1 ? 8 : 5
  for (const o of openings) {
    const left = o.x - o.hw
    const right = o.x + o.hw
    const spring = Math.max(0.35, o.hh - o.hw)
    const hole = new THREE.Path()
    hole.moveTo(left, 0)
    hole.lineTo(left, spring)
    hole.absarc(o.x, spring, o.hw, Math.PI, 0, false)
    hole.lineTo(right, 0)
    hole.lineTo(left, 0)
    shape.holes.push(hole)
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: segs,
    steps: 1,
  })
  geo.translate(0, 0, -thickness / 2)
  worldUv(geo, tile.u, tile.v)
  geo.computeVertexNormals()
  return geo
}

function archRings(openings: Opening[], thickness: number, lod: 0 | 1 | 2): THREE.BufferGeometry | null {
  if (lod === 2) return null
  const parts: THREE.BufferGeometry[] = []
  const radial = lod === 0 ? 12 : 8
  for (const o of openings) {
    const spring = Math.max(0.35, o.hh - o.hw)
    for (const z of [-thickness / 2 - 0.04, thickness / 2 + 0.04]) {
      const torus = new THREE.TorusGeometry(o.hw, 0.13, 5, radial, Math.PI)
      torus.translate(o.x, spring, z)
      parts.push(torus)
    }
    // jamb đá hai bên
    for (const sx of [-1, 1]) {
      const jamb = new THREE.BoxGeometry(0.22, o.hh * 0.72, thickness + 0.16)
      jamb.translate(o.x + sx * (o.hw + 0.08), o.hh * 0.36, 0)
      parts.push(jamb)
    }
  }
  return mergeKit(parts)
}

function addRoof(group: THREE.Group, width: number, depth: number, y: number, lod: 0 | 1 | 2, tile: 'ngoi_thanh_luu_ly' | 'ngoi_hoang_luu_ly', tiers = 1): void {
  const roof = buildRoof({
    width,
    depth,
    tiers,
    tileMaterial: tile,
    ridge: lod < 2 ? 'long-chau-nhat' : 'none',
    lod,
  })
  roof.position.y = y
  group.add(roof)
}

function buildVom(w: number, h: number, lod: 0 | 1 | 2): THREE.Group {
  const group = new THREE.Group()
  const thick = lod === 2 ? 3.4 : 4.2
  // [xác thực — Hội Điển] vòm 3.825 × 5.185; cao cửa ~8.5
  const hw = Math.min(1.91, w * 0.18)
  const hh = Math.min(h * 0.76, 6.2)
  const openings: Opening[] = [{ x: 0, hw, hh }]

  const voi = getMaterial('tuong_voi', lod)
  const stone = getMaterial('da_thanh', lod)

  if (lod === 2) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, thick), voi)
    body.position.y = h / 2
    group.add(body)
    addRoof(group, w * 1.08, thick + 1.4, h, lod, 'ngoi_thanh_luu_ly')
    return group
  }

  const body = new THREE.Mesh(archBodyGeo(w, h, thick, openings, lod), voi)
  body.castShadow = true
  body.receiveShadow = true
  group.add(body)

  const plinth = new THREE.Mesh(
    archBodyGeo(w + 0.55, 0.42, thick + 0.5, openings, lod, uvRepeat('daThanh')),
    stone,
  )
  plinth.castShadow = true
  group.add(plinth)

  const rings = meshOf(archRings(openings, thick, lod), stone, 'arch-rings')
  if (rings) group.add(rings)

  if (lod === 0) {
    const band = hoiVanBandGeo(Math.min(w * 0.55, 6), 0.28, 0.04, 0)
    if (band) {
      const m = new THREE.Mesh(band, getMaterial('vang_thep', lod))
      m.position.set(0, h - 0.55, thick / 2 + 0.02)
      group.add(m)
    }
  }

  addRoof(group, w * 1.08, thick + 1.6, h, lod, 'ngoi_thanh_luu_ly', lod === 0 ? 2 : 1)
  return group
}

function buildTamQuan(w: number, h: number, lod: 0 | 1 | 2): THREE.Group {
  const group = new THREE.Group()
  const thick = lod === 2 ? 3.0 : 3.6
  const voi = getMaterial('tuong_voi', lod)
  const stone = getMaterial('da_thanh', lod)

  const span = w * 0.3
  const openings: Opening[] = [
    { x: -span, hw: Math.min(1.55, w * 0.09), hh: h * 0.68 },
    { x: 0, hw: Math.min(1.91, w * 0.11), hh: h * 0.76 },
    { x: span, hw: Math.min(1.55, w * 0.09), hh: h * 0.68 },
  ]

  if (lod === 2) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, thick), voi)
    body.position.y = h / 2
    group.add(body)
    addRoof(group, w * 1.1, thick + 1.6, h, lod, 'ngoi_thanh_luu_ly')
    return group
  }

  const body = new THREE.Mesh(archBodyGeo(w, h, thick, openings, lod), voi)
  body.castShadow = true
  body.receiveShadow = true
  group.add(body)

  const plinth = new THREE.Mesh(
    archBodyGeo(w + 0.5, 0.4, thick + 0.45, openings, lod, uvRepeat('daThanh')),
    stone,
  )
  plinth.castShadow = true
  group.add(plinth)

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(w * 1.02, 0.55, thick + 0.35), stone)
  scaleBoxUvToMeters(lintel.geometry, w * 1.02, 0.55, thick + 0.35, uvRepeat('daThanh'))
  lintel.position.y = h + 0.22
  lintel.castShadow = true
  group.add(lintel)

  const rings = meshOf(archRings(openings, thick, lod), stone, 'arch-rings')
  if (rings) group.add(rings)

  addRoof(group, w * 1.12, thick + 1.8, h + 0.55, lod, 'ngoi_thanh_luu_ly', lod === 0 ? 2 : 1)
  return group
}

function buildNgoMonKit(w: number, h: number, lod: 0 | 1 | 2): THREE.Group {
  const group = new THREE.Group()
  const platH = 3.2
  group.add(
    buildPlatform({
      width: w,
      depth: 28,
      steps: 5,
      balustrade: lod < 2,
      height: platH,
      lod,
      centerDragon: lod < 2,
      stepFace: 'south',
    }),
  )

  const thick = 8.5
  const openings: Opening[] = []
  for (let i = -2; i <= 2; i++) {
    openings.push({
      x: i * 8.5,
      hw: i === 0 ? 2.15 : 1.65,
      hh: i === 0 ? 5.4 : 4.8,
    })
  }

  const voi = getMaterial('tuong_voi', lod)
  if (lod === 2) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(w, h, 10), voi)
    wing.position.set(0, platH + h / 2, -4)
    group.add(wing)
  } else {
    const body = new THREE.Mesh(archBodyGeo(w, h, thick, openings, lod), voi)
    body.position.set(0, platH, -4)
    body.castShadow = true
    group.add(body)
    const rings = meshOf(archRings(openings, thick, lod), getMaterial('da_thanh', lod), 'arch-rings')
    if (rings) {
      rings.position.set(0, platH, -4)
      group.add(rings)
    }
  }

  if (lod < 2) {
    const cols = buildColumnGrid({
      rows: 2,
      cols: lod === 0 ? 10 : 6,
      spacing: [5.2, 6],
      height: 6.5,
      radius: 0.32,
      material: 'go_son_son',
      lod,
    })
    cols.position.set(0, platH + h, -4)
    group.add(cols)
  }

  const pavilionRoof = buildRoof({
    width: 36,
    depth: 16,
    tiers: lod === 0 ? 2 : 1,
    tileMaterial: 'ngoi_hoang_luu_ly',
    ridge: lod < 2 ? 'long-chau-nhat' : 'none',
    lod,
  })
  pavilionRoof.position.set(0, platH + h + 6.5, -4)
  group.add(pavilionRoof)

  for (const x of [-18, 18]) {
    const side = buildRoof({
      width: 14,
      depth: 12,
      tiers: 1,
      tileMaterial: 'ngoi_thanh_luu_ly',
      ridge: lod === 0 ? 'phuong' : 'none',
      lod,
    })
    side.position.set(x, platH + h + 5.5, -4)
    group.add(side)
  }

  return group
}

/**
 * Cổng kit v2 — vòm đùn thật, vọng lâu dùng mái v2.
 * stripKitRoof ở cửa Kinh/Hoàng thành vẫn gỡ child `name === 'roof'`.
 */
export function buildGate(opts: GateOpts): THREE.Group {
  const { type, lod = 0, width, height } = opts
  const group =
    type === 'vom'
      ? buildVom(width ?? 12, height ?? 8, lod)
      : type === 'tam-quan'
        ? buildTamQuan(width ?? 22, height ?? 9, lod)
        : buildNgoMonKit(width ?? 58, height ?? 8, lod)
  group.name = `gate:${type}`
  return group
}
