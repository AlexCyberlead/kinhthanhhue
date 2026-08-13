import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { scaleBoxUvToMeters, uvRepeat } from '../../core/geometry/kit/uvMeters'
import { boxAt, mergeOrNull, meshFrom } from './geoUtils'

/**
 * Sân Đại Triều Nghi — lát gạch Bát Tràng UV mét + vạch phẩm + thần đạo.
 * Nâng y +0.06 so với nền groundwork để tránh z-fight.
 */
export const COURT_Y = 0.06
export const COURT_W = 72
export const COURT_D = 56

function slab(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  factory: 'gachBatTrang' | 'gachVo' | 'daThanh',
): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d)
  scaleBoxUvToMeters(g, w, h, d, uvRepeat(factory))
  g.translate(x, y, z)
  return g
}

export function buildCourtyard(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'courtyard-pavement'

  const brick = getMaterial('gach_bat_trang', lod)
  const accent = getMaterial('gach_vo', lod)
  const stone = getMaterial('da_thanh', lod)

  const slabH = 0.08
  const y = COURT_Y + slabH / 2

  if (lod === 2) {
    const field = meshFrom(slab(COURT_W * 0.94, slabH, COURT_D * 0.94, 0, y, 0, 'gachBatTrang'), brick, 'court-field')
    if (field) root.add(field)
    return root
  }

  // Một tấm sân UV mét — không 200 hộp viên
  const field = meshFrom(
    slab(COURT_W, slabH, COURT_D, 0, y, 0, 'gachBatTrang'),
    brick,
    'court-brick-field',
  )
  if (field) {
    field.receiveShadow = true
    root.add(field)
  }

  // Thần đạo giữa + huy chương
  const pathGeos: THREE.BufferGeometry[] = [
    slab(9.4, slabH * 1.08, COURT_D - 3.2, 0, y + 0.012, 0, 'gachVo'),
  ]
  if (lod === 0) {
    for (const z of [-18, -8, 8, 18]) {
      pathGeos.push(boxAt(3.1, slabH * 1.12, 3.1, 0, y + 0.02, z, Math.PI / 4))
    }
  }
  const path = meshFrom(mergeOrNull(pathGeos), accent, 'court-imperial-path')
  if (path) root.add(path)

  // Vạch hàng quan — 9 bậc mỗi bên, song song phẩm sơn
  const lineGeos: THREE.BufferGeometry[] = []
  const ranks = lod === 0 ? 9 : 7
  const z0 = -((ranks - 1) * 3.6) / 2 - 2
  for (let i = 0; i < ranks; i++) {
    const z = z0 + i * 3.6
    lineGeos.push(slab(18, 0.03, 0.18, 15, COURT_Y + slabH + 0.02, z, 'daThanh'))
    lineGeos.push(slab(18, 0.03, 0.18, -15, COURT_Y + slabH + 0.02, z, 'daThanh'))
  }
  const lines = meshFrom(mergeOrNull(lineGeos), stone, 'court-rank-lines')
  if (lines) root.add(lines)

  // Bó vỉa đá
  const curbH = 0.22
  const curbW = 0.55
  const halfW = COURT_W / 2
  const halfD = COURT_D / 2
  const cy = COURT_Y + curbH / 2
  const curbGeos: THREE.BufferGeometry[] = [
    slab(COURT_W + curbW, curbH, curbW, 0, cy, halfD, 'daThanh'),
    slab(COURT_W + curbW, curbH, curbW, 0, cy, -halfD, 'daThanh'),
    slab(curbW, curbH, COURT_D, halfW, cy, 0, 'daThanh'),
    slab(curbW, curbH, COURT_D, -halfW, cy, 0, 'daThanh'),
  ]
  for (const sx of [-1, 1] as const) {
    for (const sz of [-1, 1] as const) {
      curbGeos.push(slab(0.7, 0.55, 0.7, sx * halfW, COURT_Y + 0.28, sz * halfD, 'daThanh'))
    }
  }
  const curb = meshFrom(mergeOrNull(curbGeos), stone, 'court-curb', true, true)
  if (curb) root.add(curb)

  // Bậc Bắc lên Thái Hòa
  const stepCount = lod === 0 ? 5 : 3
  const stepGeo = new THREE.BoxGeometry(24, 0.18, 0.7)
  scaleBoxUvToMeters(stepGeo, 24, 0.18, 0.7, uvRepeat('daThanh'))
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

  if (lod < 2) {
    const plinthGeos: THREE.BufferGeometry[] = [
      slab(2.8, 0.2, 40, 24, COURT_Y + 0.1, -2, 'daThanh'),
      slab(2.8, 0.2, 40, -24, COURT_Y + 0.1, -2, 'daThanh'),
    ]
    const plinth = meshFrom(mergeOrNull(plinthGeos), stone, 'court-rank-plinths', false, true)
    if (plinth) root.add(plinth)
  }

  return root
}
