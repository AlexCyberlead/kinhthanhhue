import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export type PropLod = 0 | 1 | 2
export type PropKind = 'long' | 'co' | 'kieu'

const WOOD = '#5C4033'
const WOOD_DARK = '#3E2723'
const GOLD = '#D4AF37'
const RED = '#C62828'
const YELLOW = '#E8B923'
const FABRIC = '#8B1E1E'
const FABRIC_GOLD = '#C9A227'
const ROOF = '#1A4B8C'

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

function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(parts, false)
  if (!merged) throw new Error('props: mergeGeometries failed')
  merged.computeVertexNormals()
  return merged
}

function radial(lod: PropLod): number {
  return lod === 0 ? 8 : lod === 1 ? 6 : 4
}

/** Lọng — dù / lọng nghi lễ (cột + tán + đỉnh). */
export function createLongGeometry(lod: PropLod): THREE.BufferGeometry {
  const segs = radial(lod)
  const poleH = 2.4
  const parts: THREE.BufferGeometry[] = []

  const pole = new THREE.CylinderGeometry(0.025, 0.035, poleH, segs, 1)
  pole.translate(0, poleH / 2, 0)
  parts.push(paint(pole, WOOD))

  if (lod < 2) {
    const finial = new THREE.SphereGeometry(0.06, segs, Math.max(4, segs / 2))
    finial.translate(0, poleH + 0.04, 0)
    parts.push(paint(finial, GOLD))
  }

  if (lod === 2) {
    const canopy = new THREE.ConeGeometry(0.55, 0.22, 4)
    canopy.translate(0, poleH - 0.05, 0)
    parts.push(paint(canopy, RED))
  } else {
    const canopy = new THREE.ConeGeometry(0.65, 0.28, segs)
    canopy.translate(0, poleH - 0.08, 0)
    parts.push(paint(canopy, RED))

    if (lod === 0) {
      const rim = new THREE.TorusGeometry(0.62, 0.018, 4, segs)
      rim.rotateX(Math.PI / 2)
      rim.translate(0, poleH - 0.2, 0)
      parts.push(paint(rim, GOLD))

      const under = new THREE.ConeGeometry(0.5, 0.12, segs)
      under.translate(0, poleH - 0.22, 0)
      parts.push(paint(under, FABRIC_GOLD))
    }
  }

  return merge(parts)
}

/** Cờ xí — cột + lá cờ (plane gấp đôi cho thickness-ish). */
export function createCoGeometry(lod: PropLod): THREE.BufferGeometry {
  const segs = radial(lod)
  const poleH = 3.2
  const parts: THREE.BufferGeometry[] = []

  const pole = new THREE.CylinderGeometry(0.03, 0.04, poleH, segs, 1)
  pole.translate(0, poleH / 2, 0)
  parts.push(paint(pole, WOOD_DARK))

  const flagW = lod === 2 ? 0.7 : 0.9
  const flagH = lod === 2 ? 0.45 : 0.55
  const flagY = poleH - flagH * 0.55

  const flag = new THREE.PlaneGeometry(flagW, flagH, lod === 0 ? 2 : 1, 1)
  flag.translate(flagW * 0.5 + 0.02, flagY, 0)
  parts.push(paint(flag, RED))

  if (lod < 2) {
    const back = flag.clone()
    back.rotateY(Math.PI)
    // clone loses paint? PlaneGeometry clone keeps attributes. Re-paint to be safe.
    parts.push(paint(back, YELLOW))

    // Horizontal streamer band
    const band = new THREE.PlaneGeometry(flagW * 0.9, flagH * 0.12)
    band.translate(flagW * 0.5 + 0.02, flagY + flagH * 0.15, 0.01)
    parts.push(paint(band, GOLD))
  }

  if (lod === 0) {
    const tip = new THREE.ConeGeometry(0.05, 0.12, 5)
    tip.translate(0, poleH + 0.05, 0)
    parts.push(paint(tip, GOLD))
  }

  return merge(parts)
}

/** Kiệu — kiệu vua / kiệu rước (cabin + đòn khiêng + mái). */
export function createKieuGeometry(lod: PropLod): THREE.BufferGeometry {
  const segs = radial(lod)
  const parts: THREE.BufferGeometry[] = []

  // Floor platform
  const floor = new THREE.BoxGeometry(1.1, 0.08, 0.7)
  floor.translate(0, 0.55, 0)
  parts.push(paint(floor, WOOD))

  // Cabin walls (open sides stylized as thin boxes)
  if (lod < 2) {
    const wallH = lod === 0 ? 0.7 : 0.55
    const left = new THREE.BoxGeometry(0.06, wallH, 0.65)
    left.translate(-0.5, 0.55 + wallH / 2 + 0.04, 0)
    parts.push(paint(left, FABRIC))

    const right = left.clone()
    right.translate(1.0, 0, 0)
    parts.push(paint(right, FABRIC))

    const back = new THREE.BoxGeometry(1.0, wallH, 0.06)
    back.translate(0, 0.55 + wallH / 2 + 0.04, -0.32)
    parts.push(paint(back, FABRIC))
  } else {
    const box = new THREE.BoxGeometry(1.0, 0.5, 0.6)
    box.translate(0, 0.85, 0)
    parts.push(paint(box, FABRIC))
  }

  // Roof
  if (lod === 2) {
    const roof = new THREE.BoxGeometry(1.2, 0.08, 0.8)
    roof.translate(0, 1.15, 0)
    parts.push(paint(roof, ROOF))
  } else {
    const roof = new THREE.ConeGeometry(0.85, 0.35, segs)
    roof.translate(0, 1.45, 0)
    // Flatten to hip-ish by scaling
    roof.scale(1.15, 1, 0.75)
    parts.push(paint(roof, ROOF))

    if (lod === 0) {
      const ridge = new THREE.SphereGeometry(0.07, segs, 4)
      ridge.translate(0, 1.65, 0)
      parts.push(paint(ridge, GOLD))
    }
  }

  // Carry poles (đòn khiêng) — axis X
  const poleLen = lod === 2 ? 2.4 : 2.8
  const poleR = lod === 2 ? 0.035 : 0.04
  const mkPole = (z: number) => {
    const p = new THREE.CylinderGeometry(poleR, poleR, poleLen, segs, 1)
    p.rotateZ(Math.PI / 2)
    p.translate(0, 0.62, z)
    return paint(p, WOOD_DARK)
  }
  parts.push(mkPole(0.28), mkPole(-0.28))

  // Short legs
  if (lod < 2) {
    const legH = 0.5
    const positions: [number, number][] = [
      [-0.4, 0.25],
      [0.4, 0.25],
      [-0.4, -0.25],
      [0.4, -0.25],
    ]
    for (const [lx, lz] of positions) {
      const leg = new THREE.CylinderGeometry(0.03, 0.04, legH, 4, 1)
      leg.translate(lx, legH / 2, lz)
      parts.push(paint(leg, WOOD))
    }
  }

  return merge(parts)
}

const geoCache = new Map<string, THREE.BufferGeometry>()

export function createPropGeometry(kind: PropKind, lod: PropLod): THREE.BufferGeometry {
  const key = `${kind}_${lod}`
  const hit = geoCache.get(key)
  if (hit) return hit

  let geo: THREE.BufferGeometry
  switch (kind) {
    case 'long':
      geo = createLongGeometry(lod)
      break
    case 'co':
      geo = createCoGeometry(lod)
      break
    case 'kieu':
      geo = createKieuGeometry(lod)
      break
  }
  geo.name = `prop_${key}`
  geoCache.set(key, geo)
  return geo
}

export function disposePropGeometryCache(): void {
  for (const g of geoCache.values()) g.dispose()
  geoCache.clear()
}

export const PROP_KINDS: readonly PropKind[] = ['long', 'co', 'kieu']
