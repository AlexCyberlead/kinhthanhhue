import { createBuffers, writePixel } from './bake'
import { fbm } from './noise'
import { clamp01, fract, hash2, hexRgb, lerp, mixRgb } from './prng'
import type { LodLevel, PixelBuffers } from './types'

const TILES = 8
const MORTAR_U = 0.07
const MORTAR_V = 0.045

type NgoiKind = 'bone' | 'vang' | 'xanh'

const BASE: Record<NgoiKind, [number, number, number]> = {
  bone: hexRgb('#8A7355'),
  vang: hexRgb('#D4A017'),
  xanh: hexRgb('#2E5E4E'),
}

const MORTAR: Record<NgoiKind, [number, number, number]> = {
  bone: hexRgb('#4A3A2C'),
  vang: hexRgb('#6A4A18'),
  xanh: hexRgb('#1A3228'),
}

/**
 * Ngói ống âm dương — ridges (dương) alternate with valleys (âm).
 * Module ~0.35 m/viên; 8 viên / cycle. [ước lượng hợp lý]
 */
function paintNgoi(size: number, lod: LodLevel, kind: NgoiKind, seed: number): PixelBuffers {
  const buf = createBuffers(size)
  const base = BASE[kind]
  const mortarCol = MORTAR[kind]
  const glazed = kind !== 'bone'
  const oct = lod === 0 ? 4 : 3

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const tx = Math.floor(u * TILES)
      const ty = Math.floor(v * TILES)
      const lu = fract(u * TILES)
      const lv = fract(v * TILES)
      const tileHash = hash2(tx, ty, seed)
      const isYang = tx % 2 === 0

      const inMortar = lu < MORTAR_U || lu > 1 - MORTAR_U || lv < MORTAR_V
      const cyl = Math.sin(lu * Math.PI)
      const profile = isYang ? cyl : 1 - cyl * 0.62
      const height = inMortar ? 0.08 : 0.18 + profile * (isYang ? 0.82 : 0.48)

      const hueJitter = (tileHash - 0.5) * (glazed ? 0.1 : 0.16)
      const fireBlotch = fbm(u, v, 6, seed + 7, oct)
      const crack =
        lod === 0 && glazed
          ? Math.max(0, 0.12 - Math.abs(fbm(u * 1.4, v * 2.2, 10, seed + 21, 3) - 0.5) * 1.6)
          : 0
      const moss = !glazed
        ? smoothMoss(u, v, seed) * (isYang ? 0.15 : 0.45) * (1 - profile)
        : fireBlotch > 0.78
          ? (fireBlotch - 0.78) * 0.7
          : 0

      let col = mixRgb(base, shiftHue(base, hueJitter), 0.85)
      col = mixRgb(col, fireTint(kind, fireBlotch), glazed ? 0.22 : 0.12)
      if (moss > 0.02) {
        col = mixRgb(col, [62, 78, 48], clamp01(moss))
      }
      if (inMortar) {
        col = mixRgb(mortarCol, col, 0.18)
      }
      if (crack > 0.02) {
        col = mixRgb(col, [40, 32, 18], clamp01(crack * 4))
      }

      // Wet specular strip along the ridge (brighter glaze, not a light).
      const ridgeLight = isYang ? Math.pow(cyl, 1.6) : Math.pow(1 - cyl, 2) * 0.35
      const shade = 0.52 + 0.48 * profile
      const highlight = glazed ? 1 + ridgeLight * 0.28 : 1 + ridgeLight * 0.1
      col = [
        col[0] * shade * highlight,
        col[1] * shade * highlight,
        col[2] * shade * highlight,
      ]

      const rough = inMortar
        ? 0.88
        : glazed
          ? lerp(0.22, 0.48, 1 - profile) + crack * 0.4 + moss * 0.25
          : 0.58 + (1 - profile) * 0.22 + moss * 0.15
      const ao = inMortar ? 0.55 : lerp(0.72, 1, profile) - moss * 0.15

      const i = y * size + x
      writePixel(
        buf,
        i,
        clampByte(col[0]),
        clampByte(col[1]),
        clampByte(col[2]),
        height,
        clamp01(rough),
        clamp01(ao),
      )
    }
  }
  return buf
}

function clampByte(n: number): number {
  return Math.round(clamp01(n / 255) * 255)
}

function shiftHue(c: [number, number, number], t: number): [number, number, number] {
  return [c[0] * (1 + t * 0.25), c[1] * (1 + t * 0.12), c[2] * (1 - t * 0.08)]
}

function fireTint(kind: NgoiKind, blotch: number): [number, number, number] {
  if (kind === 'vang') return mixRgb([212, 160, 23], [168, 92, 18], blotch)
  if (kind === 'xanh') return mixRgb([46, 94, 78], [28, 72, 58], blotch)
  return mixRgb([138, 115, 85], [96, 72, 52], blotch)
}

function smoothMoss(u: number, v: number, seed: number): number {
  const n = fbm(u, v, 5, seed + 44, 3)
  return clamp01((n - 0.55) * 2.2)
}

export function paintNgoiAmDuong(size: number, lod: LodLevel): PixelBuffers {
  return paintNgoi(size, lod, 'bone', 1103)
}

export function paintNgoiMenVang(size: number, lod: LodLevel): PixelBuffers {
  return paintNgoi(size, lod, 'vang', 2207)
}

export function paintNgoiMenXanh(size: number, lod: LodLevel): PixelBuffers {
  return paintNgoi(size, lod, 'xanh', 3319)
}
