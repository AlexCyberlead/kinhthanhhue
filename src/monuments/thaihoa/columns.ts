import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'

/**
 * 80 cột lim sơn son thếp vàng — một InstancedMesh.
 * Tiền điện 9×5 (7 gian 2 chái) + chính điện 7×5 = 80.
 */
export function buildThaiHoaColumns(opts: {
  height: number
  radius?: number
  floorY: number
  frontCenterZ: number
  rearCenterZ: number
  lod: 0 | 1 | 2
}): THREE.Group {
  const { height, radius = 0.3, floorY, frontCenterZ, rearCenterZ, lod } = opts
  const group = new THREE.Group()
  group.name = 'thaiHoaColumns'

  const radial = lod === 0 ? 8 : lod === 1 ? 6 : 4
  const geo = new THREE.CylinderGeometry(radius * 0.92, radius, height, radial)
  const mat = getMaterial('go_son_son', lod)
  const mesh = new THREE.InstancedMesh(geo, mat, 80)
  mesh.castShadow = lod < 2
  mesh.receiveShadow = true
  mesh.name = 'columns80'

  const dummy = new THREE.Object3D()
  let i = 0

  const placeGrid = (
    cols: number,
    rows: number,
    sx: number,
    sz: number,
    cz: number,
  ) => {
    const ox = -((cols - 1) * sx) / 2
    const oz = cz - ((rows - 1) * sz) / 2
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dummy.position.set(ox + c * sx, floorY + height / 2, oz + r * sz)
        dummy.updateMatrix()
        mesh.setMatrixAt(i++, dummy.matrix)
      }
    }
  }

  // Tiền điện (nam / +Z): 9×5
  placeGrid(9, 5, 4.1, 2.85, frontCenterZ)
  // Chính điện (bắc / −Z): 7×5
  placeGrid(7, 5, 4.4, 2.85, rearCenterZ)

  mesh.instanceMatrix.needsUpdate = true
  mesh.count = 80
  group.add(mesh)

  // Thếp vàng — đai đầu cột (InstancedMesh, LOD0–1)
  if (lod < 2) {
    const bandGeo =
      lod === 0
        ? new THREE.TorusGeometry(radius * 1.05, 0.045, 4, 10)
        : new THREE.BoxGeometry(radius * 2.1, 0.08, radius * 2.1)
    const gold = getMaterial('vang_thep', lod)
    const bands = new THREE.InstancedMesh(bandGeo, gold, 80)
    bands.castShadow = lod === 0
    bands.name = 'columnGoldBands'

    // Re-walk positions for bands near capital
    i = 0
    const placeBands = (
      cols: number,
      rows: number,
      sx: number,
      sz: number,
      cz: number,
    ) => {
      const ox = -((cols - 1) * sx) / 2
      const oz = cz - ((rows - 1) * sz) / 2
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dummy.position.set(ox + c * sx, floorY + height - 0.12, oz + r * sz)
          if (lod === 0) dummy.rotation.set(Math.PI / 2, 0, 0)
          else dummy.rotation.set(0, 0, 0)
          dummy.updateMatrix()
          bands.setMatrixAt(i++, dummy.matrix)
        }
      }
    }
    placeBands(9, 5, 4.1, 2.85, frontCenterZ)
    placeBands(7, 5, 4.4, 2.85, rearCenterZ)
    bands.instanceMatrix.needsUpdate = true
    group.add(bands)
  }

  return group
}
