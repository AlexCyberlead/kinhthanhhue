import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildGate } from '../../core/geometry/kit/buildGate'

type GateSpec = {
  id: string
  displayName: { vi: string; en: string }
  anchor: [number, number, number]
  rotationY: number
  poi: { vi: string; en: string; year?: string }
}

const SPECS: GateSpec[] = [
  {
    id: 'hung-khanh-mon',
    displayName: { vi: 'Hưng Khánh Môn', en: 'Hung Khanh Gate' },
    anchor: [160, 2, -200],
    rotationY: 1.5708,
    poi: {
      vi: 'Hưng Khánh Môn — cửa Đông Tử Cấm. Anchor [ước lượng hợp lý].',
      en: 'Hung Khanh Gate — east gate of the Forbidden Purple City. Anchor [estimated].',
      year: '1804',
    },
  },
  {
    id: 'gia-tuong-mon',
    displayName: { vi: 'Gia Tường Môn', en: 'Gia Tuong Gate' },
    anchor: [-160, 2, -200],
    rotationY: -1.5708,
    poi: {
      vi: 'Gia Tường Môn — cửa Tây Tử Cấm. Anchor [ước lượng hợp lý].',
      en: 'Gia Tuong Gate — west gate of the Forbidden Purple City. Anchor [estimated].',
      year: '1804',
    },
  },
  {
    id: 'tuong-loan-mon',
    displayName: { vi: 'Tường Loan Môn', en: 'Tuong Loan Gate' },
    anchor: [-40, 2, -380],
    rotationY: 3.1416,
    poi: {
      vi: 'Tường Loan Môn — cửa Bắc Tử Cấm. Anchor [ước lượng hợp lý].',
      en: 'Tuong Loan Gate — north gate of the Forbidden Purple City. Anchor [estimated].',
      year: '1804',
    },
  },
  {
    id: 'nghi-phung-mon',
    displayName: { vi: 'Nghi Phụng Môn', en: 'Nghi Phung Gate' },
    anchor: [40, 2, -380],
    rotationY: 3.1416,
    poi: {
      vi: 'Nghi Phụng Môn — cửa Bắc Tử Cấm (trước 1821 tên Tường Lân). Anchor [ước lượng hợp lý].',
      en: 'Nghi Phung Gate — north gate (formerly Tường Lân). Anchor [estimated].',
      year: '1804',
    },
  },
]

export const tuCamGateModules: MonumentModule[] = SPECS.map((def) => ({
  id: def.id,
  displayName: def.displayName,
  anchor: def.anchor,
  rotationY: def.rotationY,
  boundingRadius: 15,
  poi: def.poi,
  build(lod) {
    const g = buildGate({ type: 'vom', lod, width: 11, height: 6.4 })
    g.name = def.id
    return g
  },
}))
