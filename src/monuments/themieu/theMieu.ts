import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'

/**
 * Thế Tổ Miếu (Thế Miếu) — điện thờ các vua Nguyễn.
 * Mái hoàng lưu ly chính + thanh lưu ly hai chái; cột son; nền đá / gạch Bát Tràng.
 * Anchor: buildings.json the-mieu [-95, 1, -90].
 */
function buildTheMieu(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'the-mieu'

  const plaster = getMaterial('tuong_voi', lod)
  const wood = getMaterial('go_lim', lod)
  const son = getMaterial('go_son_son', lod)
  const stone = getMaterial('da_thanh', lod)
  const brick = getMaterial('gach_bat_trang', lod)
  const gold = getMaterial('vang_thep', lod)
  const phap = getMaterial('phap_lam', lod)

  const platform = buildPlatform({
    width: lod === 2 ? 36 : 42,
    depth: lod === 2 ? 22 : 26,
    height: 1.4,
    steps: lod === 2 ? 2 : lod === 1 ? 4 : 6,
    balustrade: lod === 0,
    lod,
  })
  root.add(platform)

  const floorY = 1.4
  const W = lod === 2 ? 28 : 34
  const D = lod === 2 ? 16 : 18
  const wallH = lod === 2 ? 5.2 : 5.8

  // Floor paving
  const floor = new THREE.Mesh(new THREE.BoxGeometry(W - 0.6, 0.12, D - 0.6), brick)
  floor.position.y = floorY + 0.06
  floor.receiveShadow = true
  root.add(floor)

  if (lod === 2) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(W, wallH, D), plaster)
    mass.position.y = floorY + wallH / 2
    mass.castShadow = true
    root.add(mass)

    const roof = buildRoof({
      width: W * 1.12,
      depth: D * 1.15,
      tiers: 2,
      tileMaterial: 'ngoi_hoang_luu_ly',
      lod,
    })
    roof.position.y = floorY + wallH
    root.add(roof)
    return root
  }

  // Rear + side walls (open front toward +Z / courtyard)
  const wallT = 0.5
  const rear = new THREE.Mesh(new THREE.BoxGeometry(W, wallH, wallT), plaster)
  rear.position.set(0, floorY + wallH / 2, -D / 2 + wallT / 2)
  rear.castShadow = true
  root.add(rear)

  for (const x of [-W / 2 + wallT / 2, W / 2 - wallT / 2]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, D), plaster)
    side.position.set(x, floorY + wallH / 2, 0)
    side.castShadow = true
    root.add(side)
  }

  // Front breast walls with central door
  const breast = new THREE.Mesh(new THREE.BoxGeometry(W * 0.32, wallH * 0.48, wallT), plaster)
  for (const x of [-W * 0.3, W * 0.3]) {
    const b = breast.clone()
    b.position.set(x, floorY + wallH * 0.24, D / 2 - wallT / 2)
    root.add(b)
  }

  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(3.4, wallH * 0.82, 0.32), son)
  doorFrame.position.set(0, floorY + wallH * 0.41, D / 2 - 0.22)
  root.add(doorFrame)
  const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(2.9, wallH * 0.74, 0.14), wood)
  doorLeaf.position.set(0, floorY + wallH * 0.38, D / 2 - 0.1)
  root.add(doorLeaf)

  // Biển ngạch pháp lam (LOD0)
  if (lod === 0) {
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.7, 0.12), phap)
    plaque.position.set(0, floorY + wallH * 0.88, D / 2 - 0.05)
    root.add(plaque)
    const plaqueRim = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.9, 0.08), gold)
    plaqueRim.position.set(0, floorY + wallH * 0.88, D / 2 - 0.12)
    root.add(plaqueRim)
  }

  // Column grid — 3 rows × 7/5 cols (điện thờ gian rộng)
  const cols = buildColumnGrid({
    rows: 3,
    cols: lod === 0 ? 7 : 5,
    spacing: lod === 0 ? ([4.6, 5.2] as [number, number]) : ([5.8, 5.5] as [number, number]),
    height: wallH - 0.25,
    radius: 0.3,
    material: 'go_son_son',
    lod,
  })
  cols.position.y = floorY
  root.add(cols)

  // Entablature / beam plate
  const beamY = floorY + wallH
  const beam = new THREE.Mesh(new THREE.BoxGeometry(W + 0.8, 0.32, D + 0.8), wood)
  beam.position.y = beamY
  beam.receiveShadow = true
  root.add(beam)

  // Corner brackets (chồng rường stylized) — LOD0
  if (lod === 0) {
    for (const x of [-W * 0.38, W * 0.38]) {
      for (const z of [-D * 0.35, D * 0.35]) {
        const br = buildBracketSet({
          width: 2.0,
          depth: 1.2,
          height: 0.95,
          layers: 3,
          lod,
        })
        br.position.set(x, beamY - 0.05, z)
        root.add(br)
      }
    }
  }

  // Main roof — hoàng lưu ly (trùng thiềm)
  const mainRoof = buildRoof({
    width: W * 1.05,
    depth: D * 1.08,
    tiers: lod === 0 ? 2 : 1,
    tileMaterial: 'ngoi_hoang_luu_ly',
    ridgeOrnament: lod === 0 ? 'dragon' : 'none',
    curvature: 0.92,
    lod,
  })
  mainRoof.position.y = beamY + 0.15
  root.add(mainRoof)

  // Side chái — thanh lưu ly (LOD0 / LOD1)
  if (lod < 2) {
    for (const x of [-W * 0.58, W * 0.58]) {
      const wing = buildRoof({
        width: W * 0.28,
        depth: D * 0.85,
        tiers: 1,
        tileMaterial: 'ngoi_thanh_luu_ly',
        ridgeOrnament: 'none',
        curvature: 0.8,
        lod,
      })
      wing.position.set(x, beamY + 0.05, 0)
      root.add(wing)
    }
  }

  // Lower wrap roof (trùng thiềm) — LOD0
  if (lod === 0) {
    const wrap = buildRoof({
      width: W * 1.18,
      depth: D * 1.2,
      tiers: 1,
      tileMaterial: 'ngoi_hoang_luu_ly',
      ridgeOrnament: 'none',
      curvature: 0.78,
      lod,
    })
    wrap.position.y = beamY - 0.2
    root.add(wrap)

    // Thái cực / bầu pháp lam trên nóc
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 10), phap)
    bulb.position.y = beamY + 4.6
    root.add(bulb)
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), gold)
    finial.position.y = beamY + 5.05
    root.add(finial)
  }

  // Side stone bases for visual mass
  if (lod === 0) {
    for (const x of [-W * 0.52, W * 0.52]) {
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, D * 0.7), stone)
      plinth.position.set(x, floorY + 0.28, 0)
      root.add(plinth)
    }
  }

  return root
}

export const theMieu: MonumentModule = {
  id: 'the-mieu',
  displayName: { vi: 'Thế Miếu', en: 'The Mieu Temple' },
  build: buildTheMieu,
  anchor: [-95, 1, -90],
  rotationY: 0,
  boundingRadius: 50,
  poi: {
    vi: 'Thế Tổ Miếu (Thế Miếu) — điện thờ các vua Nguyễn; mái hoàng/thanh lưu ly, cột son. Xây 1821, khu Tây-Nam Hoàng thành.',
    en: 'The Mieu Temple — ancestral shrine of the Nguyễn emperors; yellow/green glazed roofs, vermillion columns. Built 1821, SW Imperial City.',
    year: '1821',
  },
}
