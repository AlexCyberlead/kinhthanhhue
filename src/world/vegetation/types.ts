export type VegetationSpeciesId =
  | 'tree_nhan'
  | 'tree_phuong_vi'
  | 'tree_ngo_dong'
  | 'tree_su_dai'
  | 'tree_tre'
  | 'plant_sen'
  | 'plant_sung'
  | 'tree_thong'

export type VegetationLod = 0 | 1 | 2

export type VegetationSystemProps = {
  /** Scale factor for instance counts. `density=1` → ≥5000 instances. */
  density?: number
  /** Vertex wind; set `false` for prefers-reduced-motion. Default `true`. */
  enableWind?: boolean
}

export type SpeciesDef = {
  id: VegetationSpeciesId
  /** Base instance count at density=1 (before near/far LOD split). */
  baseCount: number
  height: number
  canopyRadius: number
  trunkColor: string
  canopyColor: string
  accentColor?: string
  /** Relative wind bend (tre > phượng > ngô đồng > thông). */
  windStrength: number
  /** Y offset for water plants. */
  waterY?: number
}

export type Placement = {
  x: number
  y: number
  z: number
  rotY: number
  scale: number
}
