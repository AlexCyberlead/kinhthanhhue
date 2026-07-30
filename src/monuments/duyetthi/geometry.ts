import * as THREE from 'three'

/** Count triangles under an Object3D tree (instanced counts instances). */
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

/** Count Mesh / InstancedMesh leaves (1 each = 1 draw call). */
export function countDrawCalls(root: THREE.Object3D): number {
  let n = 0
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh) n += 1
  })
  return n
}
