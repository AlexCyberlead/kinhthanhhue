/**
 * World coordinate system for Kinh Thành Huế Digital Twin.
 * Origin (0,0,0) = center of Đại Triều Nghi courtyard.
 * +X = East, +Y = Up, +Z = South (toward Ngọ Môn → Hương River).
 * 1 unit = 1 meter.
 */

export const WORLD = {
  unit: 1 as const,
  originLabel: 'Tam sân Đại Triều Nghi',
  /** Approximate extents used for culling / fog */
  extents: {
    citadelHalf: 1200,
    imperialHalfX: 303,
    imperialHalfZ: 311,
    forbiddenHalfX: 162,
    forbiddenHalfZ: 145,
  },
  /** Landmark anchors — refined by research buildings.json */
  landmarks: {
    daiTrieuNghi: [0, 0, 0] as [number, number, number],
    dienThaiHoa: [0, 0, -35] as [number, number, number],
    ngoMon: [0, 0, 155] as [number, number, number],
    kyDai: [0, 0, 420] as [number, number, number],
    songHuong: [0, 0, 750] as [number, number, number],
    theToMieu: [-120, 0, -80] as [number, number, number],
    daiCungMon: [0, 0, -90] as [number, number, number],
  },
  colors: {
    son: '#8B1A1A',
    vangThep: '#C9A227',
    ngoiVang: '#D4A017',
    ngoiXanh: '#2E5E4E',
    tuongVoi: '#E8DCC8',
    daThanh: '#6E6E68',
    gachVo: '#9C6B4F',
  },
} as const

export type WorldConfig = typeof WORLD
