import { createBuffers, writePixel } from './bake'
import { fbm, ridgeFbm, worley } from './noise'
import { clamp01, hexRgb, lerp, mixRgb } from './prng'
import type { LodLevel, PixelBuffers } from './types'

function clampByte(n: number): number {
  return Math.round(clamp01(n / 255) * 255)
}

/**
 * Gỗ lim — thớ dọc, lỗ. U quấn 1 vòng cột; V ~1.6 m.
 */
export function paintGoLim(size: number, lod: LodLevel): PixelBuffers {
  const buf = createBuffers(size)
  const wood = hexRgb('#4A3428')
  const pore = hexRgb('#2A1A14')
  const seed = 8803
  const oct = lod === 0 ? 5 : 3

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const grain = fbm(u * 0.35, v * 4.2, 8, seed, oct)
      const ring = ridgeFbm(u * 0.2 + grain * 0.05, v * 3.6, 6, seed + 4, 3)
      const pores = fbm(u * 6, v * 14, 18, seed + 9, 2)
      const poreMask = pores > 0.72 ? (pores - 0.72) * 3 : 0

      let col = mixRgb(wood, [86, 58, 40], grain)
      col = mixRgb(col, [58, 38, 28], ring * 0.35)
      if (poreMask > 0) col = mixRgb(col, pore, clamp01(poreMask))

      const height = 0.48 + (grain - 0.5) * 0.16 + ring * 0.08 - poreMask * 0.2
      const rough = 0.52 + grain * 0.16 + poreMask * 0.2
      const ao = 0.86 - poreMask * 0.25

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
 * Sơn son — đỏ sâu, mòn cạnh lộ gỗ. Wrap 1 vòng cột.
 */
export function paintSonSon(size: number, lod: LodLevel): PixelBuffers {
  const buf = createBuffers(size)
  const son = hexRgb('#8B1A1A')
  const wood = hexRgb('#4A3428')
  const seed = 9911
  const oct = lod === 0 ? 4 : 3

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const noise = fbm(u, v, 6, seed, oct)
      const stretch = fbm(u * 0.25, v * 5, 8, seed + 6, 3)
      const edge = Math.min(u, 1 - u)
      const wear = clamp01((0.11 - edge) * 9) * (0.45 + noise)
      const flake = noise > 0.78 ? (noise - 0.78) * 2.5 : 0

      let col = mixRgb(son, [110, 22, 22], noise * 0.35)
      col = mixRgb(col, [72, 14, 14], stretch * 0.2)
      const expose = clamp01(wear + flake * 0.55)
      col = mixRgb(col, wood, expose)

      // Fake anisotropic highlight along the shaft.
      const sheen = 1 + Math.pow(stretch, 2) * 0.12 * (1 - expose)
      col = [col[0] * sheen, col[1] * sheen, col[2] * sheen]

      const height = 0.55 - expose * 0.22 + (noise - 0.5) * 0.05
      const rough = lerp(0.34, 0.62, expose) + noise * 0.06
      const ao = 0.9 - expose * 0.12

      writePixel(
        buf,
        y * size + x,
        clampByte(col[0]),
        clampByte(col[1]),
        clampByte(col[2]),
        clamp01(height),
        clamp01(rough),
        ao,
      )
    }
  }
  return buf
}

/**
 * Vàng thếp — flake, mòn lộ son.
 */
export function paintVangThep(size: number, lod: LodLevel): PixelBuffers {
  const buf = createBuffers(size)
  const gold = hexRgb('#C9A227')
  const son = hexRgb('#8B1A1A')
  const seed = 10267
  const cells = lod === 0 ? 14 : 10

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const w = worley(u, v, cells, seed)
      const flake = 0.55 + w.id * 0.45
      const edge = clamp01(1 - (w.f2 - w.f1) * 4.2)
      const wear = fbm(u, v, 5, seed + 8, 3)
      const expose = wear > 0.7 ? (wear - 0.7) * 2.6 * (0.4 + edge) : edge * 0.15

      let col = mixRgb(gold, [168, 120, 28], 1 - flake)
      col = mixRgb(col, [232, 200, 96], Math.max(0, flake - 0.75) * 0.8)
      col = mixRgb(col, son, clamp01(expose))

      const height = 0.5 + (w.id - 0.5) * 0.12 - edge * 0.18 - expose * 0.1
      const rough = lerp(0.16, 0.42, expose) + edge * 0.12
      const ao = 0.88 - edge * 0.2

      writePixel(
        buf,
        y * size + x,
        clampByte(col[0]),
        clampByte(col[1]),
        clampByte(col[2]),
        clamp01(height),
        clamp01(rough),
        ao,
      )
    }
  }
  return buf
}

/**
 * Pháp lam — đảo men vàng / lục / lam / trắng, bleed mềm, viền đồng.
 */
export function paintPhapLam(size: number, lod: LodLevel): PixelBuffers {
  const buf = createBuffers(size)
  const palette: [number, number, number][] = [
    hexRgb('#C9A227'),
    hexRgb('#2E5E4E'),
    hexRgb('#3A6B8C'),
    hexRgb('#E8E2D4'),
    hexRgb('#8B1A1A'),
  ]
  const copper = hexRgb('#8A5A2A')
  const seed = 11351
  const cells = lod === 0 ? 8 : 6

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const w = worley(u, v, cells, seed)
      const idx = Math.min(palette.length - 1, Math.floor(w.id * palette.length))
      const neighbor = palette[(idx + 1) % palette.length]
      const bleed = fbm(u, v, 6, seed + 3, 3)
      let col = mixRgb(palette[idx], neighbor, bleed * 0.18)
      const rim = clamp01(1 - (w.f2 - w.f1) * 5.5)
      col = mixRgb(col, copper, rim * 0.75)

      const height = 0.42 + (1 - w.f1 * 0.35) * 0.2 - rim * 0.08
      const rough = lerp(0.18, 0.38, rim) + bleed * 0.06
      const ao = 0.9 - rim * 0.22

      writePixel(
        buf,
        y * size + x,
        clampByte(col[0]),
        clampByte(col[1]),
        clampByte(col[2]),
        clamp01(height),
        clamp01(rough),
        ao,
      )
    }
  }
  return buf
}

/**
 * Đồng thau / hợp kim — undulation đúc + patina hốc.
 */
export function paintDongThau(size: number, _lod: LodLevel): PixelBuffers {
  const buf = createBuffers(size)
  const brass = hexRgb('#B08D57')
  const patina = hexRgb('#3F5D4A')
  const seed = 12433

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const und = fbm(u, v, 5, seed, 4)
      const cavity = fbm(u, v, 9, seed + 7, 3)
      const pat = cavity > 0.68 ? (cavity - 0.68) * 2.4 : 0

      let col = mixRgb(brass, [96, 72, 40], und * 0.35)
      col = mixRgb(col, patina, clamp01(pat))

      const height = 0.5 + (und - 0.5) * 0.22 - pat * 0.15
      const rough = 0.32 + und * 0.16 + pat * 0.28
      const ao = 0.86 - pat * 0.3

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
 * Cỏ — noise thảm, không flat golf.
 */
export function paintCo(size: number, lod: LodLevel): PixelBuffers {
  const buf = createBuffers(size)
  const lush = hexRgb('#4F6B3C')
  const dry = hexRgb('#8A8A4A')
  const earth = hexRgb('#6B5A3A')
  const seed = 13547
  const oct = lod === 0 ? 5 : 3

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const patch = fbm(u, v, 4, seed, oct)
      const blades = fbm(u * 2.4, v * 3.1, 14, seed + 5, 3)
      const dirt = patch < 0.32 ? (0.32 - patch) * 2 : 0

      let col = mixRgb(lush, dry, clamp01((patch - 0.45) * 1.6))
      col = mixRgb(col, earth, clamp01(dirt))
      col = [
        col[0] * (0.85 + blades * 0.28),
        col[1] * (0.85 + blades * 0.28),
        col[2] * (0.85 + blades * 0.22),
      ]

      const height = 0.35 + patch * 0.3 + blades * 0.2
      const rough = 0.88 + blades * 0.08
      const ao = 0.78 + patch * 0.16

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
 * Đất nền — noise sỏi / mùn, không phẳng.
 */
export function paintDat(size: number, lod: LodLevel): PixelBuffers {
  const buf = createBuffers(size)
  const soil = hexRgb('#7A6A52')
  const pebble = hexRgb('#9A8A70')
  const dark = hexRgb('#4A3C2C')
  const seed = 14621

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const n = fbm(u, v, 6, seed, lod === 0 ? 5 : 3)
      const w = worley(u, v, 12, seed + 4)
      const stone = w.f1 < 0.12 && w.id > 0.55 ? 1 - w.f1 * 6 : 0

      let col = mixRgb(soil, dark, n * 0.45)
      col = mixRgb(col, pebble, clamp01(stone))

      const height = 0.4 + n * 0.25 + stone * 0.2
      const rough = 0.86 + n * 0.1
      const ao = 0.8 - stone * 0.08

      writePixel(
        buf,
        y * size + x,
        clampByte(col[0]),
        clampByte(col[1]),
        clampByte(col[2]),
        clamp01(height),
        clamp01(rough),
        ao,
      )
    }
  }
  return buf
}

/**
 * Nước — ripple / caustic nhẹ (mesh nào còn dùng getMaterial('nuoc')).
 */
export function paintNuoc(size: number, _lod: LodLevel): PixelBuffers {
  const buf = createBuffers(size)
  const deep = hexRgb('#3A6B7A')
  const foam = hexRgb('#8CB8C4')
  const seed = 15749

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const wave = fbm(u, v, 5, seed, 4)
      const caustic = ridgeFbm(u, v, 8, seed + 3, 3)
      let col = mixRgb(deep, foam, caustic * 0.35)
      col = [col[0] * (0.85 + wave * 0.25), col[1] * (0.85 + wave * 0.25), col[2] * (0.9 + wave * 0.2)]

      writePixel(
        buf,
        y * size + x,
        clampByte(col[0]),
        clampByte(col[1]),
        clampByte(col[2]),
        0.45 + wave * 0.2 + caustic * 0.15,
        lerp(0.06, 0.18, wave),
        0.95,
      )
    }
  }
  return buf
}
