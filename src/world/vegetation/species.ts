import type { SpeciesDef, VegetationSpeciesId } from './types'

/**
 * 8 loài bắt buộc — ids khớp docs/research/nature_people.md.
 * baseCount tổng ≥ 5000 ở density=1.
 */
export const SPECIES: Record<VegetationSpeciesId, SpeciesDef> = {
  tree_nhan: {
    id: 'tree_nhan',
    baseCount: 480,
    height: 10,
    canopyRadius: 5,
    trunkColor: '#5C4033',
    canopyColor: '#2F6B2A',
    accentColor: '#C4A35A',
    windStrength: 0.35,
  },
  tree_phuong_vi: {
    id: 'tree_phuong_vi',
    baseCount: 560,
    height: 12,
    canopyRadius: 7.5,
    trunkColor: '#6B4423',
    canopyColor: '#3F8F3A',
    accentColor: '#E6392B',
    windStrength: 0.55,
  },
  tree_ngo_dong: {
    id: 'tree_ngo_dong',
    baseCount: 120,
    height: 15,
    canopyRadius: 5.5,
    trunkColor: '#7A6A55',
    canopyColor: '#4A7A3C',
    accentColor: '#C48BB8',
    windStrength: 0.4,
  },
  tree_su_dai: {
    id: 'tree_su_dai',
    baseCount: 460,
    height: 4.5,
    canopyRadius: 2.8,
    trunkColor: '#8B6914',
    canopyColor: '#4F8A3E',
    accentColor: '#FFF8E7',
    windStrength: 0.3,
  },
  tree_tre: {
    id: 'tree_tre',
    baseCount: 920,
    height: 10,
    canopyRadius: 2.5,
    trunkColor: '#5C9A45',
    canopyColor: '#2E6B32',
    accentColor: '#A8C96A',
    windStrength: 0.9,
  },
  plant_sen: {
    id: 'plant_sen',
    baseCount: 2000,
    height: 1.2,
    canopyRadius: 0.55,
    trunkColor: '#3A7A3C',
    canopyColor: '#3A7A3C',
    accentColor: '#F7F2E8',
    windStrength: 0.45,
    waterY: 0.08,
  },
  plant_sung: {
    id: 'plant_sung',
    baseCount: 680,
    height: 0.15,
    canopyRadius: 0.4,
    trunkColor: '#1F5A3A',
    canopyColor: '#1F5A3A',
    accentColor: '#7B5EA7',
    windStrength: 0.25,
    waterY: 0.04,
  },
  tree_thong: {
    id: 'tree_thong',
    baseCount: 160,
    height: 18,
    canopyRadius: 4,
    trunkColor: '#5C4033',
    canopyColor: '#2A5A32',
    windStrength: 0.2,
  },
}

export const SPECIES_ORDER: VegetationSpeciesId[] = [
  'tree_nhan',
  'tree_phuong_vi',
  'tree_ngo_dong',
  'tree_su_dai',
  'tree_tre',
  'plant_sen',
  'plant_sung',
  'tree_thong',
]

/** Tổng baseCount ở density=1. */
export const BASE_INSTANCE_TOTAL = SPECIES_ORDER.reduce(
  (sum, id) => sum + SPECIES[id].baseCount,
  0,
)
