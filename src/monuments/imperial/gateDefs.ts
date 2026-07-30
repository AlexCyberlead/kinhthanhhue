import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildImperialGate, type ImperialGateStyle } from './buildImperialGate'

type GateDef = {
  id: string
  displayName: { vi: string; en: string }
  anchor: [number, number, number]
  rotationY: number
  boundingRadius: number
  style: ImperialGateStyle
  width?: number
  poi: { vi: string; en: string; year?: string }
}

/**
 * 3 cửa Hoàng thành (Ngọ Môn = B1 riêng).
 * Anchors exact từ buildings.json.
 */
const GATE_DEFS: GateDef[] = [
  {
    id: 'hien-nhon-mon',
    displayName: { vi: 'Cửa Hiển Nhơn', en: 'Hien Nhon Gate' },
    anchor: [308, 2, -180],
    rotationY: 1.5708,
    boundingRadius: 25,
    style: 'tam-quan',
    width: 18,
    poi: {
      vi: 'Cổng Đông Hoàng thành. Xây 1804. Anchor [ước lượng hợp lý] nửa cạnh 622 m.',
      en: 'East gate of the Imperial City. Built 1804. Anchor [estimated].',
      year: '1804',
    },
  },
  {
    id: 'chuong-duc-mon',
    displayName: { vi: 'Cửa Chương Đức', en: 'Chuong Duc Gate' },
    anchor: [-308, 2, -180],
    rotationY: -1.5708,
    boundingRadius: 25,
    style: 'tam-quan',
    width: 18,
    poi: {
      vi: 'Cổng Tây Hoàng thành; trùng tu 2003–2004 theo mẫu Khải Định. Anchor [ước lượng hợp lý].',
      en: 'West gate; restored 2003–2004 after Khai Dinh model. Anchor [estimated].',
      year: '1804',
    },
  },
  {
    id: 'hoa-binh-mon',
    displayName: { vi: 'Cửa Hòa Bình', en: 'Hoa Binh Gate' },
    anchor: [0, 2, -480],
    rotationY: 3.1416,
    boundingRadius: 25,
    style: 'vom',
    width: 14,
    poi: {
      vi: 'Cổng Bắc Hoàng thành. Xây 1804. Anchor [ước lượng hợp lý] từ cạnh ~604 m N–S.',
      en: 'North gate of the Imperial City. Built 1804. Anchor [estimated].',
      year: '1804',
    },
  },
]

function toModule(def: GateDef): MonumentModule {
  return {
    id: def.id,
    displayName: def.displayName,
    anchor: def.anchor,
    rotationY: def.rotationY,
    boundingRadius: def.boundingRadius,
    poi: def.poi,
    build(lod) {
      const g = buildImperialGate({
        lod,
        style: def.style,
        width: def.width,
      })
      g.name = def.id
      return g
    },
  }
}

export const imperialGateModules: MonumentModule[] = GATE_DEFS.map(toModule)

export const imperialGateIds = GATE_DEFS.map((d) => d.id)
