import type { TextureFactoryId, TextureSet } from './types'
import { UV_REPEAT_METERS, textureSizeForLod, type LodLevel } from './types'
import { bakeTextureSet } from './bake'
import { paintNgoiAmDuong, paintNgoiMenVang, paintNgoiMenXanh } from './ngoi'
import { paintDaThanh, paintGachBatTrang, paintGachVo, paintTuongVoi } from './masonry'
import {
  paintCo,
  paintDat,
  paintDongThau,
  paintGoLim,
  paintNuoc,
  paintPhapLam,
  paintSonSon,
  paintVangThep,
} from './organic'

export type { TextureFactoryId, TextureSet, UvRepeatMeters, LodLevel } from './types'
export { UV_REPEAT_METERS, textureSizeForLod } from './types'

const cache = new Map<string, TextureSet>()

const NORMAL_STRENGTH: Record<TextureFactoryId, number> = {
  ngoiAmDuong: 4.2,
  ngoiMenVang: 3.6,
  ngoiMenXanh: 3.6,
  gachVo: 3.2,
  gachBatTrang: 2.2,
  goLim: 2.4,
  sonSon: 1.6,
  vangThep: 1.8,
  daThanh: 2.8,
  tuongVoi: 1.4,
  phapLam: 2.0,
  co: 1.8,
  dat: 2.2,
  dongThau: 1.6,
  nuoc: 1.2,
}

function paint(id: TextureFactoryId, size: number, lod: LodLevel) {
  switch (id) {
    case 'ngoiAmDuong':
      return paintNgoiAmDuong(size, lod)
    case 'ngoiMenVang':
      return paintNgoiMenVang(size, lod)
    case 'ngoiMenXanh':
      return paintNgoiMenXanh(size, lod)
    case 'gachVo':
      return paintGachVo(size, lod)
    case 'gachBatTrang':
      return paintGachBatTrang(size, lod)
    case 'goLim':
      return paintGoLim(size, lod)
    case 'sonSon':
      return paintSonSon(size, lod)
    case 'vangThep':
      return paintVangThep(size, lod)
    case 'daThanh':
      return paintDaThanh(size, lod)
    case 'tuongVoi':
      return paintTuongVoi(size, lod)
    case 'phapLam':
      return paintPhapLam(size, lod)
    case 'co':
      return paintCo(size, lod)
    case 'dat':
      return paintDat(size, lod)
    case 'dongThau':
      return paintDongThau(size, lod)
    case 'nuoc':
      return paintNuoc(size, lod)
  }
}

function cacheKey(id: TextureFactoryId, lod: LodLevel, size: number): string {
  return `${id}::${lod}::${size}`
}

/** Deterministic procedural maps, cached by id + lod + size. */
export function getTextureSet(id: TextureFactoryId, lod: LodLevel): TextureSet {
  const size = textureSizeForLod(lod)
  const key = cacheKey(id, lod, size)
  const hit = cache.get(key)
  if (hit) return hit

  const buf = paint(id, size, lod)
  const set = bakeTextureSet(buf, lod, UV_REPEAT_METERS[id], NORMAL_STRENGTH[id])
  cache.set(key, set)
  return set
}

export function disposeTextureCache(): void {
  for (const set of cache.values()) {
    set.map.dispose()
    set.normalMap?.dispose()
    set.roughnessMap?.dispose()
    set.aoMap?.dispose()
  }
  cache.clear()
}
