import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'

export type FlagPoleOpts = {
  /** Pole height from base (m). Kỳ Đài cột hiện đại ≈ 37 m. */
  height?: number
  /** Base radius (m) — keep thin for silhouette. */
  radius?: number
  lod?: 0 | 1 | 2
  /** Show fabric flag mesh */
  flag?: boolean
}

/**
 * Thin flagpole + stylized imperial flag (LOD-aware).
 * Position at local origin; pole rises along +Y.
 */
export function buildFlagPole(opts: FlagPoleOpts = {}): THREE.Group {
  const { height = 37, radius = 0.22, lod = 0, flag = true } = opts
  const g = new THREE.Group()
  g.name = 'flagPole'

  const radial = lod === 0 ? 8 : lod === 1 ? 6 : 4
  const metal = getMaterial('dong_thau', lod)
  const gold = getMaterial('vang_thep', lod)

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.72, radius, height, radial),
    metal,
  )
  shaft.position.y = height / 2
  shaft.castShadow = lod < 2
  g.add(shaft)

  // stepped base ring + collar (LOD0 only — keep LOD1 draw calls lean)
  if (lod === 0) {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 2.4, radius * 2.8, 0.45, radial),
      getMaterial('da_thanh', lod),
    )
    base.position.y = 0.22
    g.add(base)

    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 1.15, radius * 0.18, 6, 16),
      gold,
    )
    collar.rotation.x = Math.PI / 2
    collar.position.y = height * 0.12
    g.add(collar)
  }

  // finial
  const finialH = lod === 2 ? 0.6 : 1.1
  const finial = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.6, radial, radial), gold)
  finial.position.y = height + finialH * 0.15
  g.add(finial)
  if (lod === 0) {
    const tip = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.9, finialH, 6), gold)
    tip.position.y = height + finialH * 0.7
    g.add(tip)
  }

  if (flag && lod < 2) {
    const flagW = lod === 0 ? 6.5 : 5.2
    const flagH = lod === 0 ? 4.2 : 3.4
    const cloth = getMaterial('go_son_son', lod)
    const flagMesh = new THREE.Mesh(new THREE.PlaneGeometry(flagW, flagH, lod === 0 ? 6 : 1, 1), cloth)
    flagMesh.position.set(flagW * 0.48, height - flagH * 0.55 - 0.4, 0)
    flagMesh.castShadow = true
    // gentle wave via vertex Y offset on LOD0
    if (lod === 0) {
      const pos = flagMesh.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i)
        const u = (x + flagW / 2) / flagW
        pos.setZ(i, Math.sin(u * Math.PI * 1.5) * 0.35)
      }
      flagMesh.geometry.computeVertexNormals()
    }
    g.add(flagMesh)

    // small gold star (stylized — not modern SV flag accuracy, landmark cue)
    if (lod === 0) {
      const star = new THREE.Mesh(new THREE.CircleGeometry(0.55, 5), gold)
      star.position.set(flagW * 0.35, height - flagH * 0.55 - 0.4, 0.04)
      g.add(star)
    }
  }

  return g
}
