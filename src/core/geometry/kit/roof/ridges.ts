import * as THREE from 'three'
import { uvRepeat } from '../uvMeters'
import { cornerXZ, ridgeEndForCorner, sampleRoof } from './math'
import { mergeKit } from './merge'
import type { RoofFrame } from './types'

const TILE = uvRepeat('vangThep')

function liftSample(x: number, z: number, f: RoofFrame, dy: number): THREE.Vector3 {
  const p = sampleRoof(x, z, f, TILE.u, TILE.v)
  return new THREE.Vector3(p.x, p.y + dy, p.z)
}

function pathAlongRidge(f: RoofFrame, steps: number, dy: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const s = (t * 2 - 1) * f.ridgeHalf
    if (f.ridgeAlongX) pts.push(liftSample(s, 0, f, dy))
    else pts.push(liftSample(0, s, f, dy))
  }
  return pts
}

function pathHip(corner: 0 | 1 | 2 | 3, f: RoofFrame, steps: number, dy: number): THREE.Vector3[] {
  const a = ridgeEndForCorner(corner, f)
  const b = cornerXZ(corner, f)
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    pts.push(liftSample(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t, f, dy))
  }
  return pts
}

function tubeAlong(pts: THREE.Vector3[], radius: number, tubular: number, radial: number): THREE.BufferGeometry | null {
  if (pts.length < 2) return null
  const curve = new THREE.CatmullRomCurve3(pts)
  const geo = new THREE.TubeGeometry(curve, tubular, radius, radial, false)
  const uv = geo.getAttribute('uv')
  const len = curve.getLength()
  for (let i = 0; i < uv.count; i++) {
    uv.setX(i, (uv.getX(i) * len) / TILE.u)
    uv.setY(i, (uv.getY(i) * radius * Math.PI * 2) / TILE.v)
  }
  uv.needsUpdate = true
  return geo
}

function boxAlong(pts: THREE.Vector3[], width: number, height: number): THREE.BufferGeometry | null {
  if (pts.length < 2) return null
  const a = pts[0]
  const b = pts[pts.length - 1]
  const dir = new THREE.Vector3().subVectors(b, a)
  const len = dir.length()
  if (len < 1e-4) return null
  const geo = new THREE.BoxGeometry(len, height, width)
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir.clone().normalize())
  geo.applyMatrix4(new THREE.Matrix4().compose(mid, quat, new THREE.Vector3(1, 1, 1)))
  return geo
}

/**
 * Sống nóc + 4 sống góc.
 * LOD0 tube profile; LOD1 box; LOD2 1 box mỏng trên sống.
 */
export function buildRidgeGeo(f: RoofFrame): THREE.BufferGeometry | null {
  const geos: THREE.BufferGeometry[] = []

  if (f.lod === 2) {
    const pts = pathAlongRidge(f, 2, 0.04)
    const box = boxAlong(pts, 0.16, 0.08)
    if (box) geos.push(box)
    return mergeKit(geos)
  }

  const mainSteps = f.lod === 0 ? 10 : 4
  const hipSteps = f.lod === 0 ? 8 : 3
  const mainR = f.lod === 0 ? 0.075 : 0.06
  const hipR = f.lod === 0 ? 0.052 : 0.04
  const radial = f.lod === 0 ? 7 : 4
  const dy = 0.055

  if (f.lod === 0) {
    const main = tubeAlong(pathAlongRidge(f, mainSteps, dy), mainR, mainSteps * 2, radial)
    if (main) geos.push(main)
    const bead = tubeAlong(pathAlongRidge(f, mainSteps, dy + 0.055), mainR * 0.55, mainSteps * 2, 5)
    if (bead) geos.push(bead)
    for (const i of [0, 1, 2, 3] as const) {
      const hip = tubeAlong(pathHip(i, f, hipSteps, dy * 0.85), hipR, hipSteps * 2, radial)
      if (hip) geos.push(hip)
    }
  } else {
    const main = boxAlong(pathAlongRidge(f, 2, dy), 0.18, 0.1)
    if (main) geos.push(main)
    for (const i of [0, 1, 2, 3] as const) {
      const hip = boxAlong(pathHip(i, f, 2, dy * 0.8), 0.1, 0.07)
      if (hip) geos.push(hip)
    }
  }

  return mergeKit(geos)
}

/** Móc đầu đao — 4 góc, gộp vào sống (cùng `vang_thep`). LOD0 only. */
export function buildDaoTips(f: RoofFrame): THREE.BufferGeometry | null {
  if (f.lod !== 0) return null
  const s = Math.min(f.halfW, f.halfD) * 0.12
  const geos: THREE.BufferGeometry[] = []
  for (const i of [0, 1, 2, 3] as const) {
    const c = cornerXZ(i, f)
    const p = sampleRoof(c.x, c.z, f, TILE.u, TILE.v)
    const sx = Math.sign(c.x) || 1
    const sz = Math.sign(c.z) || 1
    const pts = [
      new THREE.Vector3(p.x, p.y + 0.02, p.z),
      new THREE.Vector3(p.x + sx * s * 0.35, p.y + s * 0.45, p.z + sz * s * 0.35),
      new THREE.Vector3(p.x + sx * s * 0.7, p.y + s * 0.95, p.z + sz * s * 0.7),
    ]
    const tip = tubeAlong(pts, 0.035 * Math.max(0.6, s), 6, 5)
    if (tip) geos.push(tip)
  }
  return mergeKit(geos)
}
