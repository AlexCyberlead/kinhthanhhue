export { TerrainSystem, getTerrainTriangleEstimate } from './TerrainSystem'
export {
  TERRAIN_BOUNDS,
  IMPERIAL_CITY,
  FORBIDDEN_CITY,
  IMPERIAL_MOAT,
  THAI_DICH,
  NOI_KIM_THUY,
  TINH_TAM,
} from './terrainConfig'
export type { TerrainBounds } from './terrainConfig'
export {
  sampleHeight,
  citadelOuterSDF,
  riverWeight,
  moatWeight,
  imperialMoatWeight,
  thaiDichWeight,
  imperialInteriorWeight,
  noiKimThuyWeight,
  tinhTamWeight,
} from './heightfield'
export { splatWeights } from './splatWeights'
export { createTerrainMaterial } from './createTerrainMaterial'
