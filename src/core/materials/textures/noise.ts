import { hash2 } from './prng'

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/**
 * Seamless value-noise. `u,v` in 0..1; `period` = integer lattice wraps.
 */
export function valueNoise(u: number, v: number, period: number, seed: number): number {
  const cells = Math.max(1, period | 0)
  const x = u * cells
  const y = v * cells
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = fade(x - x0)
  const fy = fade(y - y0)
  const x1 = x0 + 1
  const y1 = y0 + 1
  const i0 = ((x0 % cells) + cells) % cells
  const j0 = ((y0 % cells) + cells) % cells
  const i1 = ((x1 % cells) + cells) % cells
  const j1 = ((y1 % cells) + cells) % cells
  const h00 = hash2(i0, j0, seed)
  const h10 = hash2(i1, j0, seed)
  const h01 = hash2(i0, j1, seed)
  const h11 = hash2(i1, j1, seed)
  const a = h00 + (h10 - h00) * fx
  const b = h01 + (h11 - h01) * fx
  return a + (b - a) * fy
}

export function fbm(
  u: number,
  v: number,
  period: number,
  seed: number,
  octaves: number,
): number {
  let sum = 0
  let amp = 0.5
  let freq = 1
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(u * freq, v * freq, period * freq, seed + i * 101) * amp
    norm += amp
    amp *= 0.5
    freq *= 2
  }
  return sum / norm
}

export function ridgeFbm(
  u: number,
  v: number,
  period: number,
  seed: number,
  octaves: number,
): number {
  let sum = 0
  let amp = 0.5
  let freq = 1
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    const n = valueNoise(u * freq, v * freq, period * freq, seed + i * 131)
    const r = 1 - Math.abs(n * 2 - 1)
    sum += r * r * amp
    norm += amp
    amp *= 0.5
    freq *= 2
  }
  return sum / norm
}

/** Wrapped Worley. Returns F1, F2, and a stable cell id in [0,1). */
export function worley(
  u: number,
  v: number,
  cells: number,
  seed: number,
): { f1: number; f2: number; id: number } {
  const n = Math.max(1, cells | 0)
  const gx = u * n
  const gy = v * n
  const ix = Math.floor(gx)
  const iy = Math.floor(gy)
  let f1 = 8
  let f2 = 8
  let id = 0
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      const cx = ((ix + ox) % n + n) % n
      const cy = ((iy + oy) % n + n) % n
      const px = ix + ox + hash2(cx, cy, seed)
      const py = iy + oy + hash2(cx, cy, seed + 19)
      const d = Math.hypot(gx - px, gy - py)
      const cellId = hash2(cx, cy, seed + 91)
      if (d < f1) {
        f2 = f1
        f1 = d
        id = cellId
      } else if (d < f2) {
        f2 = d
      }
    }
  }
  return { f1, f2, id }
}
