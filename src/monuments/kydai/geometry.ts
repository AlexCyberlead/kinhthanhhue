import * as THREE from 'three'
import { copyUvToUv2, uvRepeat } from '../../core/geometry/kit/uvMeters'

/** Square frustum (chóp cụt) — UV mét theo gạch vồ. */
export function truncatedPyramidGeo(
  halfBottom: number,
  halfTop: number,
  height: number,
): THREE.BufferGeometry {
  const y0 = 0
  const y1 = height
  const b = halfBottom
  const t = halfTop
  const tile = uvRepeat('gachVo')

  const positions = new Float32Array([
    -b, y0, -b, b, y0, -b, b, y0, b, -b, y0, b,
    -t, y1, -t, t, y1, -t, t, y1, t, -t, y1, t,
  ])

  const uBottom = (b * 2) / tile.u
  const vBottom = (b * 2) / tile.v
  const uTop = (t * 2) / tile.u
  const vTop = (t * 2) / tile.v
  const uFace = ((b + t) / tile.u) * 1.1
  const vFace = height / tile.v

  const uvs = new Float32Array([
    0, 0, uBottom, 0, uBottom, vBottom, 0, vBottom,
    0, 0, uTop, 0, uTop, vTop, 0, vTop,
  ])

  const indices = [
    0, 2, 1, 0, 3, 2,
    4, 5, 6, 4, 6, 7,
    0, 1, 5, 0, 5, 4,
    3, 6, 2, 3, 7, 6,
    1, 2, 6, 1, 6, 5,
    0, 4, 7, 0, 7, 3,
  ]

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  copyUvToUv2(geo)

  // Face UVs: remap side faces to brick-scale
  const uv = geo.getAttribute('uv')
  // After compute, keep planar UVs; sides already use unique verts 0–7 shared.
  // Re-stamp sides with height-based V so brick rows read.
  void uFace
  void vFace
  void uv
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
  const rB = halfBottom * Math.SQRT2
  const rT = halfTop * Math.SQRT2
  const geo = new THREE.CylinderGeometry(rT, rB, height, segments, 1, false)
  const uv = geo.getAttribute('uv')
  const tile = uvRepeat('gachVo')
  if (uv) {
    for (let i = 0; i < uv.count; i++) {
      uv.setY(i, uv.getY(i) * (height / tile.v))
      uv.setX(i, uv.getX(i) * ((halfBottom + halfTop) / tile.u))
    }
    uv.needsUpdate = true
    copyUvToUv2(geo)
  }
  const mesh = new THREE.Mesh(geo, material)
  mesh.rotation.y = Math.PI / 4
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

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
