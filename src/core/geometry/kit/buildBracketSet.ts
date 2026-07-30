import * as THREE from 'three'
import { getMaterial } from '../../materials/MaterialLibrary'

export type BracketSetOpts = {
  width?: number
  depth?: number
  height?: number
  layers?: number
  lod?: 0 | 1 | 2
}

/**
 * Stylized đấu củng / vì kèo chồng rường — LOD-aware.
 */
export function buildBracketSet(opts: BracketSetOpts = {}): THREE.Group {
  const { width = 2.4, depth = 1.2, height = 1.1, layers = 3, lod = 0 } = opts
  const group = new THREE.Group()
  group.name = 'bracketSet'
  const wood = getMaterial('go_lim', lod)
  const accent = getMaterial('vang_thep', lod)

  const layerCount = lod === 2 ? 1 : Math.max(1, layers)
  for (let i = 0; i < layerCount; i++) {
    const t = i / Math.max(1, layerCount - 1)
    const w = width * (0.55 + t * 0.45)
    const d = depth * (0.55 + t * 0.45)
    const beam = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d * 0.35), wood)
    beam.position.y = (i + 1) * (height / (layerCount + 1))
    group.add(beam)

    if (lod < 2) {
      const cross = new THREE.Mesh(new THREE.BoxGeometry(w * 0.2, 0.1, d), wood)
      cross.position.y = beam.position.y
      group.add(cross)
    }
  }

  if (lod === 0) {
    const capital = new THREE.Mesh(new THREE.BoxGeometry(width * 0.35, 0.16, depth * 0.45), accent)
    capital.position.y = height
    group.add(capital)
  }

  return group
}
