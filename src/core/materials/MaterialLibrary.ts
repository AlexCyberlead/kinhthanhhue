import * as THREE from 'three'
import {
  disposeTextureCache,
  getTextureSet,
  type TextureFactoryId,
} from './textures'

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
  factory: TextureFactoryId
}

const SPECS: Record<MaterialId, Spec> = {
  ngoi_hoang_luu_ly: { color: '#D4A017', roughness: 0.42, metalness: 0.08, factory: 'ngoiMenVang' },
  ngoi_thanh_luu_ly: { color: '#2E5E4E', roughness: 0.45, metalness: 0.06, factory: 'ngoiMenXanh' },
  mai_ngoi_am_duong: { color: '#6B4E3D', roughness: 0.7, metalness: 0.02, factory: 'ngoiAmDuong' },
  go_son_son: { color: '#8B1A1A', roughness: 0.38, metalness: 0.05, factory: 'sonSon' },
  vang_thep: { color: '#C9A227', roughness: 0.28, metalness: 0.65, factory: 'vangThep' },
  go_lim: { color: '#4A2F1F', roughness: 0.55, metalness: 0.02, factory: 'goLim' },
  da_thanh: { color: '#6E6E68', roughness: 0.78, metalness: 0.04, factory: 'daThanh' },
  gach_vo: { color: '#9C6B4F', roughness: 0.82, metalness: 0.02, factory: 'gachVo' },
  gach_bat_trang: { color: '#C4B7A2', roughness: 0.7, metalness: 0.03, factory: 'gachBatTrang' },
  dong_thau: { color: '#B87333', roughness: 0.35, metalness: 0.75, factory: 'dongThau' },
  phap_lam: {
    color: '#1F4E79',
    roughness: 0.25,
    metalness: 0.35,
    emissive: '#0a2a4a',
    emissiveIntensity: 0.05,
    factory: 'phapLam',
  },
  tuong_voi: { color: '#E8DCC8', roughness: 0.88, metalness: 0.0, factory: 'tuongVoi' },
  nuoc: { color: '#3A6B7A', roughness: 0.08, metalness: 0.35, factory: 'nuoc' },
  co_xanh: { color: '#4F6B3C', roughness: 0.95, metalness: 0.0, factory: 'co' },
  dat_nen: { color: '#7A6A52', roughness: 0.95, metalness: 0.0, factory: 'dat' },
}

/** Men ngói + pháp lam: clearcoat ở LOD0 (stretch phiên 1). */
const GLAZED: ReadonlySet<MaterialId> = new Set([
  'ngoi_hoang_luu_ly',
  'ngoi_thanh_luu_ly',
  'gach_bat_trang',
  'phap_lam',
])

const cache = new Map<string, THREE.MeshStandardMaterial>()

let currentWetness = 0

function keyOf(id: MaterialId, lod: 0 | 1 | 2): string {
  return `${id}::${lod}`
}

function baseClearcoat(id: MaterialId, lod: 0 | 1 | 2): number {
  return lod === 0 && GLAZED.has(id) ? 0.42 : 0
}

function applyWetnessTo(mat: THREE.MeshStandardMaterial): void {
  const baseRough = mat.userData.baseRoughness as number
  const coat = (mat.userData.baseClearcoat as number) ?? 0
  const wet = currentWetness
  mat.roughness = baseRough * (1 - 0.42 * wet)
  // color is a tint over the albedo map (default white). Rain darkens slightly.
  const k = 1 - 0.14 * wet
  mat.color.setRGB(k, k, k)
  if (mat instanceof THREE.MeshPhysicalMaterial) {
    mat.clearcoat = coat + 0.22 * wet
    mat.clearcoatRoughness = Math.max(0.08, 0.28 - 0.12 * wet)
  }
}

/**
 * Shared PBR material registry — cache instances, reuse across entire scene.
 * Always has `map`. LOD 0–1 also get normal / roughness / AO.
 * `color` is a tint multiplier (default white); albedo lives in the map.
 */
export function getMaterial(id: MaterialId, lod: 0 | 1 | 2 = 0): THREE.MeshStandardMaterial {
  const key = keyOf(id, lod)
  const hit = cache.get(key)
  if (hit) return hit

  const spec = SPECS[id]
  const tex = getTextureSet(spec.factory, lod)
  const roughness = lod === 2 ? Math.min(1, spec.roughness + 0.15) : spec.roughness
  const metalness = lod === 2 ? spec.metalness * 0.5 : spec.metalness
  const coat = baseClearcoat(id, lod)

  const params: THREE.MeshStandardMaterialParameters = {
    color: 0xffffff,
    map: tex.map,
    roughness,
    metalness,
    emissive: spec.emissive ?? '#000000',
    emissiveIntensity: spec.emissiveIntensity ?? 0,
    flatShading: lod === 2,
    envMapIntensity: lod === 0 ? 0.95 : 0.6,
  }

  if (lod < 2) {
    params.normalMap = tex.normalMap
    params.normalScale = new THREE.Vector2(lod === 0 ? 0.9 : 0.62, lod === 0 ? 0.9 : 0.62)
    params.roughnessMap = tex.roughnessMap
    params.aoMap = tex.aoMap
    params.aoMapIntensity = 0.85
  }

  const mat =
    coat > 0
      ? new THREE.MeshPhysicalMaterial({
          ...params,
          clearcoat: coat,
          clearcoatRoughness: 0.28,
        })
      : new THREE.MeshStandardMaterial(params)

  mat.name = key
  mat.userData.materialId = id
  mat.userData.baseRoughness = roughness
  mat.userData.baseClearcoat = coat
  applyWetnessTo(mat)
  cache.set(key, mat)
  return mat
}

export function listMaterialIds(): MaterialId[] {
  return Object.keys(SPECS) as MaterialId[]
}

/** raining → roughness ↓ / tint tối nhẹ. Safe to call any time. */
export function applyWetness(amount: number): void {
  currentWetness = Math.min(1, Math.max(0, amount))
  for (const mat of cache.values()) applyWetnessTo(mat)
}

export function disposeMaterialLibrary(): void {
  for (const mat of cache.values()) mat.dispose()
  cache.clear()
  disposeTextureCache()
}
