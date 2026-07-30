import * as THREE from 'three'

/** Square frustum (chóp cụt) — bottom/top half-extent, height along +Y. */
export function truncatedPyramidGeo(
  halfBottom: number,
  halfTop: number,
  height: number,
): THREE.BufferGeometry {
  const y0 = 0
  const y1 = height
  const b = halfBottom
  const t = halfTop

  const positions = new Float32Array([
    // bottom
    -b, y0, -b, b, y0, -b, b, y0, b, -b, y0, b,
    // top
    -t, y1, -t, t, y1, -t, t, y1, t, -t, y1, t,
  ])

  const indices = [
    // bottom (downward)
    0, 2, 1, 0, 3, 2,
    // top
    4, 5, 6, 4, 6, 7,
    // -Z
    0, 1, 5, 0, 5, 4,
    // +Z
    3, 6, 2, 3, 7, 6,
    // +X
    1, 2, 6, 1, 6, 5,
    // -X
    0, 4, 7, 0, 7, 3,
  ]

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/** Soft chamfered square frustum via radial CylinderGeometry (4 sides + rotate). */
export function frustumMesh(
  halfBottom: number,
  halfTop: number,
  height: number,
  material: THREE.Material,
  segments = 4,
): THREE.Mesh {
  // Cylinder uses radius ≈ half-diagonal for square inscribed; for axis-aligned square use segments=4 + π/4
  const rB = halfBottom * Math.SQRT2
  const rT = halfTop * Math.SQRT2
  const geo = new THREE.CylinderGeometry(rT, rB, height, segments, 1, false)
  const mesh = new THREE.Mesh(geo, material)
  mesh.rotation.y = Math.PI / 4
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

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
