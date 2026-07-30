import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { SpeciesDef, VegetationLod, VegetationSpeciesId } from './types'
import { SPECIES } from './species'

function paint(geo: THREE.BufferGeometry, hex: string): THREE.BufferGeometry {
  const color = new THREE.Color(hex)
  const count = geo.attributes.position.count
  const colors = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geo
}

function trunkGeo(
  height: number,
  radiusBottom: number,
  radiusTop: number,
  radial: number,
  color: string,
): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial, 1)
  g.translate(0, height / 2, 0)
  return paint(g, color)
}

function canopyCone(
  radius: number,
  height: number,
  y: number,
  radial: number,
  color: string,
): THREE.BufferGeometry {
  const g = new THREE.ConeGeometry(radius, height, radial)
  g.translate(0, y + height / 2, 0)
  return paint(g, color)
}

function canopySphere(
  radius: number,
  y: number,
  segs: number,
  color: string,
  sx = 1,
  sy = 1,
  sz = 1,
): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(radius, segs, Math.max(4, (segs / 2) | 0))
  g.scale(sx, sy, sz)
  g.translate(0, y, 0)
  return paint(g, color)
}

/** Crossed quads — cheap far LOD / billboard-ish. */
function crossPlanes(
  width: number,
  height: number,
  yBase: number,
  color: string,
): THREE.BufferGeometry {
  const h = height
  const mk = (rotY: number) => {
    const g = new THREE.PlaneGeometry(width, h)
    g.translate(0, yBase + h / 2, 0)
    g.rotateY(rotY)
    return paint(g, color)
  }
  return mergeGeometries([mk(0), mk(Math.PI / 2)], false)!
}

function flowerBlob(
  radius: number,
  y: number,
  color: string,
  segs: number,
): THREE.BufferGeometry {
  return canopySphere(radius, y, segs, color, 1, 0.55, 1)
}

function leafDisk(
  radius: number,
  y: number,
  segs: number,
  color: string,
): THREE.BufferGeometry {
  const g = new THREE.CircleGeometry(radius, segs)
  g.rotateX(-Math.PI / 2)
  g.translate(0, y, 0)
  return paint(g, color)
}

function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(parts, false)
  if (!merged) throw new Error('vegetation: mergeGeometries failed')
  merged.computeVertexNormals()
  return merged
}

function radialForLod(lod: VegetationLod): number {
  return lod === 0 ? 8 : lod === 1 ? 6 : 4
}

function buildGenericTree(def: SpeciesDef, lod: VegetationLod): THREE.BufferGeometry {
  const h = def.height
  const r = def.canopyRadius
  const segs = radialForLod(lod)
  const trunkC = def.trunkColor
  const canopyC = def.canopyColor
  const accent = def.accentColor ?? canopyC

  if (lod === 2) {
    return merge([
      trunkGeo(h * 0.55, r * 0.08, r * 0.05, 4, trunkC),
      crossPlanes(r * 1.6, h * 0.55, h * 0.4, canopyC),
    ])
  }

  const trunkH = h * 0.55
  const parts: THREE.BufferGeometry[] = [
    trunkGeo(trunkH, r * 0.09, r * 0.055, segs, trunkC),
  ]

  if (lod === 1) {
    parts.push(canopySphere(r * 0.85, trunkH + r * 0.35, segs, canopyC, 1.15, 0.7, 1.15))
  } else {
    parts.push(canopySphere(r * 0.7, trunkH + r * 0.45, segs, canopyC, 1.2, 0.75, 1.2))
    parts.push(canopySphere(r * 0.45, trunkH + r * 0.15, segs, canopyC, 1.1, 0.65, 1.0))
    parts.push(canopySphere(r * 0.4, trunkH + r * 0.7, segs, canopyC, 1.0, 0.6, 1.0))
    parts.push(flowerBlob(r * 0.18, trunkH + r * 0.55, accent, segs))
  }
  return merge(parts)
}

function buildPhuongVi(def: SpeciesDef, lod: VegetationLod): THREE.BufferGeometry {
  const h = def.height
  const r = def.canopyRadius
  const segs = radialForLod(lod)
  if (lod === 2) {
    return merge([
      trunkGeo(h * 0.45, r * 0.07, r * 0.04, 4, def.trunkColor),
      crossPlanes(r * 1.8, h * 0.5, h * 0.35, def.accentColor ?? def.canopyColor),
    ])
  }
  const trunkH = h * 0.4
  const parts: THREE.BufferGeometry[] = [
    trunkGeo(trunkH, r * 0.08, r * 0.05, segs, def.trunkColor),
    canopySphere(r * 0.95, trunkH + r * 0.25, segs, def.canopyColor, 1.35, 0.45, 1.35),
  ]
  if (lod === 0) {
    parts.push(flowerBlob(r * 0.35, trunkH + r * 0.35, def.accentColor ?? '#E6392B', segs))
    parts.push(flowerBlob(r * 0.22, trunkH + r * 0.15, def.accentColor ?? '#FF6B35', segs))
  }
  return merge(parts)
}

function buildNgoDong(def: SpeciesDef, lod: VegetationLod): THREE.BufferGeometry {
  const h = def.height
  const r = def.canopyRadius
  const segs = radialForLod(lod)
  if (lod === 2) {
    return merge([
      trunkGeo(h * 0.6, r * 0.1, r * 0.07, 4, def.trunkColor),
      crossPlanes(r * 1.5, h * 0.4, h * 0.55, def.canopyColor),
    ])
  }
  const trunkH = h * 0.6
  const parts: THREE.BufferGeometry[] = [
    trunkGeo(trunkH, r * 0.11, r * 0.08, segs, def.trunkColor),
    canopySphere(r * 0.9, trunkH + r * 0.2, segs, def.canopyColor, 1.25, 0.55, 1.25),
  ]
  if (lod === 0) {
    parts.push(flowerBlob(r * 0.2, trunkH + r * 0.35, def.accentColor ?? '#C48BB8', segs))
  }
  return merge(parts)
}

function buildSuDai(def: SpeciesDef, lod: VegetationLod): THREE.BufferGeometry {
  const h = def.height
  const r = def.canopyRadius
  const segs = radialForLod(lod)
  if (lod === 2) {
    return merge([
      trunkGeo(h * 0.5, r * 0.12, r * 0.08, 4, def.trunkColor),
      crossPlanes(r * 1.4, h * 0.55, h * 0.35, def.canopyColor),
    ])
  }
  const trunkH = h * 0.45
  const parts: THREE.BufferGeometry[] = [
    trunkGeo(trunkH, r * 0.14, r * 0.1, segs, def.trunkColor),
    canopySphere(r * 0.75, trunkH + r * 0.35, segs, def.canopyColor, 1.1, 0.85, 1.1),
  ]
  if (lod === 0) {
    const flower = def.accentColor ?? '#FFF8E7'
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2
      const g = flowerBlob(r * 0.12, trunkH + r * 0.5, flower, segs)
      g.translate(Math.cos(a) * r * 0.35, 0, Math.sin(a) * r * 0.35)
      parts.push(g)
    }
  }
  return merge(parts)
}

function buildTre(def: SpeciesDef, lod: VegetationLod): THREE.BufferGeometry {
  const h = def.height
  const segs = lod === 2 ? 3 : radialForLod(lod)
  const culms = lod === 0 ? 5 : lod === 1 ? 3 : 1
  const parts: THREE.BufferGeometry[] = []
  for (let i = 0; i < culms; i++) {
    const a = (i / Math.max(culms, 1)) * Math.PI * 2
    const ox = Math.cos(a) * 0.35 * (i > 0 ? 1 : 0)
    const oz = Math.sin(a) * 0.35 * (i > 0 ? 1 : 0)
    const hh = h * (0.85 + (i % 3) * 0.05)
    const g = trunkGeo(hh, 0.06, 0.04, segs, def.trunkColor)
    g.translate(ox, 0, oz)
    parts.push(g)
    if (lod < 2) {
      const tip = canopyCone(0.35, 0.8, hh - 0.4, segs, def.canopyColor)
      tip.translate(ox, 0, oz)
      parts.push(tip)
    }
  }
  if (lod === 2) {
    parts.push(crossPlanes(def.canopyRadius * 1.2, h * 0.35, h * 0.6, def.canopyColor))
  }
  return merge(parts)
}

function buildThong(def: SpeciesDef, lod: VegetationLod): THREE.BufferGeometry {
  const h = def.height
  const r = def.canopyRadius
  const segs = radialForLod(lod)
  if (lod === 2) {
    return merge([
      trunkGeo(h * 0.35, r * 0.08, r * 0.05, 4, def.trunkColor),
      canopyCone(r * 0.9, h * 0.7, h * 0.28, 4, def.canopyColor),
    ])
  }
  const trunkH = h * 0.3
  const layers = lod === 0 ? 4 : 3
  const parts: THREE.BufferGeometry[] = [
    trunkGeo(trunkH + h * 0.15, r * 0.09, r * 0.05, segs, def.trunkColor),
  ]
  for (let i = 0; i < layers; i++) {
    const t = i / (layers - 1)
    const y = trunkH + t * h * 0.55
    const rr = r * (1.0 - t * 0.55)
    parts.push(canopyCone(rr, h * 0.22, y, segs, def.canopyColor))
  }
  return merge(parts)
}

function buildSen(def: SpeciesDef, lod: VegetationLod): THREE.BufferGeometry {
  const segs = radialForLod(lod)
  const stemH = def.height * 0.7
  const leafR = def.canopyRadius
  if (lod === 2) {
    return merge([
      trunkGeo(stemH, 0.02, 0.015, 3, def.trunkColor),
      leafDisk(leafR * 0.9, stemH, 6, def.canopyColor),
    ])
  }
  const parts: THREE.BufferGeometry[] = [
    trunkGeo(stemH, 0.025, 0.018, segs, def.trunkColor),
    leafDisk(leafR, stemH * 0.55, segs * 2, def.canopyColor),
  ]
  const flowerY = stemH + 0.15
  parts.push(canopyCone(0.12, 0.22, flowerY, segs, def.accentColor ?? '#F7F2E8'))
  if (lod === 0) {
    parts.push(leafDisk(leafR * 0.7, stemH * 0.35, segs * 2, def.canopyColor))
  }
  return merge(parts)
}

function buildSung(def: SpeciesDef, lod: VegetationLod): THREE.BufferGeometry {
  const segs = radialForLod(lod)
  const leafR = def.canopyRadius
  const y = 0.02
  if (lod === 2) {
    return leafDisk(leafR, y, 6, def.canopyColor)
  }
  const parts: THREE.BufferGeometry[] = [
    leafDisk(leafR, y, segs * 2, def.canopyColor),
  ]
  if (lod === 0) {
    parts.push(flowerBlob(0.08, y + 0.06, def.accentColor ?? '#7B5EA7', segs))
  } else {
    parts.push(canopyCone(0.07, 0.08, y + 0.02, segs, def.accentColor ?? '#7B5EA7'))
  }
  return merge(parts)
}

const builders: Record<
  VegetationSpeciesId,
  (def: SpeciesDef, lod: VegetationLod) => THREE.BufferGeometry
> = {
  tree_nhan: buildGenericTree,
  tree_phuong_vi: buildPhuongVi,
  tree_ngo_dong: buildNgoDong,
  tree_su_dai: buildSuDai,
  tree_tre: buildTre,
  plant_sen: buildSen,
  plant_sung: buildSung,
  tree_thong: buildThong,
}

const cache = new Map<string, THREE.BufferGeometry>()

/**
 * Procedural stylized plant geometry. LOD0 near / LOD1 mid / LOD2 far-billboard.
 * Không dùng GLB.
 */
export function createPlantGeometry(
  id: VegetationSpeciesId,
  lod: VegetationLod,
): THREE.BufferGeometry {
  const key = `${id}:${lod}`
  const hit = cache.get(key)
  if (hit) return hit

  const def = SPECIES[id]
  const geo = builders[id](def, lod)
  geo.name = `veg_${id}_lod${lod}`
  cache.set(key, geo)
  return geo
}

export function disposePlantGeometryCache(): void {
  for (const g of cache.values()) g.dispose()
  cache.clear()
}
