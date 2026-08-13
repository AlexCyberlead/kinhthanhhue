/**
 * World coordinate system for Kinh Thành Huế Digital Twin.
 * Origin (0,0,0) = center of Đại Triều Nghi courtyard.
 * +X = East, +Y = Up, +Z = South (toward Ngọ Môn → Hương River).
 * 1 unit = 1 meter.
 *
 * Dimensions sourced from docs/research/layout.md (Hội Điển / Cố đô Huế).
 */

export const WORLD = {
  unit: 1 as const,
  originLabel: 'Tâm sân Đại Triều Nghi',
  extents: {
    /** ~half of south face 2724m — approximate outer wall from center */
    citadelHalfX: 1300,
    citadelHalfZ: 1350,
    /** Hoàng Thành ~622 (E-W) × ~604 (N-S) */
    imperialHalfX: 311,
    imperialHalfZ: 302,
    /** Tử Cấm Thành ~324 × ~290.7 */
    forbiddenHalfX: 162,
    forbiddenHalfZ: 145,
    wallThicknessOuter: 21.25,
    wallHeightOuter: 6.46,
    wallHeightImperial: 4.16,
  },
  landmarks: {
    daiTrieuNghi: [0, 0, 0] as [number, number, number],
    dienThaiHoa: [0, 0, -35] as [number, number, number],
    ngoMon: [0, 0, 155] as [number, number, number],
    /** Aligned with buildings.json / kyDai module (not the older 420 estimate). */
    kyDai: [0, 0, 340] as [number, number, number],
    phuVanLau: [0, 1, 1550] as [number, number, number],
    nghinhLuongDinh: [0, 1, 1680] as [number, number, number],
    songHuong: [0, 0, 780] as [number, number, number],
    conHen: [900, 0, 850] as [number, number, number],
    conDaVien: [-900, 0, 850] as [number, number, number],
    theToMieu: [-120, 0, -80] as [number, number, number],
    hienLamCac: [-120, 0, -50] as [number, number, number],
    daiCungMon: [0, 0, -90] as [number, number, number],
    /** Dịch khỏi tường Bắc Hoàng thành (z≈−482). [ước lượng hợp lý — phiên 11] */
    hoTinhTam: [220, 0, -620] as [number, number, number],
    nguHa: [0, 0, -380] as [number, number, number],
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
