import type { MaterialId } from '../../../materials/MaterialLibrary'

/** Ridge creature / bờ nóc. `ridge` thắng `ridgeOrnament` nếu cả hai có. */
export type RidgeKind = 'long-chau-nhat' | 'phuong' | 'bau-phap-lam' | 'none'

export type RoofOpts = {
  width: number
  depth: number
  tiers: number
  curvature?: number
  tileMaterial?: MaterialId
  /** @deprecated dùng `ridge` — vẫn map dragon→long-chau-nhat, phoenix→phuong */
  ridgeOrnament?: 'dragon' | 'phoenix' | 'none'
  lod?: 0 | 1 | 2
  ridge?: RidgeKind
  /** Cổ diêm giữa tầng. Mặc định bật khi `tiers > 1`. */
  coDiem?: boolean
  /** Nhân UV + khoảng ô kê. 1 = cycle ngói 2.8 m. [ước lượng hợp lý] */
  tileScale?: number
  /** Stretch: máng thừa lưu dọc diềm +Z. */
  linkedValley?: boolean
}

export type RoofFrame = {
  halfW: number
  halfD: number
  rise: number
  curvature: number
  /** Ridge chạy theo X (width ≥ depth) hoặc Z. */
  ridgeAlongX: boolean
  /** Nửa chiều dài sống nóc. [ước lượng hợp lý] */
  ridgeHalf: number
  tileScale: number
  lod: 0 | 1 | 2
}

export function resolveRidge(opts: RoofOpts): RidgeKind {
  if (opts.ridge) return opts.ridge
  if (opts.ridgeOrnament === 'dragon') return 'long-chau-nhat'
  if (opts.ridgeOrnament === 'phoenix') return 'phuong'
  return 'none'
}
