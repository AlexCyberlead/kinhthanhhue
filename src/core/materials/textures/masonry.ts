import { createBuffers, writePixel } from './bake'
import { fbm, worley } from './noise'
import { clamp01, fract, hash2, hexRgb, lerp, mixRgb, smoothstep } from './prng'
import type { LodLevel, PixelBuffers } from './types'

/** Hoa thị / chữ thọ stylized — LOD0 stamp on some Bát Tràng tiles. */
const STAMP = [
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 0, 0, 1, 1, 0],
  [1, 1, 0, 1, 1, 0, 1, 1],
  [1, 1, 0, 1, 1, 0, 1, 1],
  [0, 1, 1, 0, 0, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
]

function clampByte(n: number): number {
  return Math.round(clamp01(n / 255) * 255)
}

/**
 * Gạch vồ — viên lớn ~0.4×0.2 m, vữa tối, sứt góc.
 * 10×20 viên trên cycle 4 m. [ước lượng hợp lý]
 */
export function paintGachVo(size: number, lod: LodLevel): PixelBuffers {
  const buf = createBuffers(size)
  const brick = hexRgb('#9C6B4F')
  const mortar = hexRgb('#3A2A22')
  const cols = 10
  const rows = 20
  const joint = 0.07
  const seed = 4409

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const ty = Math.floor(v * rows)
      const stagger = ty % 2 === 0 ? 0 : 0.5
      const sx = u * cols + stagger
      const tx = Math.floor(sx)
      const lu = fract(sx)
      const lv = fract(v * rows)
      const h = hash2(tx, ty, seed)

      const chip =
        (lu < 0.16 || lu > 0.84) && (lv < 0.2 || lv > 0.8) && h < 0.28
          ? 0.1 + h * 0.08
          : 0
      const inMortar = lu < joint + chip || lu > 1 - joint || lv < joint * 0.7 || lv > 1 - joint * 0.7

      const grit = fbm(u, v, 12, seed + 3, lod === 0 ? 4 : 3)
      const shadeBrick = 0.82 + (h - 0.5) * 0.28 + (grit - 0.5) * 0.18
      let col = mixRgb(brick, [120, 72, 48], h * 0.35)
      col = [col[0] * shadeBrick, col[1] * shadeBrick, col[2] * shadeBrick]
      if (inMortar) {
        const md = 0.75 + grit * 0.2
        col = [mortar[0] * md, mortar[1] * md, mortar[2] * md]
      }

      const height = inMortar ? 0.12 : 0.55 + grit * 0.12 - chip * 2
      const rough = inMortar ? 0.92 : 0.74 + grit * 0.14
      const ao = inMortar ? 0.52 : 0.9 - chip * 0.3

      writePixel(
        buf,
        y * size + x,
        clampByte(col[0]),
        clampByte(col[1]),
        clampByte(col[2]),
        clamp01(height),
        clamp01(rough),
        clamp01(ao),
      )
    }
  }
  return buf
}

/**
 * Gạch Bát Tràng — ô vuông men, LOD0 đóng hoa thị / chữ thọ stylized.
 * 8×8 ô trên cycle 3.2 m. [ước lượng hợp lý]
 */
export function paintGachBatTrang(size: number, lod: LodLevel): PixelBuffers {
  const buf = createBuffers(size)
  const glaze = hexRgb('#C4B89A')
  const grout = hexRgb('#8A7A62')
  const tiles = 8
  const joint = 0.06
  const seed = 5519

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const tx = Math.floor(u * tiles)
      const ty = Math.floor(v * tiles)
      const lu = fract(u * tiles)
      const lv = fract(v * tiles)
      const h = hash2(tx, ty, seed)
      const inJoint = lu < joint || lu > 1 - joint || lv < joint || lv > 1 - joint

      const blotch = fbm(u, v, 7, seed + 2, 3)
      const tintPick = h
      const tint =
        tintPick < 0.22
          ? mixRgb(glaze, hexRgb('#2E5E4E'), 0.18)
          : tintPick > 0.82
            ? mixRgb(glaze, hexRgb('#D4A017'), 0.16)
            : glaze
      let col = mixRgb(tint, [200, 186, 154], blotch * 0.25)

      let stamp = 0
      if (lod === 0 && !inJoint && h > 0.62) {
        const su = Math.min(7, Math.floor(((lu - joint) / (1 - 2 * joint)) * 8))
        const sv = Math.min(7, Math.floor(((lv - joint) / (1 - 2 * joint)) * 8))
        stamp = STAMP[sv][su]
        if (stamp) col = mixRgb(col, [92, 78, 52], 0.38)
      }

      if (inJoint) col = mixRgb(grout, col, 0.12)

      const dish = Math.sin(lu * Math.PI) * Math.sin(lv * Math.PI)
      const height = inJoint ? 0.2 : 0.55 + dish * 0.12 + stamp * 0.08
      const rough = inJoint ? 0.78 : lerp(0.32, 0.52, blotch) + stamp * 0.08
      const ao = inJoint ? 0.62 : 0.92

      writePixel(
        buf,
        y * size + x,
        clampByte(col[0]),
        clampByte(col[1]),
        clampByte(col[2]),
        height,
        clamp01(rough),
        ao,
      )
    }
  }
  return buf
}

/**
 * Đá thanh — Worley crack + grit + địa y nhẹ 5–10%.
 */
export function paintDaThanh(size: number, _lod: LodLevel): PixelBuffers {
  const buf = createBuffers(size)
  const stone = hexRgb('#6E6E68')
  const seed = 6629

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const w = worley(u, v, 7, seed)
      const crack = clamp01(1 - (w.f2 - w.f1) * 3.4)
      const grit = fbm(u, v, 16, seed + 5, 4)
      const lichenMask = fbm(u, v, 5, seed + 17, 3)
      const lichen = lichenMask > 0.72 ? (lichenMask - 0.72) * 3.2 : 0

      let col = mixRgb(stone, [88, 86, 78], w.id * 0.35)
      col = mixRgb(col, [52, 50, 46], crack * 0.7)
      col = [
        col[0] * (0.88 + grit * 0.2),
        col[1] * (0.88 + grit * 0.2),
        col[2] * (0.88 + grit * 0.2),
      ]
      if (lichen > 0.04) col = mixRgb(col, [92, 102, 86], clamp01(lichen))

      const height = 0.45 + grit * 0.2 - crack * 0.35 + lichen * 0.06
      const rough = 0.7 + grit * 0.18 + crack * 0.12
      const ao = 0.78 - crack * 0.28 + grit * 0.08

      writePixel(
        buf,
        y * size + x,
        clampByte(col[0]),
        clampByte(col[1]),
        clampByte(col[2]),
        clamp01(height),
        clamp01(rough),
        clamp01(ao),
      )
    }
  }
  return buf
}

/**
 * Tường vôi — blotch, vệt mưa dọc, chân tường lộ gạch.
 */
export function paintTuongVoi(size: number, lod: LodLevel): PixelBuffers {
  const buf = createBuffers(size)
  const plaster = hexRgb('#E8DCC8')
  const dirty = hexRgb('#C4B49A')
  const brick = hexRgb('#9C6B4F')
  const mortar = hexRgb('#5A4034')
  const seed = 7741

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      // V grows down in the image; "chân tường" = bottom of the map (v → 1)
      // so a 0–1 UV box with V=0 at the bottom of a wall after flip still
      // shows brick near the lower edge of a typical wall face.
      const blotch = fbm(u, v, 4, seed, lod === 0 ? 5 : 3)
      const streak = fbm(u * 0.35 + 0.1, v * 3.4, 8, seed + 11, 3)
      const rain = clamp01((streak - 0.48) * 2.4) * (0.35 + v * 0.65)
      const expose = smoothstep(0.78, 0.96, v) * (0.55 + blotch * 0.45)

      let col = mixRgb(plaster, dirty, blotch * 0.55)
      col = mixRgb(col, [168, 150, 128], rain * 0.45)

      let height = 0.5 + (blotch - 0.5) * 0.08 - rain * 0.06
      let rough = 0.82 + blotch * 0.1
      let ao = 0.88 - rain * 0.12

      if (expose > 0.04) {
        const cols = 10
        const rows = 20
        const ty = Math.floor(v * rows)
        const stagger = ty % 2 === 0 ? 0 : 0.5
        const lu = fract(u * cols + stagger)
        const lv = fract(v * rows)
        const joint = lu < 0.08 || lv < 0.08
        const bcol = joint ? mortar : mixRgb(brick, [110, 70, 50], hash2(ty, Math.floor(u * cols), seed))
        col = mixRgb(col, bcol, clamp01(expose))
        height = lerp(height, joint ? 0.15 : 0.48, expose)
        rough = lerp(rough, 0.86, expose)
        ao = lerp(ao, joint ? 0.55 : 0.82, expose)
      }

      writePixel(
        buf,
        y * size + x,
        clampByte(col[0]),
        clampByte(col[1]),
        clampByte(col[2]),
        clamp01(height),
        clamp01(rough),
        clamp01(ao),
      )
    }
  }
  return buf
}
