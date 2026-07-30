import type { MonumentModule } from '../../core/types/MonumentModule'
import { thaiHoaModule } from './dienThaiHoa'

/**
 * WAVE B / B2 — Điện Thái Hòa.
 * Anchor: buildings.json `dien-thai-hoa` [0, 1, -48].
 */
export const thaiHoaModules: MonumentModule[] = [thaiHoaModule]

export { thaiHoaModule, buildDienThaiHoa } from './dienThaiHoa'
export { buildThaiHoaColumns } from './columns'
export { buildThroneAndCanopy } from './throne'
export { estimateTris, countDrawCalls } from './geometry'
