import type { MonumentModule } from '../../core/types/MonumentModule'
import { sanDaiTrieuNghi } from './sanDaiTrieuNghi'
import { phamSon } from './phamSonModule'
import { tuTuong } from './tuTuongModule'

/**
 * WAVE B / B3 — Sân Đại Triều Nghi cluster.
 *
 * Default register: chỉ `sanDaiTrieuNghi` (đã gồm sân + phẩm sơn + tứ tượng).
 * `phamSon` / `tuTuong` là optional split modules — KHÔNG register cùng lúc
 * với `san-dai-trieu-nghi` kẻo mesh bị nhân đôi.
 */
export const daiTrieuModules: MonumentModule[] = [sanDaiTrieuNghi]

export const daiTrieuOptionalModules: MonumentModule[] = [phamSon, tuTuong]

export { sanDaiTrieuNghi, phamSon, tuTuong }
export { buildCourtyard, COURT_Y, COURT_W, COURT_D } from './courtyard'
export { buildPhamSon, PHAM_SON_RANKS, PHAM_SON_X } from './phamSon'
export { buildTuTuong, TU_TUONG_LAKE_CORNERS } from './tuTuong'
export { countDrawCalls, estimateTris } from './geoUtils'
