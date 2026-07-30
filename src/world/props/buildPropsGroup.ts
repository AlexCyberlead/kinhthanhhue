import * as THREE from 'three'
import {
  createPropGeometry,
  type PropKind,
  type PropLod,
  PROP_KINDS,
} from './geometries'

export type PropPlacement = {
  kind: PropKind
  x: number
  y: number
  z: number
  rotY: number
  scale: number
}

/** Demo placements quanh trục thần đạo stylized (C4/C5 scene glue). */
export const DEFAULT_PROP_PLACEMENTS: PropPlacement[] = [
  // Lọng hàng trước sân triều
  { kind: 'long', x: -4, y: 0, z: 12, rotY: 0.1, scale: 1 },
  { kind: 'long', x: 4, y: 0, z: 12, rotY: -0.1, scale: 1 },
  { kind: 'long', x: -6, y: 0, z: 18, rotY: 0.05, scale: 0.95 },
  { kind: 'long', x: 6, y: 0, z: 18, rotY: -0.05, scale: 0.95 },
  // Cờ xí Ngọ Môn stylized
  { kind: 'co', x: -8, y: 0, z: 2, rotY: 0.2, scale: 1 },
  { kind: 'co', x: 8, y: 0, z: 2, rotY: -0.2, scale: 1 },
  { kind: 'co', x: -10, y: 0, z: 8, rotY: 0.15, scale: 1.05 },
  { kind: 'co', x: 10, y: 0, z: 8, rotY: -0.15, scale: 1.05 },
  // Kiệu
  { kind: 'kieu', x: 0, y: 0, z: 22, rotY: Math.PI, scale: 1 },
  { kind: 'kieu', x: -14, y: 0, z: 14, rotY: Math.PI * 0.5, scale: 0.9 },
]

function sharedMaterial(): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
  })
}

/**
 * Build ceremonial props group — ≤ 3 meshes (1 / kind) → ≤ 3 DC.
 * Geometries are InstancedMesh-friendly (vertex colors, centered, cached).
 */
export function buildPropsGroup(
  lod: PropLod,
  placements: PropPlacement[] = DEFAULT_PROP_PLACEMENTS,
): THREE.Group {
  const root = new THREE.Group()
  root.name = 'props-ceremonial'

  const mat = sharedMaterial()
  mat.name = 'props-vertex-color'

  const _m = new THREE.Matrix4()
  const _p = new THREE.Vector3()
  const _q = new THREE.Quaternion()
  const _s = new THREE.Vector3()
  const _e = new THREE.Euler()

  for (const kind of PROP_KINDS) {
    const list = placements.filter((p) => p.kind === kind)
    if (list.length === 0) continue

    const geo = createPropGeometry(kind, lod)
    // InstancedMesh: 1 DC / kind → max 3 DC total
    const mesh = new THREE.InstancedMesh(geo, mat, list.length)
    mesh.name = `prop_inst_${kind}`
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.frustumCulled = true

    for (let i = 0; i < list.length; i++) {
      const pl = list[i]!
      _p.set(pl.x, pl.y, pl.z)
      _e.set(0, pl.rotY, 0)
      _q.setFromEuler(_e)
      _s.setScalar(pl.scale)
      _m.compose(_p, _q, _s)
      mesh.setMatrixAt(i, _m)
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.count = list.length
    // Keep material shared — dispose group via userData hook
    root.add(mesh)
  }

  root.userData.disposeMaterials = () => {
    mat.dispose()
  }

  return root
}

/** Max draw calls for default buildPropsGroup (1 InstancedMesh × 3 kinds). */
export const PROPS_MAX_DRAW_CALLS = 3
