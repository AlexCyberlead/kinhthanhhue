import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Vertex `color` = region weights (R torso, G legs, B skin).
 * Vertex `uv` = local 0–1 for atlas cell sampling on torso.
 * Vertex `uv2.x` = 1 → hat cone (hide via aHasHat); `uv2.y` = 1 → hair/khăn.
 */
function paintRegion(
  geo: THREE.BufferGeometry,
  r: number,
  g: number,
  b: number,
  opts: { hat?: boolean; hair?: boolean; atlas?: boolean } = {},
): THREE.BufferGeometry {
  const count = geo.attributes.position.count
  const pos = geo.attributes.position
  const colors = new Float32Array(count * 3)
  const uvs = new Float32Array(count * 2)
  const uv2 = new Float32Array(count * 2)

  let minY = Infinity
  let maxY = -Infinity
  let minX = Infinity
  let maxX = -Infinity
  for (let i = 0; i < count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
  }
  const spanY = Math.max(1e-4, maxY - minY)
  const spanX = Math.max(1e-4, maxX - minX)

  for (let i = 0; i < count; i++) {
    colors[i * 3] = r
    colors[i * 3 + 1] = g
    colors[i * 3 + 2] = b
    if (opts.atlas) {
      uvs[i * 2] = (pos.getX(i) - minX) / spanX
      uvs[i * 2 + 1] = (pos.getY(i) - minY) / spanY
    } else {
      uvs[i * 2] = 0.5
      uvs[i * 2 + 1] = 0.5
    }
    uv2[i * 2] = opts.hat ? 1 : 0
    uv2[i * 2 + 1] = opts.hair ? 1 : 0
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geo.setAttribute('uv2', new THREE.BufferAttribute(uv2, 2))
  return geo
}

/**
 * Stylized low-poly humanoid (unit height ≈ 1.7 m before scale).
 * Single merge → 1 draw call for all instances.
 */
export function createNpcGeometry(): THREE.BufferGeometry {
  const legs = new THREE.CylinderGeometry(0.12, 0.14, 0.55, 6, 1)
  legs.translate(0, 0.275, 0)
  paintRegion(legs, 0, 1, 0)

  const torso = new THREE.CylinderGeometry(0.2, 0.22, 0.55, 7, 1)
  torso.translate(0, 0.825, 0)
  paintRegion(torso, 1, 0, 0, { atlas: true })

  const shoulders = new THREE.BoxGeometry(0.48, 0.14, 0.22)
  shoulders.translate(0, 1.05, 0)
  paintRegion(shoulders, 1, 0, 0, { atlas: true })

  const head = new THREE.SphereGeometry(0.14, 7, 5)
  head.translate(0, 1.28, 0)
  paintRegion(head, 0, 0, 1)

  const hat = new THREE.ConeGeometry(0.28, 0.16, 8)
  hat.translate(0, 1.46, 0)
  paintRegion(hat, 1, 1, 0, { hat: true })

  const hair = new THREE.SphereGeometry(0.12, 6, 4)
  hair.scale(1, 0.55, 1)
  hair.translate(0, 1.38, 0)
  paintRegion(hair, 1, 1, 0, { hair: true })

  const merged = mergeGeometries([legs, torso, shoulders, head, hair, hat], false)
  legs.dispose()
  torso.dispose()
  shoulders.dispose()
  head.dispose()
  hair.dispose()
  hat.dispose()

  if (!merged) {
    throw new Error('createNpcGeometry: merge failed')
  }
  merged.computeVertexNormals()
  return merged
}

let cached: THREE.BufferGeometry | null = null

export function getNpcGeometry(): THREE.BufferGeometry {
  if (!cached) cached = createNpcGeometry()
  return cached
}

export function disposeNpcGeometryCache(): void {
  cached?.dispose()
  cached = null
}
