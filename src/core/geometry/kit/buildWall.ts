import * as THREE from 'three'
import { getMaterial } from '../../materials/MaterialLibrary'
import { copyUvToUv2, uvRepeat } from './uvMeters'

export type WallOpts = {
  path: THREE.Vector3[]
  height: number
  thickness: number
  crenellation?: boolean
  lod?: 0 | 1 | 2
}

/**
 * Extruded wall along a polyline path. Merges into one Mesh for draw-call budget.
 * UVs are world-ish metres / gạch vồ cycle (was XZ * 0.1 — stretched flat).
 */
export function buildWall(opts: WallOpts): THREE.Mesh {
  const { path, height, thickness, crenellation = false, lod = 0 } = opts
  if (path.length < 2) {
    return new THREE.Mesh(new THREE.BoxGeometry(1, height, thickness), getMaterial('gach_vo', lod))
  }

  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  const half = thickness / 2
  const tile = uvRepeat('gachVo')
  let vertexOffset = 0
  let dist = 0

  const pushCorner = (p: THREE.Vector3, u: number, v: number) => {
    positions.push(p.x, p.y, p.z)
    uvs.push(u / tile.u, v / tile.v)
  }

  const pushQuad = (
    p0: THREE.Vector3,
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    p3: THREE.Vector3,
    u0: number,
    v0: number,
    u1: number,
    v1: number,
  ) => {
    const o = vertexOffset
    pushCorner(p0, u0, v0)
    pushCorner(p1, u1, v0)
    pushCorner(p2, u1, v1)
    pushCorner(p3, u0, v1)
    indices.push(o, o + 1, o + 2, o, o + 2, o + 3)
    vertexOffset += 4
  }

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
    const blh = bl.clone().setY(height)
    const brh = br.clone().setY(height)
    const tlh = tl.clone().setY(height)
    const trh = tr.clone().setY(height)

    const u0 = dist
    const u1 = dist + len

    // Outer / inner long faces: U along path, V = height
    pushQuad(bl, tl, tlh, blh, u0, 0, u1, height)
    pushQuad(br, brh, trh, tr, u0, 0, u1, height)
    // Top / bottom: U along path, V across thickness
    pushQuad(blh, tlh, trh, brh, u0, 0, u1, thickness)
    pushQuad(bl, br, tr, tl, u0, 0, u1, thickness)
    // Caps
    pushQuad(bl, br, brh, blh, 0, 0, thickness, height)
    pushQuad(tl, tlh, trh, tr, 0, 0, thickness, height)

    if (crenellation && lod < 2 && i % 2 === 0) {
      const mid = a.clone().lerp(b, 0.5)
      const cw = Math.min(1.2, len * 0.35)
      const ch = 0.9
      const crenel = new THREE.BoxGeometry(cw, ch, thickness * 0.95)
      const box = new THREE.Mesh(crenel)
      box.position.set(mid.x, height + ch / 2, mid.z)
      box.updateMatrix()
      const pos = crenel.attributes.position
      const uvAttr = crenel.attributes.uv
      const base = vertexOffset
      for (let vi = 0; vi < pos.count; vi++) {
        const p = new THREE.Vector3().fromBufferAttribute(pos, vi).applyMatrix4(box.matrix)
        positions.push(p.x, p.y, p.z)
        const cu = uvAttr.getX(vi) * (cw / tile.u)
        const cv = uvAttr.getY(vi) * (ch / tile.v)
        uvs.push(cu, cv)
      }
      const idx = crenel.index
      if (idx) {
        for (let k = 0; k < idx.count; k++) indices.push(base + idx.getX(k))
      }
      vertexOffset += pos.count
      crenel.dispose()
    }

    dist += len
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  copyUvToUv2(geo)

  const mesh = new THREE.Mesh(geo, getMaterial('gach_vo', lod))
  mesh.name = 'wall'
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}
