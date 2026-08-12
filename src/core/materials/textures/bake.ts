import * as THREE from 'three'
import { clamp01 } from './prng'
import type { LodLevel, PixelBuffers, TextureSet, UvRepeatMeters } from './types'

export function createBuffers(size: number): PixelBuffers {
  const n = size * size
  const roughness = new Float32Array(n)
  const ao = new Float32Array(n)
  roughness.fill(0.7)
  ao.fill(1)
  return {
    size,
    albedo: new Uint8ClampedArray(n * 4),
    height: new Float32Array(n),
    roughness,
    ao,
  }
}

export function setAlbedo(
  buf: PixelBuffers,
  i: number,
  r: number,
  g: number,
  b: number,
): void {
  const o = i * 4
  buf.albedo[o] = r
  buf.albedo[o + 1] = g
  buf.albedo[o + 2] = b
  buf.albedo[o + 3] = 255
}

export function writePixel(
  buf: PixelBuffers,
  i: number,
  r: number,
  g: number,
  b: number,
  height: number,
  roughness: number,
  ao: number,
): void {
  setAlbedo(buf, i, r, g, b)
  buf.height[i] = height
  buf.roughness[i] = roughness
  buf.ao[i] = ao
}

function canvasFromRgba(data: Uint8ClampedArray, size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: false })
  if (!ctx) throw new Error('Texture factory: 2d canvas unavailable')
  ctx.putImageData(new ImageData(data, size, size), 0, 0)
  return canvas
}

function makeCanvasTexture(data: Uint8ClampedArray, size: number, srgb: boolean): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvasFromRgba(data, size))
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.generateMipmaps = true
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  tex.flipY = true
  tex.needsUpdate = true
  return tex
}

function bakeNormalRgba(buf: PixelBuffers, strength: number): Uint8ClampedArray {
  const { size, height } = buf
  const out = new Uint8ClampedArray(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const iL = y * size + ((x - 1 + size) % size)
      const iR = y * size + ((x + 1) % size)
      const iU = ((y - 1 + size) % size) * size + x
      const iD = ((y + 1) % size) * size + x
      const dx = (height[iL] - height[iR]) * strength
      // Canvas Y grows down; OpenGL normal +Y is up in UV after flipY.
      const dy = (height[iD] - height[iU]) * strength
      const inv = 1 / Math.hypot(dx, dy, 1)
      const o = (y * size + x) * 4
      out[o] = Math.round((dx * inv * 0.5 + 0.5) * 255)
      out[o + 1] = Math.round((dy * inv * 0.5 + 0.5) * 255)
      out[o + 2] = Math.round((1 * inv * 0.5 + 0.5) * 255)
      out[o + 3] = 255
    }
  }
  return out
}

function bakeGrayRgba(src: Float32Array, size: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(size * size * 4)
  for (let i = 0; i < src.length; i++) {
    const g = Math.round(clamp01(src[i]) * 255)
    const o = i * 4
    out[o] = g
    out[o + 1] = g
    out[o + 2] = g
    out[o + 3] = 255
  }
  return out
}

export function bakeTextureSet(
  buf: PixelBuffers,
  lod: LodLevel,
  repeatMeters: UvRepeatMeters,
  normalStrength: number,
): TextureSet {
  const { size } = buf
  const anisotropy = lod === 0 ? 8 : lod === 1 ? 4 : 1
  const map = makeCanvasTexture(buf.albedo, size, true)
  map.anisotropy = anisotropy

  const set: TextureSet = { map, repeatMeters }
  if (lod < 2) {
    const normal = makeCanvasTexture(bakeNormalRgba(buf, normalStrength), size, false)
    const rough = makeCanvasTexture(bakeGrayRgba(buf.roughness, size), size, false)
    const ao = makeCanvasTexture(bakeGrayRgba(buf.ao, size), size, false)
    normal.anisotropy = anisotropy
    rough.anisotropy = anisotropy
    ao.anisotropy = anisotropy
    set.normalMap = normal
    set.roughnessMap = rough
    set.aoMap = ao
  }
  return set
}
