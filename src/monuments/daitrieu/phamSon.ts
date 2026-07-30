import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { COURT_Y } from './courtyard'

/**
 * Phẩm sơn — cột/bia đá ghi phẩm hàm hai bên sân Đại Triều Nghi.
 * Văn quan (+X Đông), võ quan (−X Tây); mỗi bên 9 bậc (nhất → cửu phẩm).
 * InstancedMesh — 2 draw calls (thân + mũ/bia).
 */
export const PHAM_SON_RANKS = 9
/** Half-spacing along Z between markers. */
export const PHAM_SON_SPACING = 3.6
export const PHAM_SON_X = 24

export function buildPhamSon(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'pham-son'

  const stone = getMaterial('da_thanh', lod)
  const plaque = getMaterial(lod === 2 ? 'da_thanh' : 'tuong_voi', lod)

  const perSide = lod === 2 ? 5 : PHAM_SON_RANKS
  const total = perSide * 2

  // Stele: tapered box ≈ pedestal + upright
  const bodyH = lod === 2 ? 1.1 : 1.55
  const bodyGeo = new THREE.BoxGeometry(0.55, bodyH, 0.28)
  const bodies = new THREE.InstancedMesh(bodyGeo, stone, total)
  bodies.name = 'pham-son-bodies'
  bodies.castShadow = lod === 0
  bodies.receiveShadow = true

  // Cap / inscribed face
  const capGeo =
    lod === 2
      ? new THREE.BoxGeometry(0.62, 0.18, 0.32)
      : new THREE.BoxGeometry(0.48, 0.72, 0.12)
  const caps = new THREE.InstancedMesh(capGeo, plaque, total)
  caps.name = 'pham-son-plaques'
  caps.castShadow = lod === 0

  const dummy = new THREE.Object3D()
  let idx = 0
  const z0 = -((perSide - 1) * PHAM_SON_SPACING) / 2 - 2

  for (const side of [-1, 1] as const) {
    for (let i = 0; i < perSide; i++) {
      // Rank 1 (nhất phẩm) nearer Điện Thái Hòa (north / −Z)
      const rankT = i / Math.max(1, perSide - 1)
      const hScale = 1.15 - rankT * 0.35
      const z = z0 + i * PHAM_SON_SPACING
      const x = side * PHAM_SON_X
      const yBase = COURT_Y + 0.2

      dummy.position.set(x, yBase + (bodyH * hScale) / 2, z)
      dummy.scale.set(1, hScale, 1)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      bodies.setMatrixAt(idx, dummy.matrix)

      if (lod === 2) {
        dummy.position.set(x, yBase + bodyH * hScale + 0.08, z)
        dummy.scale.set(1, 1, 1)
      } else {
        // Plaque on inner face (toward thần đạo)
        dummy.position.set(x - side * 0.16, yBase + bodyH * hScale * 0.62, z)
        dummy.scale.set(1, hScale * 0.9, 1)
      }
      dummy.updateMatrix()
      caps.setMatrixAt(idx, dummy.matrix)
      idx++
    }
  }

  bodies.instanceMatrix.needsUpdate = true
  caps.instanceMatrix.needsUpdate = true
  root.add(bodies)
  root.add(caps)

  // Small footing blocks — merge into one InstancedMesh only on LOD0
  if (lod === 0) {
    const footGeo = new THREE.BoxGeometry(0.9, 0.22, 0.55)
    const feet = new THREE.InstancedMesh(footGeo, stone, total)
    feet.name = 'pham-son-feet'
    feet.castShadow = true
    feet.receiveShadow = true
    idx = 0
    for (const side of [-1, 1] as const) {
      for (let i = 0; i < perSide; i++) {
        const z = z0 + i * PHAM_SON_SPACING
        dummy.position.set(side * PHAM_SON_X, COURT_Y + 0.31, z)
        dummy.scale.set(1, 1, 1)
        dummy.updateMatrix()
        feet.setMatrixAt(idx++, dummy.matrix)
      }
    }
    feet.instanceMatrix.needsUpdate = true
    root.add(feet)
  }

  return root
}
