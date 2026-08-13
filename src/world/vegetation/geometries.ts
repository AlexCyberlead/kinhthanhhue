import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { SpeciesDef, VegetationLod, VegetationSpeciesId } from './types'
import { SPECIES } from './species'

function hash3(x: number, y: number, z: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453
  return s - Math.floor(s)
}

function paint(geo: THREE.BufferGeometry, hex: string, jitter = 0.1): THREE.BufferGeometry {
  const color = new THREE.Color(hex)
  const count = geo.attributes.position.count
  const colors = new Float32Array(count * 3)
  const pos = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < count; i++) {
    const j = jitter * (hash3(pos.getX(i), pos.getY(i), pos.getZ(i)) - 0.5)
    colors[i * 3] = THREE.MathUtils.clamp(color.r * (1 + j), 0, 1)
    colors[i * 3 + 1] = THREE.MathUtils.clamp(color.g * (1 + j * 0.75), 0, 1)
    colors[i * 3 + 2] = THREE.MathUtils.clamp(color.b * (1 + j * 0.45), 0, 1)
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
  x = 0,
  z = 0,
): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial, 1)
  g.translate(x, height / 2, z)
  return paint(g, color, 0.06)
}

function canopyBlob(
  radius: number,
  y: number,
  segs: number,
  color: string,
  sx = 1,
  sy = 1,
  sz = 1,
  x = 0,
  z = 0,
): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(radius, segs, Math.max(4, (segs / 2) | 0))
  g.scale(sx, sy, sz)
  g.translate(x, y, z)
  return paint(g, color)
}

function leafCard(
  width: number,
  height: number,
  x: number,
  y: number,
  z: number,
  rotY: number,
  tilt: number,
  color: string,
): THREE.BufferGeometry {
  const g = new THREE.PlaneGeometry(width, height, 1, 2)
  const pos = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) > 0) pos.setX(i, pos.getX(i) * 0.62)
  }
  g.rotateX(tilt)
  g.rotateY(rotY)
  g.translate(x, y, z)
  return paint(g, color, 0.14)
}

function crossPlanes(
  width: number,
  height: number,
  yBase: number,
  color: string,
): THREE.BufferGeometry {
  const mk = (rotY: number) => {
    const g = new THREE.PlaneGeometry(width, height)
    g.translate(0, yBase + height / 2, 0)
    g.rotateY(rotY)
    return paint(g, color, 0.12)
  }
  return mergeGeometries([mk(0), mk(Math.PI / 2)], false)!
}

function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(parts, false)
  if (!merged) throw new Error('vegetation: mergeGeometries failed')
  merged.computeVertexNormals()
  return merged
}

function radialForLod(lod: VegetationLod): number {
  return lod === 0 ? 7 : lod === 1 ? 5 : 4
}

function pushClusters(
  parts: THREE.BufferGeometry[],
  count: number,
  y: number,
  radius: number,
  segs: number,
  color: string,
  flatten: number,
): void {
  for (let i = 0; i < count; i++) {
    const a = (i * 2.399963) % (Math.PI * 2)
    const elev = ((i * 0.41) % 1) * 0.85 - 0.18
    const dist = radius * (0.22 + (i % 4) * 0.11)
    const rr = radius * (0.34 + (i % 5) * 0.055)
    parts.push(
      canopyBlob(
        rr,
        y + elev * radius * 0.55,
        segs,
        color,
        1.18,
        flatten,
        1.18,
        Math.cos(a) * dist,
        Math.sin(a) * dist,
      ),
    )
  }
}

function pushLeafCards(
  parts: THREE.BufferGeometry[],
  count: number,
  y: number,
  radius: number,
  color: string,
): void {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + 0.2
    const dist = radius * (0.55 + (i % 3) * 0.12)
    parts.push(
      leafCard(
        radius * 0.55,
        radius * 0.42,
        Math.cos(a) * dist,
        y + ((i % 3) - 1) * radius * 0.12,
        Math.sin(a) * dist,
        a,
        -0.55,
        color,
      ),
    )
  }
}

function buildBroadleaf(def: SpeciesDef, lod: VegetationLod, flatten: number, trunkRatio: number): THREE.BufferGeometry {
  const h = def.height
  const r = def.canopyRadius
  const segs = radialForLod(lod)
  if (lod === 2) {
    return merge([
      trunkGeo(h * 0.55, r * 0.08, r * 0.05, 4, def.trunkColor),
      crossPlanes(r * 1.7, h * 0.5, h * 0.42, def.canopyColor),
    ])
  }

  const trunkH = h * trunkRatio
  const parts: THREE.BufferGeometry[] = [
    trunkGeo(trunkH, r * 0.1, r * 0.055, segs, def.trunkColor),
  ]
  const clusterN = lod === 0 ? 7 : 3
  pushClusters(parts, clusterN, trunkH + r * 0.28, r, segs, def.canopyColor, flatten)
  if (lod === 0) {
    pushLeafCards(parts, 6, trunkH + r * 0.32, r, def.canopyColor)
    if (def.accentColor) {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4
        parts.push(
          canopyBlob(
            r * 0.12,
            trunkH + r * 0.42,
            segs,
            def.accentColor,
            1.2,
            0.55,
            1.2,
            Math.cos(a) * r * 0.35,
            Math.sin(a) * r * 0.35,
          ),
        )
      }
    }
  }
  return merge(parts)
}

function buildPhuongVi(def: SpeciesDef, lod: VegetationLod): THREE.BufferGeometry {
  const h = def.height
  const r = def.canopyRadius
  const segs = radialForLod(lod)
  if (lod === 2) {
    return merge([
      trunkGeo(h * 0.4, r * 0.07, r * 0.04, 4, def.trunkColor),
      crossPlanes(r * 2.1, h * 0.38, h * 0.38, def.accentColor ?? def.canopyColor),
    ])
  }
  const trunkH = h * 0.36
  const parts: THREE.BufferGeometry[] = [
    trunkGeo(trunkH, r * 0.085, r * 0.045, segs, def.trunkColor),
  ]
  const n = lod === 0 ? 8 : 4
  for (let i = 0; i < n; i++) {
    const a = (i * 2.399963) % (Math.PI * 2)
    const dist = r * (0.35 + (i % 3) * 0.14)
    parts.push(
      canopyBlob(
        r * (0.32 + (i % 4) * 0.04),
        trunkH + r * 0.12 + (i % 2) * r * 0.06,
        segs,
        def.canopyColor,
        1.45,
        0.38,
        1.45,
        Math.cos(a) * dist,
        Math.sin(a) * dist,
      ),
    )
  }
  if (lod === 0) {
    pushLeafCards(parts, 7, trunkH + r * 0.16, r * 1.05, def.canopyColor)
    const bloom = def.accentColor ?? '#E6392B'
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      parts.push(
        canopyBlob(
          r * 0.16,
          trunkH + r * 0.22,
          segs,
          bloom,
          1.3,
          0.4,
          1.3,
          Math.cos(a) * r * 0.45,
          Math.sin(a) * r * 0.45,
        ),
      )
    }
  }
  return merge(parts)
}

function buildNgoDong(def: SpeciesDef, lod: VegetationLod): THREE.BufferGeometry {
  const h = def.height
  const r = def.canopyRadius
  const segs = radialForLod(lod)
  if (lod === 2) {
    return merge([
      trunkGeo(h * 0.62, r * 0.09, r * 0.06, 4, def.trunkColor),
      crossPlanes(r * 1.45, h * 0.36, h * 0.58, def.canopyColor),
    ])
  }
  const trunkH = h * 0.62
  const parts: THREE.BufferGeometry[] = [
    trunkGeo(trunkH, r * 0.1, r * 0.06, segs, def.trunkColor),
  ]
  pushClusters(parts, lod === 0 ? 6 : 3, trunkH + r * 0.18, r * 0.95, segs, def.canopyColor, 0.55)
  if (lod === 0) {
    pushLeafCards(parts, 5, trunkH + r * 0.22, r, def.canopyColor)
    const bloom = def.accentColor ?? '#C48BB8'
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3
      parts.push(
        canopyBlob(
          r * 0.1,
          trunkH + r * 0.38,
          segs,
          bloom,
          1.1,
          0.5,
          1.1,
          Math.cos(a) * r * 0.28,
          Math.sin(a) * r * 0.28,
        ),
      )
    }
  }
  return merge(parts)
}

function buildSuDai(def: SpeciesDef, lod: VegetationLod): THREE.BufferGeometry {
  const h = def.height
  const r = def.canopyRadius
  const segs = radialForLod(lod)
  if (lod === 2) {
    return merge([
      trunkGeo(h * 0.45, r * 0.12, r * 0.08, 4, def.trunkColor),
      crossPlanes(r * 1.35, h * 0.5, h * 0.32, def.canopyColor),
    ])
  }
  const trunkH = h * 0.32
  const parts: THREE.BufferGeometry[] = [
    trunkGeo(trunkH, r * 0.14, r * 0.09, segs, def.trunkColor),
  ]
  const arms = lod === 0 ? 4 : 3
  for (let i = 0; i < arms; i++) {
    const a = (i / arms) * Math.PI * 2 + 0.2
    const len = h * 0.42
    const arm = new THREE.CylinderGeometry(r * 0.045, r * 0.07, len, segs, 1)
    arm.rotateZ(0.55)
    arm.rotateY(a)
    arm.translate(Math.cos(a) * r * 0.28, trunkH + len * 0.28, Math.sin(a) * r * 0.28)
    parts.push(paint(arm, def.trunkColor, 0.05))
    parts.push(
      canopyBlob(
        r * 0.32,
        trunkH + h * 0.38,
        segs,
        def.canopyColor,
        1.05,
        0.7,
        1.05,
        Math.cos(a) * r * 0.55,
        Math.sin(a) * r * 0.55,
      ),
    )
    if (lod === 0 && def.accentColor) {
      parts.push(
        canopyBlob(
          r * 0.1,
          trunkH + h * 0.46,
          segs,
          def.accentColor,
          1.2,
          0.45,
          1.2,
          Math.cos(a) * r * 0.5,
          Math.sin(a) * r * 0.5,
        ),
      )
    }
  }
  return merge(parts)
}

function buildTre(def: SpeciesDef, lod: VegetationLod): THREE.BufferGeometry {
  const h = def.height
  const segs = lod === 2 ? 3 : radialForLod(lod)
  const culms = lod === 0 ? 6 : lod === 1 ? 4 : 2
  const parts: THREE.BufferGeometry[] = []
  for (let i = 0; i < culms; i++) {
    const a = (i / Math.max(culms, 1)) * Math.PI * 2
    const ox = Math.cos(a) * 0.42 * (i > 0 ? 1 : 0)
    const oz = Math.sin(a) * 0.42 * (i > 0 ? 1 : 0)
    const hh = h * (0.78 + (i % 4) * 0.06)
    parts.push(trunkGeo(hh, 0.045, 0.028, segs, def.trunkColor, ox, oz))
    if (lod < 2) {
      const sprays = lod === 0 ? 4 : 2
      for (let s = 0; s < sprays; s++) {
        const ty = hh * (0.55 + s * 0.12)
        const sa = a + s * 0.9
        parts.push(
          leafCard(0.7, 0.16, ox + Math.cos(sa) * 0.18, ty, oz + Math.sin(sa) * 0.18, sa, -0.15, def.canopyColor),
        )
      }
    }
  }
  if (lod === 2) {
    parts.push(crossPlanes(def.canopyRadius * 1.3, h * 0.4, h * 0.55, def.canopyColor))
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
      crossPlanes(r * 1.2, h * 0.65, h * 0.28, def.canopyColor),
    ])
  }
  const trunkH = h * 0.28
  const layers = lod === 0 ? 5 : 3
  const parts: THREE.BufferGeometry[] = [
    trunkGeo(h * 0.72, r * 0.09, r * 0.04, segs, def.trunkColor),
  ]
  for (let i = 0; i < layers; i++) {
    const t = i / (layers - 1)
    const y = trunkH + t * h * 0.58
    const rr = r * (1.05 - t * 0.62)
    const cone = new THREE.ConeGeometry(rr, h * 0.2, segs)
    cone.translate(((i * 17) % 5) * 0.04 - 0.08, y + h * 0.08, ((i * 13) % 5) * 0.03 - 0.06)
    parts.push(paint(cone, def.canopyColor, 0.08))
  }
  return merge(parts)
}

/** Lá sen chén — mép nhô, giữa trũng. */
export function createLotusLeafGeometry(radius: number, segs: number, color?: string): THREE.BufferGeometry {
  const g = new THREE.CircleGeometry(radius, segs)
  const pos = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const rr = Math.hypot(x, y) / Math.max(1e-4, radius)
    pos.setZ(i, rr * rr * radius * 0.22 - (1 - rr) * radius * 0.04)
  }
  g.rotateX(-Math.PI / 2)
  g.computeVertexNormals()
  return color ? paint(g, color, 0.12) : g
}

/** Hoa sen: vòng cánh + nhụy. */
export function createLotusBloomGeometry(lod: VegetationLod, petal = '#F0E2CC', ovary = '#D4A017'): THREE.BufferGeometry {
  const n = lod === 0 ? 8 : 6
  const parts: THREE.BufferGeometry[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const p = new THREE.ConeGeometry(0.075, 0.2, 5)
    p.translate(0, 0.1, 0)
    p.rotateX(-0.95)
    p.rotateY(a)
    p.translate(Math.cos(a) * 0.05, 0.015, Math.sin(a) * 0.05)
    parts.push(paint(p, petal, 0.06))
  }
  if (lod === 0) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.PI / n
      const p = new THREE.ConeGeometry(0.055, 0.14, 5)
      p.translate(0, 0.07, 0)
      p.rotateX(-0.55)
      p.rotateY(a)
      p.translate(Math.cos(a) * 0.025, 0.05, Math.sin(a) * 0.025)
      parts.push(paint(p, petal, 0.05))
    }
  }
  const core = new THREE.SphereGeometry(0.04, 6, 4)
  core.translate(0, 0.07, 0)
  parts.push(paint(core, ovary, 0.04))
  return merge(parts)
}

function buildSen(def: SpeciesDef, lod: VegetationLod): THREE.BufferGeometry {
  const segs = radialForLod(lod)
  const stemH = def.height * 0.72
  const leafR = def.canopyRadius
  if (lod === 2) {
    return merge([
      trunkGeo(stemH, 0.018, 0.012, 3, def.trunkColor),
      createLotusLeafGeometry(leafR * 0.9, 6, def.canopyColor),
    ])
  }
  const leaf = createLotusLeafGeometry(leafR, segs * 2, def.canopyColor)
  leaf.translate(0, stemH * 0.52, 0)
  const parts: THREE.BufferGeometry[] = [
    trunkGeo(stemH, 0.022, 0.014, segs, def.trunkColor),
    leaf,
    createLotusBloomGeometry(lod, def.accentColor ?? '#F0E2CC'),
  ]
  parts[2]!.translate(0, stemH + 0.04, 0)
  if (lod === 0) {
    const leaf2 = createLotusLeafGeometry(leafR * 0.62, segs * 2, def.canopyColor)
    leaf2.translate(0.18, stemH * 0.28, -0.12)
    parts.push(leaf2)
  }
  return merge(parts)
}

function buildSung(def: SpeciesDef, lod: VegetationLod): THREE.BufferGeometry {
  const segs = radialForLod(lod) * 2
  const leafR = def.canopyRadius
  const pad = new THREE.CircleGeometry(leafR, segs, 0.4, Math.PI * 2 - 0.85)
  const pos = pad.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const rr = Math.hypot(x, y) / Math.max(1e-4, leafR)
    pos.setZ(i, (1 - rr) * 0.03)
  }
  pad.rotateX(-Math.PI / 2)
  pad.translate(0, 0.02, 0)
  if (lod === 2) return paint(pad, def.canopyColor, 0.1)
  const parts: THREE.BufferGeometry[] = [paint(pad, def.canopyColor, 0.1)]
  if (lod === 0) {
    const bloom = createLotusBloomGeometry(1, def.accentColor ?? '#7B5EA7', '#C9A227')
    bloom.scale(0.7, 0.7, 0.7)
    bloom.translate(0, 0.06, 0)
    parts.push(bloom)
  } else {
    parts.push(canopyBlob(0.07, 0.07, segs, def.accentColor ?? '#7B5EA7', 1, 0.5, 1))
  }
  return merge(parts)
}

const builders: Record<
  VegetationSpeciesId,
  (def: SpeciesDef, lod: VegetationLod) => THREE.BufferGeometry
> = {
  tree_nhan: (def, lod) => buildBroadleaf(def, lod, 0.68, 0.5),
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
 * Procedural stylized plant geometry. LOD0 clusters+cards / LOD1 masses / LOD2 cross-plane.
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
