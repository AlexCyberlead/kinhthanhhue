import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { dragonOrnamentGeo, hoiVanBandGeo } from '../../core/geometry/kit/ornament'
import { mergeKit, meshOf } from '../../core/geometry/kit/roof/merge'
import { scaleBoxUvToMeters, uvRepeat } from '../../core/geometry/kit/uvMeters'

function boxUv(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  factory: 'sonSon' | 'vangThep' | 'phapLam',
): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d)
  scaleBoxUvToMeters(g, w, h, d, uvRepeat(factory))
  g.translate(x, y, z)
  return g
}

/**
 * Ngai vàng 3 tầng sơn son thếp vàng + bửu tán.
 * WorldScene lod=1 — ngai phải đọc được, không chỉ lod0.
 * [xác thực — Wikipedia Điện Thái Hòa] bệ 3 tầng + bửu tán thếp / pháp lam.
 */
export function buildThroneAndCanopy(lod: 0 | 1 | 2): THREE.Group {
  const g = new THREE.Group()
  g.name = 'throneBuutan'
  if (lod === 2) return g

  const son = getMaterial('go_son_son', lod)
  const gold = getMaterial('vang_thep', lod)
  const lam = getMaterial('phap_lam', lod)

  const sonParts: THREE.BufferGeometry[] = []
  const goldParts: THREE.BufferGeometry[] = []
  const lamParts: THREE.BufferGeometry[] = []

  const tiers = [
    { w: 3.2, d: 2.4, h: 0.35 },
    { w: 2.6, d: 1.9, h: 0.32 },
    { w: 2.1, d: 1.5, h: 0.28 },
  ]
  let y = 0
  for (const t of tiers) {
    sonParts.push(boxUv(t.w, t.h, t.d, 0, y + t.h / 2, 0, 'sonSon'))
    goldParts.push(boxUv(t.w * 1.02, 0.055, t.d * 1.02, 0, y + t.h - 0.02, 0, 'vangThep'))
    y += t.h
  }

  goldParts.push(boxUv(1.35, 0.22, 1.0, 0, y + 0.11, 0, 'vangThep'))
  goldParts.push(boxUv(1.4, 1.55, 0.14, 0, y + 0.22 + 0.78, -0.45, 'vangThep'))
  goldParts.push(boxUv(0.14, 0.55, 0.9, -0.62, y + 0.4, 0, 'vangThep'))
  goldParts.push(boxUv(0.14, 0.55, 0.9, 0.62, y + 0.4, 0, 'vangThep'))

  const canopyY = y + 2.55
  goldParts.push(boxUv(3.4, 0.12, 2.6, 0, canopyY, 0, 'vangThep'))

  const dome = new THREE.SphereGeometry(1.1, lod === 0 ? 12 : 8, lod === 0 ? 8 : 6, 0, Math.PI * 2, 0, Math.PI * 0.45)
  dome.translate(0, canopyY + 0.15, 0)
  goldParts.push(dome)

  const finial = new THREE.ConeGeometry(0.18, 0.55, 8)
  finial.translate(0, canopyY + 1.15, 0)
  goldParts.push(finial)

  for (const x of [-1.1, 0, 1.1]) {
    for (const z of [-0.9, 0.9]) {
      lamParts.push(boxUv(0.9, 0.7, 0.06, x, canopyY - 0.45, z, 'phapLam'))
    }
  }

  for (const x of [-1.4, 1.4]) {
    for (const z of [-1.0, 1.0]) {
      sonParts.push(boxUv(0.16, 2.4, 0.16, x, canopyY - 1.2, z, 'sonSon'))
      goldParts.push(boxUv(0.22, 0.08, 0.22, x, canopyY - 0.02, z, 'vangThep'))
    }
  }

  const sonMesh = meshOf(mergeKit(sonParts), son, 'throne-son')
  const goldMesh = meshOf(mergeKit(goldParts), gold, 'throne-gold')
  const lamMesh = meshOf(mergeKit(lamParts), lam, 'throne-lam')
  if (sonMesh) g.add(sonMesh)
  if (goldMesh) g.add(goldMesh)
  if (lamMesh) g.add(lamMesh)

  if (lod === 0) {
    const dragon = dragonOrnamentGeo(0.28, 0)
    if (dragon) {
      for (const side of [-1, 1]) {
        const d = new THREE.Mesh(dragon, gold)
        d.position.set(side * 0.72, y + 1.15, -0.42)
        d.rotation.y = side < 0 ? 0.4 : Math.PI - 0.4
        d.scale.set(0.55, 0.55, 0.55)
        g.add(d)
      }
    }
    const band = hoiVanBandGeo(1.6, 0.16, 0.03, 0)
    if (band) {
      const m = new THREE.Mesh(band, gold)
      m.position.set(0, y + 1.85, -0.38)
      g.add(m)
    }
  }

  return g
}
