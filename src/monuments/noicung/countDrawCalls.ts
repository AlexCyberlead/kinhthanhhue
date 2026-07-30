import type { Mesh, Object3D } from 'three'

/** Count Mesh / InstancedMesh leaves (1 each = 1 draw call). */
export function countDrawCalls(root: Object3D): number {
  let n = 0
  root.traverse((obj) => {
    const mesh = obj as Mesh
    if (mesh.isMesh) n += 1
  })
  return n
}
