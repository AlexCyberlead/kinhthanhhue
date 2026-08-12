/** Deterministic 32-bit hash in [0, 1). */
export function hash2(ix: number, iy: number, seed: number): number {
  let n = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263) ^ (seed | 0)
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296
}

export function hash3(ix: number, iy: number, iz: number, seed: number): number {
  return hash2(ix, iy ^ Math.imul(iz, 1597334677), seed)
}

export function fract(x: number): number {
  return x - Math.floor(x)
}

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

export function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

export function rgbToBytes(c: [number, number, number]): [number, number, number] {
  return [
    Math.round(clamp01(c[0] / 255) * 255),
    Math.round(clamp01(c[1] / 255) * 255),
    Math.round(clamp01(c[2] / 255) * 255),
  ]
}
