import * as THREE from 'three'
import { getMaterial } from '../../materials/MaterialLibrary'

export type WallOpts = {
  path: THREE.Vector3[]
  height: number
  thickness: number
  crenellation?: boolean
  lod?: 0 | 1 | 2
}

/**
 * Extruded wall along a polyline path. Merges into one Mesh for draw-call budget.
 */
export function buildWall(opts: WallOpts): THREE.Mesh {
  const { path, height, thickness, crenellation = false, lod = 0 } = opts
  if (path.length < 2) {
    return new THREE.Mesh(new THREE.BoxGeometry(1, height, thickness), getMaterial('gach_vo', lod))
  }

  const shape = new THREE.Shape()
  // Build cross-section rectangle, then extrude along path via Tube-like segments merged
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  const half = thickness / 2
  let vertexOffset = 0

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]
    const b = path[i + 1]
    const dir = new THREE.Vector3().subVectors(b, a)
    const len = dir.length()
    if (len < 1e-4) continue
    dir.normalize()
    const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(half)

    const bl = a.clone().add(side)
    const br = a.clone().sub(side)
    const tl = b.clone().add(side)
    const tr = b.clone().sub(side)

    const corners = [
      bl,
      br,
      br.clone().setY(height),
      bl.clone().setY(height),
      tl,
      tr,
      tr.clone().setY(height),
      tl.clone().setY(height),
    ]

    for (const c of corners) {
      positions.push(c.x, c.y, c.z)
      normals.push(0, 1, 0)
      uvs.push(c.x * 0.1, c.z * 0.1)
    }

    // sides as two quads along segment + ends approximated
    const o = vertexOffset
    // bottom front/back ignored; build 4 walls of prism
    const faces = [
      [0, 1, 2, 3],
      [5, 4, 7, 6],
      [4, 0, 3, 7],
      [1, 5, 6, 2],
      [3, 2, 6, 7],
      [0, 4, 5, 1],
    ]
    for (const f of faces) {
      indices.push(o + f[0], o + f[1], o + f[2], o + f[0], o + f[2], o + f[3])
    }
    vertexOffset += 8

    if (crenellation && lod < 2 && i % 2 === 0) {
      const mid = a.clone().lerp(b, 0.5)
      const cw = Math.min(1.2, len * 0.35)
      const ch = 0.9
      // simple box crenel via extra verts
      const crenel = new THREE.BoxGeometry(cw, ch, thickness * 0.95)
      // bake into positions as 8 corners around mid
      const box = new THREE.Mesh(crenel)
      box.position.set(mid.x, height + ch / 2, mid.z)
      box.updateMatrix()
      const pos = crenel.attributes.position
      const base = vertexOffset
      for (let vi = 0; vi < pos.count; vi++) {
        const v = new THREE.Vector3().fromBufferAttribute(pos, vi).applyMatrix4(box.matrix)
        positions.push(v.x, v.y, v.z)
        normals.push(0, 1, 0)
        uvs.push(0, 0)
      }
      const idx = crenel.index
      if (idx) {
        for (let k = 0; k < idx.count; k++) indices.push(base + idx.getX(k))
      }
      vertexOffset += pos.count
      crenel.dispose()
    }
  }

  // silence unused shape for tree-shaking clarity
  void shape

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()

  const mesh = new THREE.Mesh(geo, getMaterial('gach_vo', lod))
  mesh.name = 'wall'
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}
