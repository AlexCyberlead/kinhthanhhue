import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildGardenHardscape } from './buildHardscape'

/**
 * Vườn Thiệu Phương (1828) — hardscape layout + ao Liên Trì cue.
 * Anchor khớp zone vegetation `thieuPhuong` (140, −210) [ước lượng].
 * Phía Đông nội đình / Ngự Uyển.
 */
function buildThieuPhuong(lod: 0 | 1 | 2) {
  const root = buildGardenHardscape({
    lod,
    style: 'thieu-phuong',
    halfW: 60,
    halfD: 48,
    seed: 0x7f1e0f,
  })
  root.name = 'vuon-thieu-phuong'
  return root
}

export const thieuPhuongModule: MonumentModule = {
  id: 'vuon-thieu-phuong',
  displayName: { vi: 'Vườn Thiệu Phương', en: 'Thiệu Phương Garden' },
  build: buildThieuPhuong,
  // Khớp VegetationSystem ZONES.thieuPhuong + gần buildings.json vuon-ngu-uyen [ước lượng]
  anchor: [140, 0, -210],
  rotationY: 0,
  boundingRadius: 80,
  poi: {
    vi: 'Vườn Thiệu Phương — ngự uyển (1828), hardscape: lối đá, non bộ, ao (Liên Trì cue), chậu cảnh, bình phong long mã. [ước lượng] anchor phía Đông nội đình (140, −210); gần vuon-ngu-uyen trong buildings.json.',
    en: 'Thiệu Phương Garden (1828) — hardscape only: paths, rockery, lotus-pond cue, pots, long-mã screen. [estimate] east inner-court anchor (140, −210).',
    year: '1828',
  },
}
