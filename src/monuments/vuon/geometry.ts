import * as THREE from 'three'

/** Deterministic LCG — cùng seed → cùng layout instances. */
export function createRng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 4294967296
  }
}

export function randRange(rng: () => number, a: number, b: number): number {
  return a + (b - a) * rng()
}

/** Low-poly rock: dodecahedron-ish via icosahedron (cheap). */
export function rockGeo(detail = 0): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, detail)
  geo.scale(1, 0.72, 0.9)
  return geo
}

/** Ceramic pot — truncated cone + lip (merged into one BufferGeometry). */
export function potGeo(): THREE.BufferGeometry {
  const body = new THREE.CylinderGeometry(0.28, 0.38, 0.55, 8, 1, false)
  const lip = new THREE.TorusGeometry(0.3, 0.04, 4, 10)
  lip.rotateX(Math.PI / 2)
  lip.translate(0, 0.28, 0)
  const soil = new THREE.CylinderGeometry(0.26, 0.26, 0.06, 8)
  soil.translate(0, 0.22, 0)

  const merged = mergeGeometries([body, lip, soil])
  body.dispose()
  lip.dispose()
  soil.dispose()
  return merged
}

/** Merge BufferGeometries with baked transforms already applied. */
export function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const out = new THREE.BufferGeometry()
  const positions: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  let vertexOffset = 0

  for (const g of geos) {
    const pos = g.getAttribute('position')
    const nor = g.getAttribute('normal')
    if (!pos) continue
    if (!nor) g.computeVertexNormals()
    const n = g.getAttribute('normal')
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i))
      if (n) normals.push(n.getX(i), n.getY(i), n.getZ(i))
      else normals.push(0, 1, 0)
    }
    const idx = g.getIndex()
    if (idx) {
      for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + vertexOffset)
    } else {
      for (let i = 0; i < pos.count; i++) indices.push(vertexOffset + i)
    }
    vertexOffset += pos.count
  }

  out.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  out.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  out.setIndex(indices)
  return out
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
