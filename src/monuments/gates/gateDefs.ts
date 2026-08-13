import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildCitadelGate, type CitadelGateStyle } from './buildCitadelGate'
import { buildThuyQuan } from './buildThuyQuan'

type GateDef = {
  id: string
  displayName: { vi: string; en: string }
  anchor: [number, number, number]
  rotationY: number
  boundingRadius: number
  style: CitadelGateStyle
  width?: number
  poi: { vi: string; en: string; year?: string }
}

/**
 * 10 cửa đường bộ Kinh thành — id/anchor lấy từ buildings.json + layout.md.
 * Anchor toàn bộ [ước lượng hợp lý] (sai số cửa ~±80–200 m).
 *
 * Mapping tên phổ biến:
 * - Cửa Ngăn = Cửa Thể Nhơn (layout.md)
 * - Cửa Nhà Đồ = Cửa Chính Nam
 * - Cửa Hậu = Cửa Chính Bắc
 * - Tây Bắc = Cửa An Hòa
 */
const GATE_DEFS: GateDef[] = [
  {
    id: 'cua-chinh-nam',
    displayName: { vi: 'Cửa Chính Nam', en: 'Chinh Nam Gate' },
    anchor: [-420, 0, 1180],
    rotationY: 0,
    boundingRadius: 20,
    style: 'vom',
    width: 14,
    poi: {
      vi: 'Cửa Chính Nam (còn gọi cửa Nhà Đồ), mặt Nam Kinh thành. Xây 1809. Anchor [ước lượng].',
      en: 'Chinh Nam Gate (aka Nha Do), south wall. Built 1809. Anchor [estimated].',
      year: '1809',
    },
  },
  {
    id: 'cua-quang-duc',
    displayName: { vi: 'Cửa Quảng Đức', en: 'Quang Duc Gate' },
    anchor: [-180, 0, 1280],
    rotationY: 0,
    boundingRadius: 20,
    style: 'tam-quan',
    width: 20,
    poi: {
      vi: 'Cửa Quảng Đức, mặt Nam gần Kỳ Đài (phía Tây). Hoàng gia; vọng lâu 1829; trùng tu 1997–2000. Anchor [ước lượng].',
      en: 'Quang Duc Gate, south near Ky Dai (west). Royal gate; pavilion 1829; restored 1997–2000. Anchor [estimated].',
      year: '1809',
    },
  },
  {
    id: 'cua-the-nhon',
    displayName: { vi: 'Cửa Thể Nhơn', en: 'The Nhon Gate' },
    anchor: [180, 0, 1280],
    rotationY: 0,
    boundingRadius: 20,
    style: 'tam-quan',
    width: 20,
    poi: {
      vi: 'Cửa Thể Nhơn (còn gọi cửa Ngăn), mặt Nam gần Kỳ Đài (phía Đông). Cửa hoàng gia. Anchor [ước lượng].',
      en: 'The Nhon Gate (aka Ngan Gate), south near Ky Dai (east). Royal gate. Anchor [estimated].',
      year: '1809',
    },
  },
  {
    id: 'cua-chinh-tay',
    displayName: { vi: 'Cửa Chính Tây', en: 'Chinh Tay Gate' },
    anchor: [-1200, 0, -50],
    rotationY: -1.5708,
    boundingRadius: 20,
    style: 'vom',
    width: 14,
    poi: {
      vi: 'Cửa Chính Tây (Chánh Tây), mặt Tây Kinh thành. Xây 1809. Anchor [ước lượng].',
      en: 'Chinh Tay Gate, west wall. Built 1809. Anchor [estimated].',
      year: '1809',
    },
  },
  {
    id: 'cua-huu',
    displayName: { vi: 'Cửa Hữu', en: 'Huu Gate' },
    anchor: [-980, 0, 750],
    rotationY: -0.785,
    boundingRadius: 20,
    style: 'vom',
    width: 14,
    poi: {
      vi: 'Cửa Hữu (Hữu môn), góc Tây-Nam Kinh thành. Xây 1809. Anchor [ước lượng].',
      en: 'Huu Gate, southwest corner. Built 1809. Anchor [estimated].',
      year: '1809',
    },
  },
  {
    id: 'cua-chinh-bac',
    displayName: { vi: 'Cửa Chính Bắc', en: 'Chinh Bac Gate' },
    anchor: [80, 0, -1200],
    rotationY: 3.1416,
    boundingRadius: 20,
    style: 'vom',
    width: 14,
    poi: {
      vi: 'Cửa Chính Bắc (còn gọi cửa Hậu), mặt Bắc Kinh thành. Xây 1809. Anchor [ước lượng].',
      en: 'Chinh Bac Gate (aka Hau Gate), north wall. Built 1809. Anchor [estimated].',
      year: '1809',
    },
  },
  {
    id: 'cua-an-hoa',
    displayName: { vi: 'Cửa An Hòa', en: 'An Hoa Gate' },
    anchor: [-780, 0, -1050],
    rotationY: -2.356,
    boundingRadius: 20,
    style: 'vom',
    width: 14,
    poi: {
      vi: 'Cửa An Hòa (Tây-Bắc), khu An Hòa. Xây 1809. Anchor [ước lượng].',
      en: 'An Hoa Gate, northwest wall (An Hoa area). Built 1809. Anchor [estimated].',
      year: '1809',
    },
  },
  {
    id: 'cua-dong-ba',
    displayName: { vi: 'Cửa Đông Ba', en: 'Dong Ba Gate' },
    anchor: [1180, 0, 80],
    rotationY: 1.5708,
    boundingRadius: 20,
    style: 'tam-quan',
    width: 18,
    poi: {
      vi: 'Cửa Đông Ba (Chính Đông), vọng lâu 1824. Xây 1809. Anchor [ước lượng].',
      en: 'Dong Ba Gate (main east), pavilion 1824. Built 1809. Anchor [estimated].',
      year: '1809',
    },
  },
  {
    id: 'cua-thuong-tu',
    displayName: { vi: 'Cửa Thượng Tứ', en: 'Thuong Tu Gate' },
    anchor: [980, 0, 780],
    rotationY: 0.785,
    boundingRadius: 20,
    style: 'vom',
    width: 14,
    poi: {
      vi: 'Cửa Thượng Tứ, góc Đông-Nam (Viện Thượng Kỵ / tàu ngựa). Xây 1809. Anchor [ước lượng].',
      en: 'Thuong Tu Gate, southeast (imperial stables area). Built 1809. Anchor [estimated].',
      year: '1809',
    },
  },
  {
    id: 'cua-ke-trai',
    displayName: { vi: 'Cửa Kẻ Trài', en: 'Ke Trai Gate' },
    anchor: [1050, 0, -780],
    rotationY: 2.356,
    boundingRadius: 20,
    style: 'vom',
    width: 14,
    poi: {
      vi: 'Cửa Kẻ Trài, góc Đông-Bắc Kinh thành. Xây 1809. Anchor [ước lượng].',
      en: 'Ke Trai Gate, northeast corner. Built 1809. Anchor [estimated].',
      year: '1809',
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
      const g = buildCitadelGate({
        lod,
        style: def.style,
        width: def.width,
      })
      g.name = def.id
      return g
    },
  }
}

export const citadelGateModules: MonumentModule[] = GATE_DEFS.map(toModule)

export const citadelGateIds = GATE_DEFS.map((d) => d.id)

const THUY_QUAN_DEFS: Array<{
  id: string
  displayName: { vi: string; en: string }
  anchor: [number, number, number]
  rotationY: number
  poi: { vi: string; en: string; year?: string }
}> = [
  {
    id: 'dong-thanh-thuy-quan',
    displayName: { vi: 'Đông Thành Thủy Quan', en: 'East Water Gate' },
    anchor: [1100, 0, -200],
    rotationY: 1.5708,
    poi: {
      vi: 'Đông Thành Thủy Quan — cửa thủy đầu đông Ngự Hà, cống xuyên thành khác cửa bộ. Anchor [ước lượng].',
      en: 'East Water Gate — culvert on the eastern Ngự Hà, distinct from pedestrian gates. Anchor [estimated].',
      year: '1805',
    },
  },
  {
    id: 'tay-thanh-thuy-quan',
    displayName: { vi: 'Tây Thành Thủy Quan', en: 'West Water Gate' },
    anchor: [-1100, 0, -80],
    rotationY: -1.5708,
    poi: {
      vi: 'Tây Thành Thủy Quan — cửa thủy đầu tây Ngự Hà. Anchor [ước lượng].',
      en: 'West Water Gate — culvert on the western Ngự Hà. Anchor [estimated].',
      year: '1805',
    },
  },
]

export const thuyQuanModules: MonumentModule[] = THUY_QUAN_DEFS.map((def) => ({
  id: def.id,
  displayName: def.displayName,
  anchor: def.anchor,
  rotationY: def.rotationY,
  boundingRadius: 25,
  poi: def.poi,
  build(lod) {
    const g = buildThuyQuan(lod)
    g.name = def.id
    return g
  },
}))
