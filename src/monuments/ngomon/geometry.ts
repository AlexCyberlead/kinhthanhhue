import * as THREE from 'three'
import { getMaterial, type MaterialId } from '../../core/materials/MaterialLibrary'

/** Count triangles under a Object3D tree (instanced counts instances). */
export function estimateTris(root: THREE.Object3D): number {
  let tris = 0
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    const geo = mesh.geometry as THREE.BufferGeometry
    const index = geo.getIndex()
    const pos = geo.getAttribute('position')
    let faceTris = 0
    if (index) faceTris = index.count / 3
    else if (pos) faceTris = pos.count / 3
    const inst = (mesh as THREE.InstancedMesh).isInstancedMesh
      ? (mesh as THREE.InstancedMesh).count
      : 1
    tris += faceTris * inst
  })
  return Math.round(tris)
}

export function countDrawCalls(root: THREE.Object3D): number {
  let n = 0
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh) n += 1
  })
  return n
}

/**
 * Instanced columns at arbitrary local positions (y = base of column).
 * Bắt buộc InstancedMesh — không spawn Mesh rời.
 */
export function buildColumnsAt(
  positions: ReadonlyArray<readonly [number, number, number]>,
  height: number,
  radius: number,
  material: MaterialId,
  lod: 0 | 1 | 2,
): THREE.InstancedMesh {
  const radial = lod === 0 ? 10 : lod === 1 ? 6 : 4
  const geo = new THREE.CylinderGeometry(radius * 0.92, radius, height, radial)
  const mat = getMaterial(material, lod)
  const mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, positions.length))
  mesh.castShadow = lod < 2
  mesh.receiveShadow = true
  mesh.name = 'columnsAt'
  const dummy = new THREE.Object3D()
  positions.forEach((p, i) => {
    dummy.position.set(p[0], p[1] + height / 2, p[2])
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  })
  mesh.instanceMatrix.needsUpdate = true
  return mesh
}

/**
 * Single-mesh hip / box roof for LOD1–2 draw-call budget.
 * Local origin = eave plane (y=0); apex / box top at +rise.
 */
export function buildCompactRoof(
  width: number,
  depth: number,
  rise: number,
  tileMaterial: MaterialId,
  lod: 0 | 1 | 2,
): THREE.Mesh {
  const mat = getMaterial(tileMaterial, lod)
  if (lod === 2) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(width, rise, depth), mat)
    m.position.y = rise * 0.5
    m.castShadow = true
    m.name = 'compactRoof'
    return m
  }
  // Low-poly hip: 4 sides + underside = 8 tris
  const hw = width * 0.5
  const hd = depth * 0.5
  const positions = new Float32Array([
    -hw, 0, -hd, hw, 0, -hd, hw, 0, hd, -hw, 0, hd,
    0, rise, 0,
  ])
  const indices = [0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4, 0, 3, 2, 0, 2, 1]
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  const mesh = new THREE.Mesh(geo, mat)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.name = 'compactRoof'
  return mesh
}

/** Dims — [ước lượng hợp lý] từ tư liệu Ngọ Môn / mặt bằng Hoàng thành. */
export const NGO_MON = {
  width: 56,
  depth: 28,
  armThickness: 9.5,
  bodyHeight: 9.2,
  deckThickness: 0.45,
  openingH: 5.4,
  openingWRoyal: 4.4,
  openingWSide: 3.4,
  openingSpacing: 8.6,
  pavilionFloorH: 4.4,
  upperFloorH: 3.6,
} as const
