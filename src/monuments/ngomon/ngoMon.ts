import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildUPlatform } from './uPlatform'
import { buildNguPhung } from './nguPhung'
import { NGO_MON } from './geometry'

/**
 * Ngọ Môn + Lầu Ngũ Phụng — WAVE B / B1.
 * Nền đài chữ U, 5 lối (giữa vua), lầu 2 tầng, 9 bộ mái, ~100 cột.
 * Anchor: buildings.json ngo-mon [0, 2, 118].
 */
function buildNgoMon(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'ngo-mon'

  const platform = buildUPlatform(lod)
  root.add(platform)

  const pavilion = buildNguPhung(lod)
  pavilion.position.y = NGO_MON.bodyHeight + NGO_MON.deckThickness
  // Sit pavilion on north bar (slightly north of geometric center)
  pavilion.position.z = -NGO_MON.depth / 2 + NGO_MON.armThickness * 0.55
  root.add(pavilion)

  return root
}

export const ngoMonModule: MonumentModule = {
  id: 'ngo-mon',
  displayName: { vi: 'Ngọ Môn', en: 'Noon Gate' },
  build: buildNgoMon,
  anchor: [0, 2, 118],
  rotationY: 0,
  boundingRadius: 40,
  poi: {
    vi: 'Ngọ Môn — cổng chính phía Nam Hoàng thành, nền đài chữ U với 5 lối đi (giữa dành vua). Trên là Lầu Ngũ Phụng 2 tầng, 9 bộ mái (giữa hoàng lưu ly, 8 mái thanh lưu ly), ~100 cột gỗ lim sơn son. Định hình Minh Mạng 14 (1833–1834).',
    en: 'Noon Gate — main southern gate of the Imperial City: U-shaped terrace with five gateways (center for the emperor). Above, the two-storey Five Phoenix Pavilion with nine roof sets (center imperial yellow glaze, eight green) and ~100 vermillion-painted ironwood columns. Formed under Minh Mạng (1833–1834).',
    year: '1833',
  },
}

export const ngoMonModules: MonumentModule[] = [ngoMonModule]
