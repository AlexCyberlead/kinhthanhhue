import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'

/**
 * Shared builder — Tả Vu nội / Hữu Vu nội (nhà vu trong Tử Cấm, sau Cần Chánh).
 * Nhỏ hơn Tả/Hữu Vu ngoại đình; ngói thanh lưu ly.
 *
 * LOD1 budget (typical): platform(4) + walls(3) + breast(2) + door(2)
 * + cols(1) + plate(1) + roof(3) ≈ 16 DC.
 */
export function buildInnerWingHall(opts: {
  name: string
  lod: 0 | 1 | 2
}): THREE.Group {
  const { name, lod } = opts
  const root = new THREE.Group()
  root.name = name

  const plaster = getMaterial('tuong_voi', lod)
  const wood = getMaterial('go_lim', lod)
  const son = getMaterial('go_son_son', lod)

  const platH = 0.95
  const W = lod === 2 ? 14 : 17
  const D = lod === 2 ? 9 : 11
  const wallH = lod === 2 ? 3.4 : 4.1

  const platform = buildPlatform({
    width: W + 1.8,
    depth: D + 1.8,
    height: platH,
    steps: lod === 2 ? 2 : lod === 1 ? 3 : 4,
    balustrade: lod === 0,
    lod,
  })
  root.add(platform)

  const floorY = platH

  if (lod === 2) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(W, wallH, D), plaster)
    mass.position.y = floorY + wallH / 2
    root.add(mass)
  } else {
    const t = 0.38
    for (const x of [-W / 2 + t / 2, W / 2 - t / 2]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(t, wallH, D), plaster)
      side.position.set(x, floorY + wallH / 2, 0)
      side.castShadow = true
      side.receiveShadow = true
      root.add(side)
    }
    const rear = new THREE.Mesh(new THREE.BoxGeometry(W, wallH, t), plaster)
    rear.position.set(0, floorY + wallH / 2, -D / 2 + t / 2)
    rear.castShadow = true
    root.add(rear)

    const breastH = wallH * 0.38
    const breastW = W * 0.3
    for (const x of [-W * 0.28, W * 0.28]) {
      const breast = new THREE.Mesh(new THREE.BoxGeometry(breastW, breastH, t), plaster)
      breast.position.set(x, floorY + breastH / 2, D / 2 - t / 2)
      root.add(breast)
    }

    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.1, wallH * 0.7, 0.24), son)
    frame.position.set(0, floorY + wallH * 0.35, D / 2 - 0.16)
    root.add(frame)
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.75, wallH * 0.62, 0.1), wood)
    leaf.position.set(0, floorY + wallH * 0.32, D / 2 - 0.05)
    root.add(leaf)

    const cols = buildColumnGrid({
      rows: lod === 0 ? 3 : 2,
      cols: lod === 0 ? 4 : 3,
      spacing:
        lod === 0
          ? ([3.2, 3.6] as [number, number])
          : ([4.5, 4.2] as [number, number]),
      height: wallH - 0.12,
      radius: 0.2,
      material: 'go_son_son',
      lod,
    })
    cols.position.y = floorY
    root.add(cols)
  }

  const beamY = floorY + wallH
  if (lod < 2) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(W + 0.4, 0.2, D + 0.4), wood)
    plate.position.y = beamY
    plate.receiveShadow = true
    root.add(plate)
  }

  if (lod === 0) {
    for (const x of [-W / 2 + 1.0, W / 2 - 1.0]) {
      for (const z of [-D / 2 + 0.9, D / 2 - 0.9]) {
        const br = buildBracketSet({ width: 1.1, depth: 0.8, height: 0.6, layers: 2, lod })
        br.position.set(x, beamY - 0.04, z)
        root.add(br)
      }
    }
  }

  const roof = buildRoof({
    width: lod === 2 ? W + 1.2 : W + 2.2,
    depth: lod === 2 ? D + 1.2 : D + 2.0,
    tiers: lod === 0 ? 2 : 1,
    tileMaterial: 'ngoi_thanh_luu_ly',
    ridgeOrnament: lod === 0 ? 'phoenix' : 'none',
    curvature: 0.82,
    lod,
  })
  roof.position.y = beamY + (lod === 2 ? 0 : 0.1)
  root.add(roof)

  root.userData.mode = 'restored'
  return root
}
