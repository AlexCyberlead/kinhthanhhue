import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { getMaterial, type MaterialId } from '../../materials/MaterialLibrary'
import { copyUvToUv2, scaleBoxUvToMeters, uvRepeat } from './uvMeters'

export type ColumnGridOpts = {
  rows: number
  cols: number
  spacing: number | [number, number]
  height: number
  radius?: number
  material?: MaterialId
  lod?: 0 | 1 | 2
  /** Tảng đá kê. Mặc định bật. */
  plinth?: boolean
  /** Đấu / gối đầu cột. Mặc định bật khi lod < 2. */
  capital?: boolean
}

function placeGrid(
  mesh: THREE.InstancedMesh,
  rows: number,
  cols: number,
  sx: number,
  sz: number,
  y: number,
): void {
  const dummy = new THREE.Object3D()
  const originX = -((cols - 1) * sx) / 2
  const originZ = -((rows - 1) * sz) / 2
  let i = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dummy.position.set(originX + c * sx, y, originZ + r * sz)
      dummy.updateMatrix()
      mesh.setMatrixAt(i++, dummy.matrix)
    }
  }
  mesh.instanceMatrix.needsUpdate = true
}

function shaftGeo(radius: number, height: number, radial: number, tileV: number): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(radius * 0.92, radius, height, radial)
  const uv = geo.getAttribute('uv')
  for (let i = 0; i < uv.count; i++) {
    uv.setY(i, uv.getY(i) * (height / tileV))
  }
  uv.needsUpdate = true
  copyUvToUv2(geo)
  return geo
}

/** Tảng đá kê: đế vuông + trống tròn. [ước lượng hợp lý] ~0.22–0.28 m. */
function plinthGeo(radius: number, lod: 0 | 1 | 2): THREE.BufferGeometry {
  const r = radius
  const segs = lod === 0 ? 12 : 8
  const base = new THREE.BoxGeometry(r * 2.35, 0.11, r * 2.35)
  scaleBoxUvToMeters(base, r * 2.35, 0.11, r * 2.35, uvRepeat('daThanh'))
  base.translate(0, 0.055, 0)
  const drum = new THREE.CylinderGeometry(r * 1.55, r * 1.62, 0.13, segs)
  copyUvToUv2(drum)
  drum.translate(0, 0.165, 0)
  const merged = mergeTwo(base, drum)
  return merged
}

/** Đấu vuông + gối tròn. Sơn cùng cột. [ước lượng hợp lý] */
function capitalGeo(radius: number, lod: 0 | 1): THREE.BufferGeometry {
  const dau = new THREE.BoxGeometry(radius * 2.15, 0.1, radius * 2.15)
  scaleBoxUvToMeters(dau, radius * 2.15, 0.1, radius * 2.15, uvRepeat('sonSon'))
  dau.translate(0, -0.08, 0)
  const goi = new THREE.CylinderGeometry(radius * 1.38, radius * 1.22, 0.07, lod === 0 ? 12 : 8)
  copyUvToUv2(goi)
  goi.translate(0, -0.005, 0)
  return mergeTwo(dau, goi)
}

function goldRingGeo(radius: number): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(radius * 1.06, radius * 1.06, 0.045, 12)
  copyUvToUv2(g)
  return g
}

function mergeTwo(a: THREE.BufferGeometry, b: THREE.BufferGeometry): THREE.BufferGeometry {
  if (!a.getAttribute('normal')) a.computeVertexNormals()
  if (!b.getAttribute('normal')) b.computeVertexNormals()
  const merged = mergeGeometries([a, b], false)
  a.dispose()
  b.dispose()
  if (!merged) return new THREE.BoxGeometry(0.2, 0.1, 0.2)
  copyUvToUv2(merged)
  return merged
}

/**
 * Lưới cột — thân tròn InstancedMesh + tảng đá + đấu/gối + đai thếp LOD0.
 * Gốc group: đáy cột y=0, đỉnh y=`height` (caller cũ không lệch mái).
 */
export function buildColumnGrid(opts: ColumnGridOpts): THREE.Group {
  const {
    rows,
    cols,
    spacing,
    height,
    radius = 0.28,
    material = 'go_son_son',
    lod = 0,
    plinth = true,
    capital = lod < 2,
  } = opts

  const group = new THREE.Group()
  group.name = 'columnGrid'

  const [sx, sz] = typeof spacing === 'number' ? [spacing, spacing] : spacing
  const count = Math.max(1, rows * cols)
  const radial = lod === 0 ? 16 : lod === 1 ? 10 : 6
  const tile = material === 'go_lim' ? uvRepeat('goLim') : uvRepeat('sonSon')
  const mat = getMaterial(material, lod)

  const shafts = new THREE.InstancedMesh(shaftGeo(radius, height, radial, tile.v), mat, count)
  shafts.name = 'column-shafts'
  shafts.castShadow = lod < 2
  shafts.receiveShadow = true
  placeGrid(shafts, rows, cols, sx, sz, height / 2)
  group.add(shafts)

  if (plinth && lod < 2) {
    const stone = getMaterial('da_thanh', lod)
    const bases = new THREE.InstancedMesh(plinthGeo(radius, lod), stone, count)
    bases.name = 'column-plinths'
    bases.castShadow = true
    bases.receiveShadow = true
    placeGrid(bases, rows, cols, sx, sz, 0)
    group.add(bases)
  } else if (plinth && lod === 2) {
    const stone = getMaterial('da_thanh', lod)
    const pad = new THREE.BoxGeometry(radius * 2.2, 0.12, radius * 2.2)
    const bases = new THREE.InstancedMesh(pad, stone, count)
    bases.name = 'column-plinths'
    placeGrid(bases, rows, cols, sx, sz, 0.06)
    group.add(bases)
  }

  if (capital && lod < 2) {
    const caps = new THREE.InstancedMesh(capitalGeo(radius, lod === 0 ? 0 : 1), mat, count)
    caps.name = 'column-capitals'
    caps.castShadow = true
    placeGrid(caps, rows, cols, sx, sz, height)
    group.add(caps)
  }

  if (lod === 0 && material !== 'go_lim') {
    const gold = getMaterial('vang_thep', lod)
    const rings = new THREE.InstancedMesh(goldRingGeo(radius), gold, count)
    rings.name = 'column-gold-rings'
    rings.castShadow = true
    placeGrid(rings, rows, cols, sx, sz, height - 0.2)
    group.add(rings)
  }

  return group
}
