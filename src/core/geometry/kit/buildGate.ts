import * as THREE from 'three'
import { getMaterial } from '../../materials/MaterialLibrary'
import { buildRoof } from './buildRoof'
import { buildColumnGrid } from './buildColumnGrid'
import { buildPlatform } from './buildPlatform'

export type GateOpts = {
  type: 'vom' | 'tam-quan' | 'ngo-mon'
  lod?: 0 | 1 | 2
  width?: number
  height?: number
}

/**
 * Procedural gate kits: vòm / tam quan / Ngọ Môn stylized base.
 */
export function buildGate(opts: GateOpts): THREE.Group {
  const { type, lod = 0, width, height } = opts
  const group = new THREE.Group()
  group.name = `gate:${type}`
  const voi = getMaterial('tuong_voi', lod)
  const stone = getMaterial('da_thanh', lod)

  if (type === 'vom') {
    const w = width ?? 12
    const h = height ?? 8
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, 4), voi)
    body.position.y = h / 2
    body.castShadow = true
    group.add(body)
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 4.2, 16, 1, false, 0, Math.PI), stone)
    arch.rotation.z = Math.PI / 2
    arch.rotation.y = Math.PI / 2
    arch.position.set(0, 2.4, 0)
    group.add(arch)
    group.add(buildRoof({ width: w * 1.05, depth: 5, tiers: 1, tileMaterial: 'ngoi_thanh_luu_ly', lod }))
    group.children[group.children.length - 1].position.y = h
    return group
  }

  if (type === 'tam-quan') {
    const w = width ?? 22
    const h = height ?? 9
    const pierW = 2.2
    for (const x of [-w * 0.4, 0, w * 0.4]) {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(pierW, h, 3.2), voi)
      pier.position.set(x, h / 2, 0)
      pier.castShadow = true
      group.add(pier)
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, 3.4), stone)
    lintel.position.y = h + 0.4
    group.add(lintel)
    const roof = buildRoof({
      width: w * 1.1,
      depth: 5,
      tiers: lod === 2 ? 1 : 2,
      tileMaterial: 'ngoi_thanh_luu_ly',
      ridgeOrnament: lod === 0 ? 'dragon' : 'none',
      lod,
    })
    roof.position.y = h + 1
    group.add(roof)
    return group
  }

  // ngo-mon stylized U-platform + 5 openings + upper pavilion silhouette
  const w = width ?? 58
  const h = height ?? 8
  const platform = buildPlatform({ width: w, depth: 28, steps: 5, balustrade: lod < 2, height: 3.2, lod })
  group.add(platform)

  const wing = new THREE.Mesh(new THREE.BoxGeometry(w, h, 10), voi)
  wing.position.set(0, 3.2 + h / 2, -4)
  wing.castShadow = true
  group.add(wing)

  // 5 gate openings (negative via darker insets)
  const openingMat = getMaterial('go_lim', lod)
  for (let i = -2; i <= 2; i++) {
    const opening = new THREE.Mesh(new THREE.BoxGeometry(i === 0 ? 4.2 : 3.2, 5.2, 2), openingMat)
    opening.position.set(i * 8.5, 3.2 + 2.6, 1.2)
    group.add(opening)
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
    cols.position.set(0, 3.2 + h, -4)
    group.add(cols)
  }

  const pavilionRoof = buildRoof({
    width: 36,
    depth: 16,
    tiers: lod === 0 ? 2 : 1,
    tileMaterial: 'ngoi_hoang_luu_ly',
    ridgeOrnament: lod === 0 ? 'dragon' : 'none',
    lod,
  })
  pavilionRoof.position.set(0, 3.2 + h + 6.5, -4)
  group.add(pavilionRoof)

  // side roofs thanh lưu ly
  for (const x of [-18, 18]) {
    const side = buildRoof({
      width: 14,
      depth: 12,
      tiers: 1,
      tileMaterial: 'ngoi_thanh_luu_ly',
      lod,
    })
    side.position.set(x, 3.2 + h + 5.5, -4)
    group.add(side)
  }

  return group
}
