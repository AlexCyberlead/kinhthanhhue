import type { RoofFrame } from './types'

export type { RoofFrame }

/**
 * Hip run ≈ 0.92 × nửa cạnh ngắn → góc hông ~45°.
 * Ridge tối thiểu 12% cạnh dài để mái gần vuông vẫn có sống.
 * [ước lượng hợp lý]
 */
export function makeFrame(
  width: number,
  depth: number,
  rise: number,
  curvature: number,
  tileScale: number,
  lod: 0 | 1 | 2,
): RoofFrame {
  const halfW = width * 0.5
  const halfD = depth * 0.5
  const ridgeAlongX = width >= depth
  const halfLong = ridgeAlongX ? halfW : halfD
  const halfShort = ridgeAlongX ? halfD : halfW
  const hipRun = halfShort * 0.92
  const ridgeHalf = Math.max(halfLong * 0.12, halfLong - hipRun)
  return { halfW, halfD, rise, curvature, ridgeAlongX, ridgeHalf, tileScale, lod }
}

export function segsFor(half: number, lod: 0 | 1 | 2): number {
  if (lod === 2) return 2
  if (lod === 0) return Math.max(16, Math.min(28, Math.round(half * 1.15)))
  return Math.max(10, Math.min(16, Math.round(half * 0.85)))
}

/** Chiều cao hip tuyến tính — 4 mặt phẳng gặp nhau ở sống. */
export function linearHipY(x: number, z: number, f: RoofFrame): number {
  const { halfW, halfD, rise, ridgeHalf, ridgeAlongX } = f
  if (ridgeAlongX) {
    const hZ = rise * (1 - Math.abs(z) / Math.max(1e-4, halfD))
    const span = Math.max(1e-4, halfW - ridgeHalf)
    const hX = Math.abs(x) <= ridgeHalf ? rise : rise * (1 - (Math.abs(x) - ridgeHalf) / span)
    return Math.max(0, Math.min(hZ, hX))
  }
  const hX = rise * (1 - Math.abs(x) / Math.max(1e-4, halfW))
  const span = Math.max(1e-4, halfD - ridgeHalf)
  const hZ = Math.abs(z) <= ridgeHalf ? rise : rise * (1 - (Math.abs(z) - ridgeHalf) / span)
  return Math.max(0, Math.min(hX, hZ))
}

/**
 * Ức mái: dốc gần sống, xoải ra diềm (concave nhìn từ ngoài).
 * p < 1 → East-Asian flare. [ước lượng hợp lý]
 */
export function curvedY(linearY: number, f: RoofFrame): number {
  const t = 1 - linearY / Math.max(1e-4, f.rise)
  const p = 0.52 + (1 - f.curvature) * 0.42
  const clamped = Math.max(0, Math.min(1, t))
  return f.rise * (1 - Math.pow(clamped, p))
}

/**
 * Đầu đao: góc uốn lên + hơi đua ra.
 * Tip mạnh ở 4 góc; diềm giữa chỉ nhấc nhẹ. [ước lượng hợp lý]
 */
export function dauDao(x: number, z: number, f: RoofFrame): { dy: number; ox: number; oz: number } {
  const nx = Math.abs(x) / Math.max(1e-4, f.halfW)
  const nz = Math.abs(z) / Math.max(1e-4, f.halfD)
  const ex = Math.max(0, (nx - 0.5) / 0.5)
  const ez = Math.max(0, (nz - 0.5) / 0.5)
  const tip = Math.pow(ex * ez, 0.42)
  const eaveX = nx > 0.9 ? (nx - 0.9) / 0.1 : 0
  const eaveZ = nz > 0.9 ? (nz - 0.9) / 0.1 : 0
  const eave = Math.max(eaveX, eaveZ) * (1 - tip * 0.35)
  const lift = (tip * 0.32 + eave * 0.07) * f.rise * f.curvature
  const flare = tip * 0.038 * f.curvature
  const sx = x === 0 ? 0 : Math.sign(x)
  const sz = z === 0 ? 0 : Math.sign(z)
  return { dy: lift, ox: sx * flare * f.halfW, oz: sz * flare * f.halfD }
}

export type RoofSample = {
  x: number
  y: number
  z: number
  u: number
  v: number
}

/** Khoảng xuống dốc từ sống (m) — V của texture ngói. */
export function slopeDist(x: number, z: number, f: RoofFrame): number {
  if (f.ridgeAlongX) {
    if (Math.abs(x) <= f.ridgeHalf) return Math.abs(z)
    return Math.hypot(Math.abs(x) - f.ridgeHalf, z)
  }
  if (Math.abs(z) <= f.ridgeHalf) return Math.abs(x)
  return Math.hypot(x, Math.abs(z) - f.ridgeHalf)
}

/** U dọc diềm: mặt trước/sau theo X; mặt hông theo Z. */
export function eaveU(x: number, z: number, f: RoofFrame): number {
  if (f.ridgeAlongX) {
    const span = Math.max(1e-4, f.halfW - f.ridgeHalf)
    const hZ = f.rise * (1 - Math.abs(z) / Math.max(1e-4, f.halfD))
    const hX = Math.abs(x) <= f.ridgeHalf ? f.rise : f.rise * (1 - (Math.abs(x) - f.ridgeHalf) / span)
    return hZ <= hX ? x : z
  }
  const span = Math.max(1e-4, f.halfD - f.ridgeHalf)
  const hX = f.rise * (1 - Math.abs(x) / Math.max(1e-4, f.halfW))
  const hZ = Math.abs(z) <= f.ridgeHalf ? f.rise : f.rise * (1 - (Math.abs(z) - f.ridgeHalf) / span)
  return hX <= hZ ? z : x
}

export function sampleRoof(x: number, z: number, f: RoofFrame, tileU: number, tileV: number): RoofSample {
  const lin = linearHipY(x, z, f)
  const tip = dauDao(x, z, f)
  const y = curvedY(lin, f) + tip.dy
  const scale = Math.max(0.35, f.tileScale)
  return {
    x: x + tip.ox,
    y,
    z: z + tip.oz,
    u: eaveU(x, z, f) / (tileU * scale),
    v: slopeDist(x, z, f) / (tileV * scale),
  }
}

export function cornerXZ(i: 0 | 1 | 2 | 3, f: RoofFrame): { x: number; z: number } {
  const sx = i === 0 || i === 3 ? -1 : 1
  const sz = i === 0 || i === 1 ? -1 : 1
  return { x: sx * f.halfW, z: sz * f.halfD }
}

/** Đầu sống gần góc i (0 SW, 1 SE, 2 NE, 3 NW). */
export function ridgeEndForCorner(i: 0 | 1 | 2 | 3, f: RoofFrame): { x: number; z: number } {
  if (f.ridgeAlongX) {
    const sx = i === 0 || i === 3 ? -1 : 1
    return { x: sx * f.ridgeHalf, z: 0 }
  }
  const sz = i === 0 || i === 1 ? -1 : 1
  return { x: 0, z: sz * f.ridgeHalf }
}
