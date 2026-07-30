import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildFlagPole } from './flagPole'

/**
 * Optional split: Cột cờ as its own skyline marker.
 * Shares Kỳ Đài plan position; pole base at ~18.7 m (top of 3-tier stack + plinth).
 * Prefer registering `ky-dai` alone (already includes the pole) to avoid double poles.
 */
function buildCotCo(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'cot-co'

  const stone = getMaterial('da_thanh', lod)
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 2.0, 1.4, lod === 0 ? 12 : 8),
    stone,
  )
  pedestal.position.y = 18.7 + 0.7
  pedestal.castShadow = lod < 2
  root.add(pedestal)

  const pole = buildFlagPole({ height: 37, radius: lod === 2 ? 0.3 : 0.22, lod, flag: lod < 2 })
  pole.position.y = 18.7 + 1.4
  root.add(pole)

  return root
}

export const cotCo: MonumentModule = {
  id: 'cot-co',
  displayName: { vi: 'Cột cờ Kỳ Đài', en: 'Flagpole' },
  build: buildCotCo,
  anchor: [0, 0, 340],
  rotationY: 0,
  boundingRadius: 20,
  poi: {
    vi: 'Cột cờ trên Kỳ Đài — bê tông ~37 m (bản hiện đại 1948), tổng đài + cột ~54 m.',
    en: 'Flagpole atop Kỳ Đài — ~37 m concrete shaft (1948 rebuild); tower + pole ~54 m.',
    year: '1948',
  },
}
