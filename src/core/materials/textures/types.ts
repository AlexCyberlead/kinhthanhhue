import type * as THREE from 'three'

export type LodLevel = 0 | 1 | 2

export type TextureFactoryId =
  | 'ngoiAmDuong'
  | 'ngoiMenVang'
  | 'ngoiMenXanh'
  | 'gachVo'
  | 'gachBatTrang'
  | 'goLim'
  | 'sonSon'
  | 'vangThep'
  | 'daThanh'
  | 'tuongVoi'
  | 'phapLam'
  | 'co'
  | 'dat'
  | 'dongThau'
  | 'nuoc'

export type UvRepeatMeters = {
  /** World metres covered by one U 0–1 cycle. [ước lượng hợp lý] */
  u: number
  /** World metres covered by one V 0–1 cycle. [ước lượng hợp lý] */
  v: number
}

export type TextureSet = {
  map: THREE.Texture
  normalMap?: THREE.Texture
  roughnessMap?: THREE.Texture
  aoMap?: THREE.Texture
  repeatMeters: UvRepeatMeters
}

export type PixelBuffers = {
  size: number
  /** RGBA, row 0 = top of image. */
  albedo: Uint8ClampedArray
  /** 0..1 height, same indexing as albedo pixels. */
  height: Float32Array
  /** 0..1 roughness. */
  roughness: Float32Array
  /** 0..1 ambient occlusion (1 = unoccluded). */
  ao: Float32Array
}

export type Generator = (size: number, lod: LodLevel) => PixelBuffers

/**
 * One albedo cycle in world metres. Kit UVs divide by these so tiling
 * matches the factory (0–1 UV boxes still show a dense surface).
 * [ước lượng hợp lý — module ngói 0.35 m, gạch vồ ~0.4×0.2]
 */
export const UV_REPEAT_METERS: Record<TextureFactoryId, UvRepeatMeters> = {
  ngoiAmDuong: { u: 2.8, v: 2.8 },
  ngoiMenVang: { u: 2.8, v: 2.8 },
  ngoiMenXanh: { u: 2.8, v: 2.8 },
  gachVo: { u: 4.0, v: 4.0 },
  gachBatTrang: { u: 3.2, v: 3.2 },
  goLim: { u: 0.8, v: 1.6 },
  sonSon: { u: 1.0, v: 2.0 },
  vangThep: { u: 1.0, v: 1.0 },
  daThanh: { u: 2.4, v: 2.4 },
  tuongVoi: { u: 4.0, v: 4.0 },
  phapLam: { u: 1.2, v: 1.2 },
  co: { u: 8.0, v: 8.0 },
  dat: { u: 6.0, v: 6.0 },
  dongThau: { u: 1.0, v: 1.0 },
  nuoc: { u: 4.0, v: 4.0 },
}

/** LOD0 = 512 (hero) · LOD1 = 256 (WorldScene hiện tại) · LOD2 = 128 */
export function textureSizeForLod(lod: LodLevel): 128 | 256 | 512 {
  if (lod === 0) return 512
  if (lod === 1) return 256
  return 128
}
