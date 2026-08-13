import * as THREE from 'three'
import { getMaterial } from '../../materials/MaterialLibrary'
import { mergeKit, meshOf } from './roof/merge'

export type BracketSetOpts = {
  width?: number
  depth?: number
  height?: number
  layers?: number
  lod?: 0 | 1 | 2
}

function boxAt(w: number, h: number, d: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d)
  g.rotateX(rx)
  g.rotateY(ry)
  g.rotateZ(rz)
  g.translate(x, y, z)
  return g
}

/**
 * Chồng rường + kẻ / bẩy / con sơn — kiểu Huế.
 * Cấm dougong Trung Hoa nhiều tầng. Research: materials.md §1.2–1.3.
 */
export function buildBracketSet(opts: BracketSetOpts = {}): THREE.Group {
  const { width = 2.4, depth = 1.2, height = 1.1, layers = 3, lod = 0 } = opts
  const group = new THREE.Group()
  group.name = 'bracketSet'

  const wood = getMaterial('go_lim', lod)
  const gold = getMaterial('vang_thep', lod)
  const layerCount = lod === 2 ? 1 : Math.max(1, layers)

  if (lod === 2) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(width * 0.7, height * 0.45, depth * 0.4), wood)
    mass.position.y = height * 0.65
    group.add(mass)
    return group
  }

  const woodParts: THREE.BufferGeometry[] = []
  const goldParts: THREE.BufferGeometry[] = []

  // —— Chồng rường: thanh ngang xếp chồng, ngắn dần lên trên ——
  for (let i = 0; i < layerCount; i++) {
    const t = layerCount === 1 ? 0 : i / (layerCount - 1)
    const w = width * (1 - t * 0.38)
    const beamH = lod === 0 ? 0.13 : 0.11
    const beamD = lod === 0 ? 0.22 : 0.2
    const y = (i + 0.55) * (height / (layerCount + 0.35))
    woodParts.push(boxAt(w, beamH, beamD, 0, y, 0))
    // rường dọc (xuyên) — đọc được vì, không pallet
    woodParts.push(boxAt(beamD * 0.85, beamH * 0.85, depth * (0.45 + t * 0.25), 0, y + beamH * 0.15, 0))
    if (lod === 0) {
      goldParts.push(boxAt(0.08, beamH * 0.55, beamD * 0.7, w * 0.48, y, 0))
      goldParts.push(boxAt(0.08, beamH * 0.55, beamD * 0.7, -w * 0.48, y, 0))
    }
  }

  // —— Giả thủ: cột ngắn giữa các tầng rường ——
  if (lod === 0 && layerCount >= 2) {
    const postH = height / (layerCount + 0.6)
    for (const x of [-width * 0.22, width * 0.22]) {
      for (let i = 0; i < layerCount - 1; i++) {
        const y = (i + 1) * (height / (layerCount + 0.35))
        woodParts.push(boxAt(0.1, postH * 0.55, 0.1, x, y, 0))
      }
    }
  }

  // —— Kẻ / bẩy: thanh chéo đua mái ±Z (không phải đấu củng nhiều tầng) ——
  const keLen = Math.hypot(depth * 0.55, height * 0.42)
  const keAng = Math.atan2(height * 0.42, depth * 0.55)
  const keT = lod === 0 ? 0.1 : 0.09
  for (const sign of [-1, 1]) {
    woodParts.push(boxAt(keT, keT * 0.85, keLen, 0, height * 0.42, sign * depth * 0.28, sign * keAng, 0, 0))
    // bẩy ngắn, gần nằm hơn
    const bayLen = keLen * 0.55
    const bayAng = keAng * 0.45
    woodParts.push(boxAt(keT * 0.9, keT * 0.7, bayLen, 0, height * 0.22, sign * depth * 0.18, sign * bayAng, 0, 0))
  }

  // —— Con sơn góc: bậc gỗ đua ra, không interlocking dougong ——
  if (lod === 0) {
    const steps = 3
    for (const sz of [-1, 1]) {
      for (const sx of [-1, 1]) {
        for (let i = 0; i < steps; i++) {
          woodParts.push(
            boxAt(
              0.2,
              0.075,
              0.26,
              sx * (width * 0.28 + i * 0.04),
              height * 0.48 + i * 0.085,
              sz * (depth * 0.22 + i * 0.14),
            ),
          )
        }
      }
    }
  } else {
    for (const sz of [-1, 1]) {
      woodParts.push(boxAt(0.22, 0.1, 0.32, 0, height * 0.55, sz * depth * 0.32))
    }
  }

  const woodMesh = meshOf(mergeKit(woodParts), wood, 'bracket-wood')
  if (woodMesh) group.add(woodMesh)
  if (goldParts.length && lod === 0) {
    const goldMesh = meshOf(mergeKit(goldParts), gold, 'bracket-gold', true)
    if (goldMesh) group.add(goldMesh)
  }

  return group
}
