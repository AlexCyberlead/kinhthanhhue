import type * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildDinhHall, buildDinhHallRuin } from './buildDinhHall'

type HallSpec = {
  id: string
  displayName: { vi: string; en: string }
  anchor: [number, number, number]
  rotationY: number
  boundingRadius: number
  year: string
  poi: { vi: string; en: string; year?: string }
  width: number
  depth: number
  tiers: 1 | 2
  tile: 'ngoi_hoang_luu_ly' | 'ngoi_thanh_luu_ly'
  columnsX: number
  columnsZ: number
  variant: 'royal' | 'office' | 'residence' | 'service'
}

function hallModule(spec: HallSpec): MonumentModule {
  return {
    id: spec.id,
    displayName: spec.displayName,
    anchor: spec.anchor,
    rotationY: spec.rotationY,
    boundingRadius: spec.boundingRadius,
    poi: spec.poi,
    build(lod) {
      return buildDinhHall({
        width: spec.width,
        depth: spec.depth,
        tiers: spec.tiers,
        tile: spec.tile,
        columnsX: spec.columnsX,
        columnsZ: spec.columnsZ,
        variant: spec.variant,
        lod,
        name: spec.id,
      })
    },
  }
}

/** Điện Càn Thành — tư cung, mái hoàng, lớn hơn Cần Chánh một bậc. */
export const dienCanThanh = hallModule({
  id: 'dien-can-thanh',
  displayName: { vi: 'Điện Càn Thành', en: 'Can Thanh Palace' },
  anchor: [0, 1, -205],
  rotationY: 0,
  boundingRadius: 50,
  year: '1804',
  width: 42,
  depth: 26,
  tiers: 2,
  tile: 'ngoi_hoang_luu_ly',
  columnsX: 9,
  columnsZ: 5,
  variant: 'royal',
  poi: {
    vi: 'Điện Càn Thành — tư cung vua; phá 1947/1968. Bản mesh mặc định = restored. Anchor [ước lượng hợp lý].',
    en: 'Can Thanh Palace — emperor’s private residence; destroyed 1947/1968. Default mesh = restored. Anchor [estimated].',
    year: '1804',
  },
})

export function buildCanThanhRuin(lod: 0 | 1 | 2): THREE.Group {
  return buildDinhHallRuin({
    width: 42,
    depth: 26,
    tiers: 2,
    tile: 'ngoi_hoang_luu_ly',
    columnsX: 9,
    columnsZ: 5,
    variant: 'royal',
    status: 'ruin',
    lod,
    name: 'dien-can-thanh',
  })
}

export const dienVanMinh = hallModule({
  id: 'dien-van-minh',
  displayName: { vi: 'Điện Văn Minh', en: 'Van Minh Hall' },
  anchor: [55, 1, -145],
  rotationY: 0,
  boundingRadius: 30,
  year: '1804',
  width: 22,
  depth: 14,
  tiers: 1,
  tile: 'ngoi_thanh_luu_ly',
  columnsX: 5,
  columnsZ: 3,
  variant: 'office',
  poi: {
    vi: 'Điện Văn Minh — tả văn, bên trái Cần Chánh. Phá 1947. Anchor [ước lượng hợp lý].',
    en: 'Van Minh Hall — civil (east) office left of Cần Chánh. Destroyed 1947. Anchor [estimated].',
    year: '1804',
  },
})

export const dienVoHien = hallModule({
  id: 'dien-vo-hien',
  displayName: { vi: 'Điện Võ Hiển', en: 'Vo Hien Hall' },
  anchor: [-55, 1, -145],
  rotationY: 0,
  boundingRadius: 30,
  year: '1804',
  width: 22,
  depth: 14,
  tiers: 1,
  tile: 'ngoi_thanh_luu_ly',
  columnsX: 5,
  columnsZ: 3,
  variant: 'office',
  poi: {
    vi: 'Điện Võ Hiển — hữu võ, đối xứng Văn Minh. Phá 1947. Anchor [ước lượng hợp lý].',
    en: 'Vo Hien Hall — military (west) office opposite Văn Minh. Destroyed 1947. Anchor [estimated].',
    year: '1804',
  },
})

export const dienTrinhMinh = hallModule({
  id: 'dien-trinh-minh',
  displayName: { vi: 'Điện Trinh Minh', en: 'Trinh Minh Hall' },
  anchor: [-50, 1, -195],
  rotationY: -1.5708,
  boundingRadius: 28,
  year: '1811',
  width: 20,
  depth: 13,
  tiers: 1,
  tile: 'ngoi_thanh_luu_ly',
  columnsX: 5,
  columnsZ: 3,
  variant: 'residence',
  poi: {
    vi: 'Điện Trinh Minh — phía Tây Càn Thành. Anchor [ước lượng hợp lý].',
    en: 'Trinh Minh Hall — west of Can Thanh. Anchor [estimated].',
    year: '1811',
  },
})

export const dienQuangMinh = hallModule({
  id: 'dien-quang-minh',
  displayName: { vi: 'Điện Quang Minh', en: 'Quang Minh Hall' },
  anchor: [50, 1, -195],
  rotationY: 1.5708,
  boundingRadius: 28,
  year: '1804',
  width: 20,
  depth: 13,
  tiers: 1,
  tile: 'ngoi_thanh_luu_ly',
  columnsX: 5,
  columnsZ: 3,
  variant: 'residence',
  poi: {
    vi: 'Điện Quang Minh — Đông cung hoàng tử. Anchor [ước lượng hợp lý].',
    en: 'Quang Minh Hall — Crown Prince’s eastern palace. Anchor [estimated].',
    year: '1804',
  },
})

export const vienThuanHuy = hallModule({
  id: 'vien-thuan-huy',
  displayName: { vi: 'Viện Thuận Huy', en: 'Thuan Huy Pavilion' },
  anchor: [-40, 1, -230],
  rotationY: 0,
  boundingRadius: 22,
  year: '1804',
  width: 14,
  depth: 10,
  tiers: 1,
  tile: 'ngoi_thanh_luu_ly',
  columnsX: 3,
  columnsZ: 2,
  variant: 'residence',
  poi: {
    vi: 'Viện Thuận Huy — viện nhỏ sau bên phải Càn Thành. Anchor [ước lượng hợp lý].',
    en: 'Thuan Huy Pavilion — small court west behind Can Thanh. Anchor [estimated].',
    year: '1804',
  },
})

export const vienDuongTam = hallModule({
  id: 'vien-duong-tam',
  displayName: { vi: 'Viện Dưỡng Tâm', en: 'Duong Tam Pavilion' },
  anchor: [40, 1, -230],
  rotationY: 0,
  boundingRadius: 22,
  year: '1804',
  width: 14,
  depth: 10,
  tiers: 1,
  tile: 'ngoi_thanh_luu_ly',
  columnsX: 3,
  columnsZ: 2,
  variant: 'residence',
  poi: {
    vi: 'Viện Dưỡng Tâm — viện nhỏ sau bên trái Càn Thành. Anchor [ước lượng hợp lý].',
    en: 'Duong Tam Pavilion — small court east behind Can Thanh. Anchor [estimated].',
    year: '1804',
  },
})

export const thuongThienDuong = hallModule({
  id: 'thuong-thien-duong',
  displayName: { vi: 'Thượng Thiện Đường', en: 'Imperial Kitchen' },
  anchor: [-90, 1, -170],
  rotationY: 0,
  boundingRadius: 30,
  year: '1804',
  width: 24,
  depth: 14,
  tiers: 1,
  tile: 'ngoi_thanh_luu_ly',
  columnsX: 5,
  columnsZ: 3,
  variant: 'service',
  poi: {
    vi: 'Thượng Thiện Đường — bếp ngự. Phá 1947. Anchor [ước lượng hợp lý].',
    en: 'Imperial Kitchen — service halls. Destroyed 1947. Anchor [estimated].',
    year: '1804',
  },
})

export const innerHallModules: MonumentModule[] = [
  dienCanThanh,
  dienVanMinh,
  dienVoHien,
  dienTrinhMinh,
  dienQuangMinh,
  vienThuanHuy,
  vienDuongTam,
  thuongThienDuong,
]
