import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'

/**
 * Shared builder — Tả Vu / Hữu Vu (nhà vu chờ triều).
 * Ngói thanh lưu ly (công trình quan / hai bên trục).
 */
export function buildWingHall(opts: {
  name: string
  lod: 0 | 1 | 2
}): THREE.Group {
  const { name, lod } = opts
  const root = new THREE.Group()
  root.name = name

  const plaster = getMaterial('tuong_voi', lod)
  const wood = getMaterial('go_lim', lod)
  const son = getMaterial('go_son_son', lod)

  const platH = 1.05
  const W = lod === 2 ? 16 : 20
  const D = lod === 2 ? 10 : 12
  const wallH = lod === 2 ? 3.8 : 4.6

  const platform = buildPlatform({
    width: W + 2,
    depth: D + 2,
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
    const t = 0.4
    // Long side walls (E/W) + rear; open gallery toward courtyard (±X handled by caller rotation)
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

    // Front breast walls flanking central opening
    const breastH = wallH * 0.4
    const breastW = W * 0.32
    for (const x of [-W * 0.3, W * 0.3]) {
      const breast = new THREE.Mesh(new THREE.BoxGeometry(breastW, breastH, t), plaster)
      breast.position.set(x, floorY + breastH / 2, D / 2 - t / 2)
      root.add(breast)
    }

    // Door frame + leaf
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, wallH * 0.72, 0.26), son)
    frame.position.set(0, floorY + wallH * 0.36, D / 2 - 0.18)
    root.add(frame)
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(2.0, wallH * 0.64, 0.1), wood)
    leaf.position.set(0, floorY + wallH * 0.33, D / 2 - 0.06)
    root.add(leaf)

    const cols = buildColumnGrid({
      rows: lod === 0 ? 3 : 2,
      cols: lod === 0 ? 5 : 3,
      spacing:
        lod === 0
          ? ([3.6, 4.0] as [number, number])
          : ([5.0, 5.0] as [number, number]),
      height: wallH - 0.15,
      radius: 0.22,
      material: 'go_son_son',
      lod,
    })
    cols.position.y = floorY
    root.add(cols)
  }

  const beamY = floorY + wallH
  if (lod < 2) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(W + 0.5, 0.22, D + 0.5), wood)
    plate.position.y = beamY
    plate.receiveShadow = true
    root.add(plate)
  }

  if (lod === 0) {
    for (const x of [-W / 2 + 1.2, W / 2 - 1.2]) {
      for (const z of [-D / 2 + 1.0, D / 2 - 1.0]) {
        const br = buildBracketSet({ width: 1.2, depth: 0.9, height: 0.65, layers: 2, lod })
        br.position.set(x, beamY - 0.05, z)
        root.add(br)
      }
    }
  }

  const roof = buildRoof({
    width: lod === 2 ? W + 1.5 : W + 2.5,
    depth: lod === 2 ? D + 1.5 : D + 2.2,
    tiers: lod === 0 ? 2 : 1,
    tileMaterial: 'ngoi_thanh_luu_ly',
    ridgeOrnament: lod === 0 ? 'phoenix' : 'none',
    curvature: 0.85,
    lod,
  })
  roof.position.y = beamY + (lod === 2 ? 0 : 0.12)
  root.add(roof)

  root.userData.mode = 'restored'
  return root
}
