import * as THREE from 'three'
import { getMaterial, type MaterialId } from '../../materials/MaterialLibrary'

export type ColumnGridOpts = {
  rows: number
  cols: number
  spacing: number | [number, number]
  height: number
  radius?: number
  material?: MaterialId
  lod?: 0 | 1 | 2
}

/**
 * Instanced column grid — bắt buộc InstancedMesh cho hàng trăm cột.
 */
export function buildColumnGrid(opts: ColumnGridOpts): THREE.InstancedMesh {
  const {
    rows,
    cols,
    spacing,
    height,
    radius = 0.28,
    material = 'go_son_son',
    lod = 0,
  } = opts

  const [sx, sz] = typeof spacing === 'number' ? [spacing, spacing] : spacing
  const radial = lod === 0 ? 10 : lod === 1 ? 6 : 4
  const geo = new THREE.CylinderGeometry(radius * 0.92, radius, height, radial)
  const mat = getMaterial(material, lod)
  const count = Math.max(1, rows * cols)
  const mesh = new THREE.InstancedMesh(geo, mat, count)
  mesh.castShadow = lod < 2
  mesh.receiveShadow = true
  mesh.name = 'columnGrid'

  const dummy = new THREE.Object3D()
  const originX = -((cols - 1) * sx) / 2
  const originZ = -((rows - 1) * sz) / 2
  let i = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dummy.position.set(originX + c * sx, height / 2, originZ + r * sz)
      dummy.updateMatrix()
      mesh.setMatrixAt(i++, dummy.matrix)
    }
  }
  mesh.instanceMatrix.needsUpdate = true
  return mesh
}
