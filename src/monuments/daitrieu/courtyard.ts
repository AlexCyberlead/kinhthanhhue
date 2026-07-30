import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { boxAt, mergeOrNull, meshFrom } from './geoUtils'

/**
 * Sân Đại Triều Nghi — lát gạch chi tiết quanh gốc (0,0,0).
 * Nâng y +0.06 so với nền groundwork để tránh z-fight với thần đạo pavement.
 */
export const COURT_Y = 0.06
export const COURT_W = 68
export const COURT_D = 54

export function buildCourtyard(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'courtyard-pavement'

  const brick = getMaterial('gach_bat_trang', lod)
  const accent = getMaterial('gach_vo', lod)
  const stone = getMaterial('da_thanh', lod)

  const slabH = 0.08
  const y = COURT_Y + slabH / 2

  if (lod === 2) {
    const field = meshFrom(
      boxAt(COURT_W * 0.92, slabH, COURT_D * 0.92, 0, y, 0),
      brick,
      'court-field',
    )
    if (field) root.add(field)
    return root
  }

  // Main field — merged tile strips (draw-call friendly)
  const brickGeos: THREE.BufferGeometry[] = []
  const tileW = lod === 0 ? 3.4 : 5.5
  const tileD = lod === 0 ? 3.4 : 5.5
  const cols = Math.floor(COURT_W / tileW)
  const rows = Math.floor(COURT_D / tileD)
  const gap = 0.06
  const ox = -((cols - 1) * tileW) / 2
  const oz = -((rows - 1) * tileD) / 2

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Leave a soft cross for thần đạo (central strip is slightly lower accent elsewhere)
      const x = ox + c * tileW
      const z = oz + r * tileD
      const onAxis = Math.abs(x) < 4.2 && Math.abs(z) < COURT_D * 0.48
      if (onAxis) continue
      brickGeos.push(
        boxAt(tileW - gap, slabH, tileD - gap, x, y, z),
      )
    }
  }

  // Outer apron ring (fills edges where tiles skipped)
  brickGeos.push(boxAt(COURT_W, slabH * 0.85, 2.2, 0, y - 0.01, COURT_D / 2 - 1.1))
  brickGeos.push(boxAt(COURT_W, slabH * 0.85, 2.2, 0, y - 0.01, -COURT_D / 2 + 1.1))
  brickGeos.push(boxAt(2.2, slabH * 0.85, COURT_D - 4, COURT_W / 2 - 1.1, y - 0.01, 0))
  brickGeos.push(boxAt(2.2, slabH * 0.85, COURT_D - 4, -COURT_W / 2 + 1.1, y - 0.01, 0))

  const field = meshFrom(mergeOrNull(brickGeos), brick, 'court-brick-field')
  if (field) root.add(field)

  // Central imperial path (accent brick) — over thần đạo
  const pathGeos: THREE.BufferGeometry[] = [
    boxAt(9.2, slabH * 1.05, COURT_D - 4, 0, y + 0.01, 0),
  ]
  if (lod === 0) {
    // Diamond medallions along axis
    for (const z of [-16, -6, 6, 16]) {
      pathGeos.push(boxAt(3.2, slabH * 1.1, 3.2, 0, y + 0.02, z, Math.PI / 4))
    }
  }
  const path = meshFrom(mergeOrNull(pathGeos), accent, 'court-imperial-path')
  if (path) root.add(path)

  // Stone curb / border
  const curbH = 0.22
  const curbW = 0.55
  const halfW = COURT_W / 2
  const halfD = COURT_D / 2
  const cy = COURT_Y + curbH / 2
  const curbGeos: THREE.BufferGeometry[] = [
    boxAt(COURT_W + curbW, curbH, curbW, 0, cy, halfD),
    boxAt(COURT_W + curbW, curbH, curbW, 0, cy, -halfD),
    boxAt(curbW, curbH, COURT_D, halfW, cy, 0),
    boxAt(curbW, curbH, COURT_D, -halfW, cy, 0),
  ]
  // Corner posts
  for (const sx of [-1, 1] as const) {
    for (const sz of [-1, 1] as const) {
      curbGeos.push(boxAt(0.7, 0.55, 0.7, sx * halfW, COURT_Y + 0.28, sz * halfD))
    }
  }
  const curb = meshFrom(mergeOrNull(curbGeos), stone, 'court-curb', true, true)
  if (curb) root.add(curb)

  // North steps toward Điện Thái Hòa (z negative)
  const stepCount = lod === 0 ? 5 : 3
  const stepGeo = new THREE.BoxGeometry(22, 0.18, 0.7)
  const steps = new THREE.InstancedMesh(stepGeo, stone, stepCount)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < stepCount; i++) {
    dummy.position.set(0, COURT_Y + 0.09 + i * 0.16, -halfD - 0.4 - i * 0.55)
    dummy.updateMatrix()
    steps.setMatrixAt(i, dummy.matrix)
  }
  steps.instanceMatrix.needsUpdate = true
  steps.name = 'court-north-steps'
  steps.castShadow = lod === 0
  steps.receiveShadow = true
  root.add(steps)

  // Side rank platforms (low stone plinths under phẩm sơn rows)
  if (lod < 2) {
    const plinthGeos: THREE.BufferGeometry[] = [
      boxAt(2.8, 0.2, 38, 24, COURT_Y + 0.1, -2),
      boxAt(2.8, 0.2, 38, -24, COURT_Y + 0.1, -2),
    ]
    const plinth = meshFrom(mergeOrNull(plinthGeos), stone, 'court-rank-plinths', false, true)
    if (plinth) root.add(plinth)
  }

  return root
}
