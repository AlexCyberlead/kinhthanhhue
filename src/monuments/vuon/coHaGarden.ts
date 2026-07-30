import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildGardenHardscape } from './buildHardscape'

/**
 * Vườn Cơ Hạ (1837) — hardscape layout.
 * Anchor khớp zone vegetation `coHa` (−150, −230) [ước lượng].
 * Lịch sử: ngự uyển / Minh Hồ; Thiệu Trị có cảnh *Hồ tân liễu lãng*.
 */
function buildCoHaGarden(lod: 0 | 1 | 2) {
  const root = buildGardenHardscape({
    lod,
    style: 'co-ha',
    halfW: 55,
    halfD: 42,
    seed: 0xc00a01,
  })
  root.name = 'vuon-co-ha'
  return root
}

export const coHaGardenModule: MonumentModule = {
  id: 'vuon-co-ha',
  displayName: { vi: 'Vườn Cơ Hạ', en: 'Cơ Hạ Garden' },
  build: buildCoHaGarden,
  // Khớp VegetationSystem ZONES.coHa — phía Tây nội đình / gần giả sơn [ước lượng]
  anchor: [-150, 0, -230],
  rotationY: 0,
  boundingRadius: 75,
  poi: {
    vi: 'Vườn Cơ Hạ — ngự uyển (1837), hardscape: lối đá, non bộ, hồ nhỏ, chậu cảnh, bình phong long mã, cầu gỗ (Kim Nghê stylized). [ước lượng] anchor phía Tây nội đình (−150, −230), khớp zone vegetation.',
    en: 'Cơ Hạ Garden (1837) — hardscape only: stone paths, rockery, pond, pots, long-mã screen wall, timber bridge cue. [estimate] west inner-court anchor (−150, −230).',
    year: '1837',
  },
}
