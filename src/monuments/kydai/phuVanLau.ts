import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'

/**
 * Phu Văn Lâu — symmetrical pavilion south of Kỳ Đài / toward Hương River.
 * Ngói thanh lưu ly, hai tầng stylized, đối xứng trục thần đạo.
 * Anchor: buildings.json phu-van-lau [0, 1, 1550].
 */
function buildPhuVanLau(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'phu-van-lau'

  const plaster = getMaterial('tuong_voi', lod)
  const wood = getMaterial('go_lim', lod)
  const son = getMaterial('go_son_son', lod)
  const stone = getMaterial('da_thanh', lod)

  const platform = buildPlatform({
    width: lod === 2 ? 18 : 22,
    depth: lod === 2 ? 14 : 16,
    height: 1.35,
    steps: lod === 2 ? 2 : lod === 1 ? 3 : 5,
    balustrade: lod === 0,
    lod,
  })
  root.add(platform)

  const floorY = 1.35
  const W = lod === 2 ? 14 : 16
  const D = lod === 2 ? 10 : 12
  const wallH = lod === 2 ? 4.2 : 4.8

  // Ground-floor enclosure — open south / north galleries via thinner walls
  if (lod === 2) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(W, wallH, D), plaster)
    mass.position.y = floorY + wallH / 2
    root.add(mass)
  } else {
    // Symmetrical side walls + rear wall (open front toward river / +Z)
    const wallT = 0.45
    const sideGeo = new THREE.BoxGeometry(wallT, wallH, D)
    for (const x of [-W / 2 + wallT / 2, W / 2 - wallT / 2]) {
      const side = new THREE.Mesh(sideGeo, plaster)
      side.position.set(x, floorY + wallH / 2, 0)
      side.castShadow = true
      side.receiveShadow = true
      root.add(side)
    }
    const rear = new THREE.Mesh(new THREE.BoxGeometry(W, wallH, wallT), plaster)
    rear.position.set(0, floorY + wallH / 2, -D / 2 + wallT / 2)
    rear.castShadow = true
    root.add(rear)

    // Front half-height breast wall (symmetrical openings left/right of axis)
    const breast = new THREE.Mesh(new THREE.BoxGeometry(W * 0.28, wallH * 0.42, wallT), plaster)
    for (const x of [-W * 0.32, W * 0.32]) {
      const b = breast.clone()
      b.position.set(x, floorY + wallH * 0.21, D / 2 - wallT / 2)
      root.add(b)
    }

    // Central door frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.6, wallH * 0.78, 0.28), son)
    frame.position.set(0, floorY + wallH * 0.39, D / 2 - 0.2)
    root.add(frame)
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(2.2, wallH * 0.7, 0.12), wood)
    leaf.position.set(0, floorY + wallH * 0.36, D / 2 - 0.08)
    root.add(leaf)
  }

  // Column grid — symmetrical 3×3 / 3×2
  if (lod < 2) {
    const cols = buildColumnGrid({
      rows: 3,
      cols: lod === 0 ? 5 : 3,
      spacing: lod === 0 ? ([3.2, 4.2] as [number, number]) : ([4.5, 4.5] as [number, number]),
      height: wallH - 0.2,
      radius: 0.26,
      material: 'go_son_son',
      lod,
    })
    cols.position.y = floorY
    root.add(cols)
  }

  // Mid floor / upper storey slab
  const midY = floorY + wallH
  if (lod < 2) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.28, D + 0.6), stone)
    slab.position.y = midY
    slab.receiveShadow = true
    root.add(slab)

    // Upper short walls (lantern storey)
    const upperH = lod === 0 ? 3.2 : 2.6
    const upper = new THREE.Mesh(new THREE.BoxGeometry(W * 0.72, upperH, D * 0.72), plaster)
    upper.position.y = midY + upperH / 2
    upper.castShadow = true
    root.add(upper)

    if (lod === 0) {
      // Window insets — instanced (1 draw call)
      const winMat = getMaterial('go_lim', lod)
      const wins = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 1.5, 0.2), winMat, 6)
      const dummy = new THREE.Object3D()
      let wi = 0
      for (const z of [D * 0.36, -D * 0.36]) {
        for (const x of [-W * 0.2, 0, W * 0.2]) {
          dummy.position.set(x, midY + upperH * 0.55, z)
          dummy.updateMatrix()
          wins.setMatrixAt(wi++, dummy.matrix)
        }
      }
      wins.instanceMatrix.needsUpdate = true
      root.add(wins)

      // Brackets under eaves — corners only (4)
      for (const x of [-W * 0.28, W * 0.28]) {
        for (const z of [-D * 0.28, D * 0.28]) {
          const br = buildBracketSet({
            width: 1.6,
            depth: 1.0,
            height: 0.85,
            layers: 3,
            lod,
          })
          br.position.set(x, midY + upperH - 0.1, z)
          root.add(br)
        }
      }
    }

    const roof = buildRoof({
      width: W * 0.95,
      depth: D * 0.95,
      tiers: lod === 0 ? 2 : 1,
      tileMaterial: 'ngoi_thanh_luu_ly',
      ridgeOrnament: lod === 0 ? 'dragon' : 'none',
      curvature: 0.9,
      lod,
    })
    roof.position.y = midY + (lod === 0 ? 3.2 : 2.6)
    root.add(roof)

    // Lower wrap roof (trùng thiềm) — LOD0 only to keep LOD1 draw calls ≤ 20
    if (lod === 0) {
      const lowerRoof = buildRoof({
        width: W * 1.15,
        depth: D * 1.15,
        tiers: 1,
        tileMaterial: 'ngoi_thanh_luu_ly',
        ridgeOrnament: 'none',
        curvature: 0.75,
        lod,
      })
      lowerRoof.position.y = midY - 0.15
      root.add(lowerRoof)
    }
  } else {
    const roof = buildRoof({
      width: W * 1.1,
      depth: D * 1.1,
      tiers: 1,
      tileMaterial: 'ngoi_thanh_luu_ly',
      lod,
    })
    roof.position.y = floorY + wallH
    root.add(roof)
  }

  // Side wing tips — subtle symmetry markers (LOD0)
  if (lod === 0) {
    const gold = getMaterial('vang_thep', lod)
    for (const x of [-W * 0.55, W * 0.55]) {
      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), gold)
      finial.position.set(x, midY + 0.5, 0)
      root.add(finial)
    }
  }

  return root
}

export const phuVanLau: MonumentModule = {
  id: 'phu-van-lau',
  displayName: { vi: 'Phu Văn Lâu', en: 'Phu Van Lau Pavilion' },
  build: buildPhuVanLau,
  anchor: [0, 1, 1550],
  rotationY: 0,
  boundingRadius: 25,
  poi: {
    vi: 'Phu Văn Lâu — lầu đối xứng phía Nam Kỳ Đài / gần sông Hương, mái ngói thanh lưu ly. Nơi treo chiếu chỉ / văn bản quan phương thời Nguyễn.',
    en: 'Phu Van Lau — symmetrical pavilion south of the Flag Tower near the Hương River, green glazed-tile roofs. Imperial proclamations were posted here.',
    year: '1819',
  },
}
