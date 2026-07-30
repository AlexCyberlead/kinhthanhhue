import * as THREE from 'three'
import { getMaterial } from '../../materials/MaterialLibrary'

export type PlatformOpts = {
  width: number
  depth: number
  steps?: number
  balustrade?: boolean
  height?: number
  lod?: 0 | 1 | 2
}

/**
 * Stone platform with steps + optional balustrade.
 */
export function buildPlatform(opts: PlatformOpts): THREE.Group {
  const { width, depth, steps = 3, balustrade = true, height = 1.2, lod = 0 } = opts
  const group = new THREE.Group()
  group.name = 'platform'
  const stone = getMaterial('da_thanh', lod)
  const brick = getMaterial('gach_bat_trang', lod)

  const deck = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), stone)
  deck.position.y = height / 2
  deck.receiveShadow = true
  deck.castShadow = true
  group.add(deck)

  const stepCount = lod === 2 ? Math.min(2, steps) : steps
  const stepDepth = 0.55
  for (let i = 0; i < stepCount; i++) {
    const h = ((i + 1) / stepCount) * height
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.45, h, stepDepth),
      brick,
    )
    step.position.set(0, h / 2, depth / 2 + stepDepth * (i + 0.5))
    step.receiveShadow = true
    group.add(step)
  }

  if (balustrade && lod < 2) {
    const railMat = getMaterial('da_thanh', lod)
    const postGeo = new THREE.BoxGeometry(0.18, 0.9, 0.18)
    const count = Math.max(4, Math.floor(width / 1.6))
    const posts = new THREE.InstancedMesh(postGeo, railMat, count * 2)
    const dummy = new THREE.Object3D()
    let idx = 0
    for (const z of [-depth / 2 + 0.2, depth / 2 - 0.2]) {
      for (let i = 0; i < count; i++) {
        const x = -width / 2 + 0.3 + (i / Math.max(1, count - 1)) * (width - 0.6)
        dummy.position.set(x, height + 0.45, z)
        dummy.updateMatrix()
        posts.setMatrixAt(idx++, dummy.matrix)
      }
    }
    posts.instanceMatrix.needsUpdate = true
    group.add(posts)

    const rail = new THREE.Mesh(new THREE.BoxGeometry(width - 0.4, 0.1, 0.12), railMat)
    rail.position.set(0, height + 0.9, -depth / 2 + 0.2)
    group.add(rail)
  }

  return group
}
