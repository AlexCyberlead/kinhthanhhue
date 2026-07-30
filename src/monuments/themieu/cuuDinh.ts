import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildUrnGeometry, buildUrnPedestalGeometry } from './geometry'

/**
 * Cửu Đỉnh — chín đỉnh đồng (dong_thau) trước Thế Miếu.
 * Stylized khối lượng ~1.9–2.6 tấn qua scale; chạm nổi đơn giản trên geometry.
 * Ngân sách: ≤ 3 draw calls — InstancedMesh urns ×9 + pedestals ×9 (+ optional pad).
 * Anchor: buildings.json cuu-dinh [-95, 0, -115].
 */

/** Relative scales approximating nine different cast weights. */
const URN_SCALES = [1.0, 1.05, 0.95, 1.12, 0.98, 1.08, 1.02, 0.92, 1.15]

function buildCuuDinh(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'cuu-dinh'

  const bronze = getMaterial('dong_thau', lod)
  const stone = getMaterial('da_thanh', lod)

  // Shared courtyard pad — 1 draw call
  const padW = lod === 2 ? 22 : 28
  const padD = lod === 2 ? 8 : 10
  const pad = new THREE.Mesh(new THREE.BoxGeometry(padW, 0.18, padD), stone)
  pad.position.y = 0.09
  pad.receiveShadow = true
  pad.name = 'cuuDinhPad'
  root.add(pad)

  // 3×3 layout facing Thế Miếu (north of pad / −Z toward temple cluster)
  const cols = 3
  const rows = 3
  const spacingX = lod === 2 ? 5.5 : 7.0
  const spacingZ = lod === 2 ? 3.2 : 4.0
  const originX = -((cols - 1) * spacingX) / 2
  const originZ = -((rows - 1) * spacingZ) / 2

  const urnGeo = buildUrnGeometry(lod)
  const urns = new THREE.InstancedMesh(urnGeo, bronze, 9)
  urns.castShadow = lod < 2
  urns.receiveShadow = true
  urns.name = 'cuuDinhUrns'

  const pedGeo = buildUrnPedestalGeometry()
  const peds = new THREE.InstancedMesh(pedGeo, stone, 9)
  peds.castShadow = lod < 2
  peds.receiveShadow = true
  peds.name = 'cuuDinhPedestals'

  const dummy = new THREE.Object3D()
  let i = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = originX + c * spacingX
      const z = originZ + r * spacingZ
      const s = URN_SCALES[i] * (lod === 2 ? 0.85 : 1)

      // Pedestal
      dummy.position.set(x, 0.18, z)
      dummy.scale.set(1, 1, 1)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      peds.setMatrixAt(i, dummy.matrix)

      // Urn on pedestal — height ~2.0 m base × scale (stylized tonnage)
      dummy.position.set(x, 0.18 + 0.35, z)
      dummy.scale.set(s, s, s)
      dummy.rotation.y = (i % 3) * 0.15 // slight orientation variety
      dummy.updateMatrix()
      urns.setMatrixAt(i, dummy.matrix)
      i++
    }
  }
  urns.instanceMatrix.needsUpdate = true
  peds.instanceMatrix.needsUpdate = true

  root.add(peds, urns)
  // Total draw calls: pad + peds + urns = 3

  return root
}

export const cuuDinh: MonumentModule = {
  id: 'cuu-dinh',
  displayName: { vi: 'Cửu Đỉnh', en: 'Nine Dynastic Urns' },
  build: buildCuuDinh,
  anchor: [-95, 0, -115],
  rotationY: 0,
  boundingRadius: 35,
  poi: {
    vi: 'Cửu Đỉnh — chín đỉnh đồng hợp kim trước Thế Miếu; tổng ~22 tấn đồng, đúc 1837. Material dong_thau.',
    en: 'Nine Dynastic Urns — nine bronze-alloy ding before The Mieu; ~22 tons of copper alloy, cast 1837.',
    year: '1837',
  },
}
