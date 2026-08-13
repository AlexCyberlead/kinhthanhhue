import * as THREE from 'three'
import { getMaterial } from '../../materials/MaterialLibrary'
import { mergeKit, meshOf } from './roof/merge'

export type OrnamentLod = 0 | 1 | 2

function sCurve(len: number, scale: number, segs: number, yaw = 0.55, heave = 0.38): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const x = (t - 0.02) * len
    const y = Math.sin(t * Math.PI) * heave * scale + Math.sin(t * Math.PI * 2) * 0.1 * scale
    const z = Math.sin(t * Math.PI * 1.15) * yaw * scale
    pts.push(new THREE.Vector3(x, y, z))
  }
  return pts
}

function tube(pts: THREE.Vector3[], radius: number, tubular: number, radial: number): THREE.BufferGeometry {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), tubular, radius, radial, false)
}

function boxAt(w: number, h: number, d: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d)
  g.rotateX(rx)
  g.rotateY(ry)
  g.rotateZ(rz)
  g.translate(x, y, z)
  return g
}

function coneAt(r: number, h: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, segs = 6): THREE.BufferGeometry {
  const g = new THREE.ConeGeometry(r, h, segs)
  g.rotateX(rx)
  g.rotateY(ry)
  g.rotateZ(rz)
  g.translate(x, y, z)
  return g
}

/** Lưỡng long — thân S + đầu sừng + chân mây. Cấm capsule/sphere làm thân. */
export function dragonOrnamentGeo(scale: number, lod: 0 | 1): THREE.BufferGeometry | null {
  const len = 3.05 * scale
  const segs = lod === 0 ? 18 : 8
  const radial = lod === 0 ? 7 : 5
  const body = tube(sCurve(len, scale, segs, 0.22, 0.34), 0.105 * scale, segs, radial)
  const parts: THREE.BufferGeometry[] = [body]

  const hx = len + 0.06 * scale
  const hy = 0.2 * scale
  parts.push(boxAt(0.34 * scale, 0.2 * scale, 0.2 * scale, hx - 0.12 * scale, hy + 0.04 * scale, 0))
  parts.push(boxAt(0.42 * scale, 0.13 * scale, 0.15 * scale, hx + 0.18 * scale, hy, 0))
  parts.push(boxAt(0.22 * scale, 0.07 * scale, 0.12 * scale, hx + 0.22 * scale, hy - 0.1 * scale, 0, 0.25))
  parts.push(coneAt(0.035 * scale, 0.28 * scale, hx - 0.02 * scale, hy + 0.28 * scale, 0.07 * scale, 0, 0, -0.45))
  parts.push(coneAt(0.035 * scale, 0.28 * scale, hx - 0.02 * scale, hy + 0.28 * scale, -0.07 * scale, 0, 0, -0.45))

  if (lod === 0) {
    parts.push(boxAt(0.18 * scale, 0.035 * scale, 0.012 * scale, hx + 0.32 * scale, hy + 0.02 * scale, 0.09 * scale, 0, 0.35))
    parts.push(boxAt(0.18 * scale, 0.035 * scale, 0.012 * scale, hx + 0.32 * scale, hy + 0.02 * scale, -0.09 * scale, 0, -0.35))
    for (let i = 0; i < 4; i++) {
      const t = 0.35 + i * 0.12
      parts.push(boxAt(0.08 * scale, 0.16 * scale, 0.03 * scale, t * len, 0.22 * scale, 0, 0.15, 0, 0.2 * (i % 2 ? 1 : -1)))
    }
    for (const [fx, fz] of [
      [0.35 * len, 0.12 * scale],
      [0.62 * len, -0.1 * scale],
    ] as const) {
      const cloud = new THREE.TorusGeometry(0.11 * scale, 0.04 * scale, 5, 10)
      cloud.rotateX(Math.PI / 2)
      cloud.translate(fx, -0.02 * scale, fz)
      parts.push(cloud)
    }
  }

  return mergeKit(parts)
}

/** Phượng — thân S, cánh quạt, mào, đuôi. Dùng đầu đao / bờ nóc hậu cung. */
export function phoenixOrnamentGeo(scale: number, lod: 0 | 1): THREE.BufferGeometry | null {
  const len = 2.35 * scale
  const segs = lod === 0 ? 14 : 7
  const body = tube(sCurve(len, scale, segs, 0.08, 0.42), 0.09 * scale, segs, lod === 0 ? 6 : 4)
  const parts: THREE.BufferGeometry[] = [body]
  const hx = len + 0.04 * scale
  parts.push(boxAt(0.2 * scale, 0.14 * scale, 0.12 * scale, hx, 0.28 * scale, 0))
  parts.push(coneAt(0.04 * scale, 0.16 * scale, hx + 0.16 * scale, 0.26 * scale, 0, 0, 0, Math.PI / 2))
  parts.push(coneAt(0.03 * scale, 0.18 * scale, hx - 0.02 * scale, 0.46 * scale, 0, 0, 0, -0.2))

  const feathers = lod === 0 ? 7 : 4
  for (let i = 0; i < feathers; i++) {
    const side = i < feathers / 2 ? 1 : -1
    const k = i % Math.ceil(feathers / 2)
    const ang = side * (0.35 + k * 0.22)
    parts.push(
      boxAt(
        0.08 * scale,
        0.025 * scale,
        (0.7 + k * 0.12) * scale,
        0.45 * len,
        0.22 * scale + k * 0.04 * scale,
        side * 0.15 * scale,
        0.15,
        ang,
        0.12 * side,
      ),
    )
  }

  const tails = lod === 0 ? 3 : 2
  for (let i = 0; i < tails; i++) {
    const z = (i - (tails - 1) * 0.5) * 0.1 * scale
    parts.push(boxAt(0.9 * scale, 0.03 * scale, 0.07 * scale, 0.05 * len, 0.12 * scale, z, 0.2, 0, (i - 1) * 0.25))
  }

  return mergeKit(parts)
}

/** Nhật / thái cực — đĩa + tán. */
export function sunOrnamentGeo(scale: number, lod: 0 | 1): THREE.BufferGeometry | null {
  const r = 0.28 * scale
  const disc = new THREE.CylinderGeometry(r, r, 0.05 * scale, lod === 0 ? 16 : 10)
  const ring = new THREE.TorusGeometry(r * 1.08, 0.028 * scale, 5, lod === 0 ? 16 : 10)
  ring.rotateX(Math.PI / 2)
  const inner = new THREE.CylinderGeometry(r * 0.38, r * 0.38, 0.06 * scale, 8)
  inner.translate(0, 0.01 * scale, 0)
  const parts: THREE.BufferGeometry[] = [disc, ring, inner]
  if (lod === 0) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      parts.push(boxAt(0.04 * scale, 0.03 * scale, 0.14 * scale, Math.cos(a) * r * 1.22, 0, Math.sin(a) * r * 1.22, 0, -a, 0))
    }
  }
  return mergeKit(parts)
}

/** Bầu rượu pháp lam — bờ nóc. */
export function gourdOrnamentGeo(scale: number, segs: number): THREE.BufferGeometry {
  const s = scale
  const pts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.11 * s, 0.02 * s),
    new THREE.Vector2(0.15 * s, 0.2 * s),
    new THREE.Vector2(0.09 * s, 0.34 * s),
    new THREE.Vector2(0.13 * s, 0.52 * s),
    new THREE.Vector2(0.07 * s, 0.66 * s),
    new THREE.Vector2(0.025 * s, 0.74 * s),
    new THREE.Vector2(0.001, 0.78 * s),
  ]
  return new THREE.LatheGeometry(pts, segs)
}

/**
 * Một đơn vị hồi văn 回 — khung vuông + móc trong.
 * size ≈ cạnh ngoài (m). [ước lượng hợp lý]
 */
export function hoiVanUnitGeo(size: number, relief: number, bar = 0.07): THREE.BufferGeometry | null {
  const s = size
  const t = Math.min(bar, s * 0.18)
  const d = relief
  const parts: THREE.BufferGeometry[] = [
    boxAt(s, t, d, 0, t * 0.5, 0),
    boxAt(t, s, d, -s * 0.5 + t * 0.5, s * 0.5, 0),
    boxAt(s * 0.72, t, d, -s * 0.08, s - t * 0.5, 0),
    boxAt(t, s * 0.58, d, s * 0.5 - t * 0.5, s * 0.29, 0),
    boxAt(s * 0.42, t, d, s * 0.02, s * 0.42, 0),
    boxAt(t, s * 0.28, d, -s * 0.12, s * 0.55, 0),
  ]
  return mergeKit(parts)
}

/** Dải hồi văn dọc X, gốc giữa đáy. */
export function hoiVanBandGeo(length: number, height: number, relief: number, lod: 0 | 1): THREE.BufferGeometry | null {
  const unit = Math.max(0.28, height)
  const n = Math.max(1, Math.floor(length / (unit * 1.08)))
  const geo = hoiVanUnitGeo(unit * 0.92, relief, lod === 0 ? 0.055 : 0.07)
  if (!geo) return null
  if (n === 1) {
    geo.translate(0, 0, 0)
    return geo
  }
  const parts: THREE.BufferGeometry[] = []
  for (let i = 0; i < n; i++) {
    const x = -length * 0.5 + (i + 0.5) * (length / n)
    const g = i === n - 1 ? geo : geo.clone()
    g.translate(x, 0, 0)
    parts.push(g)
  }
  return mergeKit(parts)
}

export function buildLuongLong(opts: { scale?: number; gap?: number; lod?: OrnamentLod }): THREE.Group {
  const { scale = 1, gap = 1.15, lod = 0 } = opts
  const g = new THREE.Group()
  g.name = 'luong-long-chau-nhat'
  if (lod === 2) return g
  const L: 0 | 1 = lod === 0 ? 0 : 1
  const gold = getMaterial('vang_thep', lod)
  const lam = getMaterial('phap_lam', lod)
  const dgeo = dragonOrnamentGeo(scale, L)
  if (dgeo) {
    const left = new THREE.Mesh(dgeo, gold)
    left.name = 'rong-trai'
    left.castShadow = true
    left.position.set(-gap * scale, 0, 0)
    const right = new THREE.Mesh(dgeo, gold)
    right.name = 'rong-phai'
    right.castShadow = true
    right.position.set(gap * scale, 0, 0)
    right.rotation.y = Math.PI
    g.add(left, right)
  }
  const sun = meshOf(sunOrnamentGeo(scale, L), lam, 'nhat')
  if (sun) {
    sun.position.y = 0.28 * scale
    sun.rotation.x = Math.PI / 2
    g.add(sun)
  }
  return g
}

export function buildPhuongDao(opts: { scale?: number; lod?: OrnamentLod }): THREE.Group {
  const { scale = 1, lod = 0 } = opts
  const g = new THREE.Group()
  g.name = 'phuong-dau-dao'
  if (lod === 2) return g
  const L: 0 | 1 = lod === 0 ? 0 : 1
  const geo = phoenixOrnamentGeo(scale, L)
  if (geo) {
    const m = new THREE.Mesh(geo, getMaterial('vang_thep', lod))
    m.castShadow = true
    g.add(m)
  }
  return g
}

export function buildBauRuouRidge(opts: { count?: number; scale?: number; spacing?: number; lod?: OrnamentLod }): THREE.Group {
  const { count = 5, scale = 1, spacing = 1.15, lod = 0 } = opts
  const g = new THREE.Group()
  g.name = 'bau-phap-lam'
  if (lod === 2 || count < 1) return g
  const segs = lod === 0 ? 10 : 6
  const inst = new THREE.InstancedMesh(gourdOrnamentGeo(scale, segs), getMaterial('phap_lam', lod), count)
  inst.castShadow = true
  const dummy = new THREE.Object3D()
  const origin = -((count - 1) * spacing) / 2
  for (let i = 0; i < count; i++) {
    const mid = count > 1 && i === Math.floor(count / 2)
    dummy.position.set(origin + i * spacing, 0, 0)
    dummy.scale.setScalar(mid ? 1.15 : 0.85)
    dummy.updateMatrix()
    inst.setMatrixAt(i, dummy.matrix)
  }
  inst.instanceMatrix.needsUpdate = true
  g.add(inst)
  return g
}

export function buildHoiVanBand(opts: { width: number; height?: number; relief?: number; lod?: OrnamentLod }): THREE.Group {
  const { width, height = 0.32, relief = 0.045, lod = 0 } = opts
  const g = new THREE.Group()
  g.name = 'hoi-van'
  if (lod === 2) return g
  const L: 0 | 1 = lod === 0 ? 0 : 1
  const geo = hoiVanBandGeo(width, height, relief, L)
  const m = meshOf(geo, getMaterial('vang_thep', lod), 'hoi-van-band', lod === 0)
  if (m) g.add(m)
  return g
}
