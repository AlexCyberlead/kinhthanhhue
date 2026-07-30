import * as THREE from 'three'

export type MaterialId =
  | 'ngoi_hoang_luu_ly'
  | 'ngoi_thanh_luu_ly'
  | 'mai_ngoi_am_duong'
  | 'go_son_son'
  | 'vang_thep'
  | 'go_lim'
  | 'da_thanh'
  | 'gach_vo'
  | 'gach_bat_trang'
  | 'dong_thau'
  | 'phap_lam'
  | 'tuong_voi'
  | 'nuoc'
  | 'co_xanh'
  | 'dat_nen'

type Spec = {
  color: string
  roughness: number
  metalness: number
  emissive?: string
  emissiveIntensity?: number
}

const SPECS: Record<MaterialId, Spec> = {
  ngoi_hoang_luu_ly: { color: '#D4A017', roughness: 0.42, metalness: 0.08 },
  ngoi_thanh_luu_ly: { color: '#2E5E4E', roughness: 0.45, metalness: 0.06 },
  mai_ngoi_am_duong: { color: '#6B4E3D', roughness: 0.7, metalness: 0.02 },
  go_son_son: { color: '#8B1A1A', roughness: 0.38, metalness: 0.05 },
  vang_thep: { color: '#C9A227', roughness: 0.28, metalness: 0.65 },
  go_lim: { color: '#4A2F1F', roughness: 0.55, metalness: 0.02 },
  da_thanh: { color: '#6E6E68', roughness: 0.78, metalness: 0.04 },
  gach_vo: { color: '#9C6B4F', roughness: 0.82, metalness: 0.02 },
  gach_bat_trang: { color: '#C4B7A2', roughness: 0.7, metalness: 0.03 },
  dong_thau: { color: '#B87333', roughness: 0.35, metalness: 0.75 },
  phap_lam: { color: '#1F4E79', roughness: 0.25, metalness: 0.35, emissive: '#0a2a4a', emissiveIntensity: 0.05 },
  tuong_voi: { color: '#E8DCC8', roughness: 0.88, metalness: 0.0 },
  nuoc: { color: '#3A6B7A', roughness: 0.08, metalness: 0.35 },
  co_xanh: { color: '#4F6B3C', roughness: 0.95, metalness: 0.0 },
  dat_nen: { color: '#7A6A52', roughness: 0.95, metalness: 0.0 },
}

const cache = new Map<string, THREE.MeshStandardMaterial>()

function keyOf(id: MaterialId, lod: 0 | 1 | 2): string {
  return `${id}::${lod}`
}

/**
 * Shared PBR material registry — cache instances, reuse across entire scene.
 */
export function getMaterial(id: MaterialId, lod: 0 | 1 | 2 = 0): THREE.MeshStandardMaterial {
  const key = keyOf(id, lod)
  const hit = cache.get(key)
  if (hit) return hit

  const spec = SPECS[id]
  const mat = new THREE.MeshStandardMaterial({
    color: spec.color,
    roughness: lod === 2 ? Math.min(1, spec.roughness + 0.15) : spec.roughness,
    metalness: lod === 2 ? spec.metalness * 0.5 : spec.metalness,
    emissive: spec.emissive ?? '#000000',
    emissiveIntensity: spec.emissiveIntensity ?? 0,
    flatShading: lod === 2,
  })
  mat.name = key
  cache.set(key, mat)
  return mat
}

export function listMaterialIds(): MaterialId[] {
  return Object.keys(SPECS) as MaterialId[]
}

export function disposeMaterialLibrary(): void {
  for (const mat of cache.values()) mat.dispose()
  cache.clear()
}
