import * as THREE from 'three'

/** Count triangles under an Object3D tree (InstancedMesh × count). */
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
 * Stylized dynastic urn (đỉnh) — single BufferGeometry for InstancedMesh.
 * Body + foot + rim + two loop handles; low-poly for budget.
 */
/** 9 silhouette đỉnh khác nhau — không 9 viên nang. */
export const URN_VARIANTS: ReadonlyArray<{
  belly: number
  neck: number
  foot: number
  lid: number
  handles: 'loop' | 'flange' | 'none'
}> = [
  { belly: 1.0, neck: 1.0, foot: 1.0, lid: 1.0, handles: 'loop' },
  { belly: 1.12, neck: 0.9, foot: 1.05, lid: 0.92, handles: 'flange' },
  { belly: 0.88, neck: 1.15, foot: 0.9, lid: 1.1, handles: 'loop' },
  { belly: 1.18, neck: 0.82, foot: 1.12, lid: 0.85, handles: 'none' },
  { belly: 0.95, neck: 1.08, foot: 0.95, lid: 1.05, handles: 'loop' },
  { belly: 1.08, neck: 0.95, foot: 1.08, lid: 0.98, handles: 'flange' },
  { belly: 0.9, neck: 1.2, foot: 0.88, lid: 1.15, handles: 'loop' },
  { belly: 1.05, neck: 0.88, foot: 1.0, lid: 0.9, handles: 'flange' },
  { belly: 1.15, neck: 1.05, foot: 1.1, lid: 1.08, handles: 'loop' },
]

export function buildUrnGeometry(lod: 0 | 1 | 2 = 0, variant = 0): THREE.BufferGeometry {
  const segs = lod === 0 ? 12 : lod === 1 ? 8 : 6
  const v = URN_VARIANTS[variant % URN_VARIANTS.length]
  const parts: THREE.BufferGeometry[] = []

  // Foot / pedestal ring
  const foot = new THREE.CylinderGeometry(0.28 * v.foot, 0.38 * v.foot, 0.22, segs, 1, false)
  foot.translate(0, 0.11, 0)
  parts.push(foot)

  // Neck flare into body
  const lower = new THREE.CylinderGeometry(0.42 * v.neck, 0.32 * v.foot, 0.45 * v.neck, segs, 1, false)
  lower.translate(0, 0.45, 0)
  parts.push(lower)

  // Main bowl (slightly bulged via mid cylinder)
  const belly = new THREE.SphereGeometry(0.55 * v.belly, segs, Math.max(6, segs / 2), 0, Math.PI * 2, 0, Math.PI * 0.65)
  belly.scale(1, 0.85 * v.belly, 1)
  belly.translate(0, 0.95, 0)
  parts.push(belly)

  // Shoulder / rim
  const rim = new THREE.TorusGeometry(0.48 * v.belly, 0.06, Math.max(4, segs / 2), segs)
  rim.rotateX(Math.PI / 2)
  rim.translate(0, 1.45, 0)
  parts.push(rim)

  // Lid dome + knop
  const lid = new THREE.SphereGeometry(0.42 * v.lid, segs, Math.max(5, segs / 2), 0, Math.PI * 2, 0, Math.PI * 0.5)
  lid.translate(0, 1.48, 0)
  parts.push(lid)
  const knop = new THREE.SphereGeometry(0.1 * v.lid, 6, 6)
  knop.translate(0, 1.95 * v.lid, 0)
  parts.push(knop)

  if (lod < 2 && v.handles === 'loop') {
    for (const side of [-1, 1]) {
      const handle = new THREE.TorusGeometry(0.16, 0.04, 5, 8, Math.PI * 1.2)
      handle.rotateZ(Math.PI / 2)
      handle.translate(side * 0.58 * v.belly, 1.15, 0)
      parts.push(handle)
    }
  } else if (lod < 2 && v.handles === 'flange') {
    for (const side of [-1, 1]) {
      const flange = new THREE.BoxGeometry(0.12, 0.42, 0.18)
      flange.translate(side * 0.62 * v.belly, 1.18, 0)
      parts.push(flange)
    }
  }

  // Simple cast relief band (stylized “chạm nổi”) — LOD0 only
  if (lod === 0) {
    const band = new THREE.TorusGeometry(0.52, 0.035, 4, segs)
    band.rotateX(Math.PI / 2)
    band.translate(0, 1.05, 0)
    parts.push(band)
  }

  const merged = mergeGeometries(parts)
  for (const p of parts) p.dispose()
  return merged
}

/** Pedestal block under each urn — shared for InstancedMesh. */
export function buildUrnPedestalGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(1.1, 0.35, 1.1)
  geo.translate(0, 0.175, 0)
  return geo
}

function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  let offset = 0

  for (const g of geos) {
    const pos = g.getAttribute('position')
    const nor = g.getAttribute('normal')
    const uv = g.getAttribute('uv')
    const idx = g.getIndex()
    if (!pos) continue

    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i))
      if (nor) normals.push(nor.getX(i), nor.getY(i), nor.getZ(i))
      else normals.push(0, 1, 0)
      if (uv) uvs.push(uv.getX(i), uv.getY(i))
      else uvs.push(0, 0)
    }

    if (idx) {
      for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + offset)
    } else {
      for (let i = 0; i < pos.count; i++) indices.push(offset + i)
    }
    offset += pos.count
  }

  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  out.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  out.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  out.setIndex(indices)
  out.computeVertexNormals()
  return out
}
