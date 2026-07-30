import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const _pos = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _scale = new THREE.Vector3(1, 1, 1)
const _euler = new THREE.Euler()
const _mat = new THREE.Matrix4()

/** Bake BoxGeometry at transform (disposes source). */
export function boxAt(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  ry = 0,
): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(w, h, d)
  _euler.set(0, ry, 0)
  _quat.setFromEuler(_euler)
  _pos.set(x, y, z)
  _mat.compose(_pos, _quat, _scale)
  geo.applyMatrix4(_mat)
  return geo
}

export function mergeOrNull(geos: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  if (geos.length === 0) return null
  if (geos.length === 1) return geos[0]
  const merged = mergeGeometries(geos, false)
  for (const g of geos) g.dispose()
  return merged
}

export function meshFrom(
  geo: THREE.BufferGeometry | null,
  mat: THREE.Material,
  name: string,
  cast = false,
  receive = true,
): THREE.Mesh | null {
  if (!geo) return null
  const mesh = new THREE.Mesh(geo, mat)
  mesh.name = name
  mesh.castShadow = cast
  mesh.receiveShadow = receive
  return mesh
}

export function countDrawCalls(root: THREE.Object3D): number {
  let n = 0
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh) n += 1
  })
  return n
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
