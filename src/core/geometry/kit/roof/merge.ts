import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { copyUvToUv2 } from '../uvMeters'

/** Gộp geo kit. Trả null nếu rỗng. Dispose nguồn khi gộp > 1. */
export function mergeKit(geos: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  const usable = geos.filter((g) => (g.getAttribute('position')?.count ?? 0) > 0)
  if (usable.length === 0) return null
  if (usable.length === 1) {
    const g = usable[0]
    if (!g.getAttribute('normal')) g.computeVertexNormals()
    copyUvToUv2(g)
    return g
  }
  for (const g of usable) {
    if (!g.getAttribute('normal')) g.computeVertexNormals()
    if (!g.getAttribute('uv')) {
      const n = g.getAttribute('position').count
      g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2))
    }
  }
  const merged = mergeGeometries(usable, false)
  for (const g of usable) g.dispose()
  if (!merged) return null
  merged.computeVertexNormals()
  copyUvToUv2(merged)
  return merged
}

export function meshOf(
  geo: THREE.BufferGeometry | null,
  mat: THREE.Material,
  name: string,
  shadows = true,
): THREE.Mesh | null {
  if (!geo) return null
  const mesh = new THREE.Mesh(geo, mat)
  mesh.name = name
  mesh.castShadow = shadows
  mesh.receiveShadow = shadows
  return mesh
}
