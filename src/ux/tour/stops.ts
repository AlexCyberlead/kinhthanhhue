import type { TourStop } from './types'

/**
 * 12 guided-tour stops — river approach → Đại Nội → Tử Cấm → overview.
 * Anchors aligned with WORLD / monument modules (1 unit = 1 m).
 */
export const TOUR_STOPS: readonly TourStop[] = [
  {
    id: 'song-huong-ky-dai',
    poiId: 'ky-dai',
    title: { vi: 'Sông Hương & Kỳ Đài', en: 'Hương River & Flag Tower' },
    narration: {
      vi: 'Từ minh đường sông Hương, Kỳ Đài ba tầng đài chóp cụt (1807) dựng cột cờ cao khoảng 37 mét — mặt tiền Kinh thành phía Nam, trước khi vào Ngọ Môn.',
      en: 'From the Hương River — the geomantic bright hall — the Flag Tower’s three truncated tiers (1807) raise a ~37 m mast: the south front of the Citadel before Ngọ Môn.',
    },
    year: 1807,
    camera: [45, 28, 520],
    lookAt: [0, 18, 340],
    dwellSec: 10,
    transitSec: 6,
  },
  {
    id: 'phu-van-lau',
    poiId: 'phu-van-lau',
    title: { vi: 'Phu Văn Lâu', en: 'Phu Van Lau Pavilion' },
    narration: {
      vi: 'Phu Văn Lâu gần bờ sông — nơi treo chiếu chỉ và văn bản quan phương thời Nguyễn. Mái ngói thanh lưu ly, đối xứng trước mặt tiền Kinh thành.',
      en: 'Phu Văn Lâu by the riverfront posted imperial edicts. Green glazed-tile roofs frame a symmetrical pavilion on the Citadel’s southern approach.',
    },
    year: 1819,
    camera: [35, 18, 1620],
    lookAt: [0, 6, 1550],
    dwellSec: 9,
    transitSec: 7,
  },
  {
    id: 'ngo-mon',
    poiId: 'ngo-mon',
    title: { vi: 'Ngọ Môn', en: 'Noon Gate' },
    narration: {
      vi: 'Ngọ Môn — cổng chính Nam Hoàng thành. Nền chữ U năm lối đi; trên là Lầu Ngũ Phụng với chín bộ mái hoàng và thanh lưu ly, định hình thời Minh Mạng 1833–1834.',
      en: 'Ngọ Môn, the Imperial City’s main south gate: a U-terrace with five passages and the Five Phoenix Pavilion’s nine roof sets — yellow and green glaze — shaped under Minh Mạng (1833–1834).',
    },
    year: 1833,
    camera: [55, 22, 175],
    lookAt: [0, 10, 118],
    dwellSec: 11,
    transitSec: 8,
  },
  {
    id: 'san-dai-trieu',
    poiId: 'san-dai-trieu-nghi',
    title: { vi: 'Sân Đại Triều Nghi', en: 'Grand Audience Courtyard' },
    narration: {
      vi: 'Sân Đại Triều Nghi — tâm hệ tọa độ digital twin. Nơi đại triều trước Điện Thái Hòa; phẩm sơn xếp hạng quan lại hai bên, tứ tượng góc sân.',
      en: 'The Grand Audience Courtyard — world origin of this twin. Court ceremonies faced Thái Hòa; rank markers line the sides, four mythical beasts guard the corners.',
    },
    year: 1805,
    camera: [40, 16, 55],
    lookAt: [0, 2, 0],
    dwellSec: 9,
    transitSec: 5,
  },
  {
    id: 'thai-hoa',
    poiId: 'dien-thai-hoa',
    title: { vi: 'Điện Thái Hòa', en: 'Hall of Supreme Harmony' },
    narration: {
      vi: 'Điện Thái Hòa — nơi đại triều nhà Nguyễn. Kiến trúc trùng thiềm điệp ốc, khoảng 80 cột lim sơn son thếp vàng, mái ngói hoàng lưu ly. Xây 1805, dời/làm lại 1833.',
      en: 'The Hall of Supreme Harmony hosted imperial audiences: double-eave “trùng thiềm điệp ốc” form, ~80 lacquered lim columns, yellow glazed roofs. Built 1805; relocated 1833.',
    },
    year: 1805,
    camera: [38, 14, -8],
    lookAt: [0, 8, -48],
    dwellSec: 11,
    transitSec: 5,
  },
  {
    id: 'the-mieu-cuu-dinh',
    poiId: 'the-mieu',
    title: { vi: 'Thế Miếu & Cửu Đỉnh', en: 'The Mieu & Nine Urns' },
    narration: {
      vi: 'Thế Tổ Miếu thờ các vua Nguyễn (1821). Trước sân là Cửu Đỉnh — chín đỉnh đồng đúc 1835–1837, mỗi đỉnh nặng khoảng 1,9 đến 2,6 tấn, chạm nổi cảnh vật đất nước.',
      en: 'Thế Tổ Miếu (1821) honors Nguyễn emperors. Before it stand the Nine Urns (1835–1837): bronze vessels of ~1.9–2.6 tons each, relief-carved with scenes of the realm.',
    },
    year: 1821,
    camera: [-55, 14, -55],
    lookAt: [-95, 6, -100],
    dwellSec: 11,
    transitSec: 5,
  },
  {
    id: 'hien-lam-cac',
    poiId: 'hien-lam-cac',
    title: { vi: 'Hiển Lâm Các', en: 'Hien Lam Pavilion' },
    narration: {
      vi: 'Hiển Lâm Các — lầu gỗ ba tầng cao khoảng 17 mét, công trình gỗ cao nhất Hoàng thành, đứng phía sau khu Thế Miếu / Cửu Đỉnh.',
      en: 'Hiển Lâm Các rises three timber storeys to ~17 m — the tallest wooden structure in the Imperial City, behind The Mieu and the Nine Urns.',
    },
    year: 1821,
    camera: [-60, 16, -100],
    lookAt: [-95, 10, -130],
    dwellSec: 9,
    transitSec: 4,
  },
  {
    id: 'dien-tho',
    poiId: 'cung-dien-tho',
    title: { vi: 'Cung Diên Thọ', en: 'Dien Tho Palace' },
    narration: {
      vi: 'Cung Diên Thọ — nơi ở Thái hậu phía Tây Hoàng thành. Phức hợp nhiều gian, mái trùng thiềm ngói thanh lưu ly, đầu đao phượng; khởi dựng thời Gia Long 1804.',
      en: 'Diên Thọ Palace housed the Queen Mother on the west side: multi-bay halls, green-glazed double eaves, phoenix ridge ornaments — begun under Gia Long in 1804.',
    },
    year: 1804,
    camera: [-130, 16, -200],
    lookAt: [-180, 6, -250],
    dwellSec: 10,
    transitSec: 6,
  },
  {
    id: 'dai-cung-mon',
    poiId: 'dai-cung-mon',
    title: { vi: 'Đại Cung Môn', en: 'Great Palace Gate' },
    narration: {
      vi: 'Đại Cung Môn — cổng chính Nam Tử Cấm Thành. Xây 1833, bị phá 1947; bản phục dựng mở đường vào khu nội đình từng chỉ dành cho hoàng tộc.',
      en: 'Đại Cung Môn, south gate of the Forbidden Purple City (1833), destroyed in 1947. The restored form opens the inner court once reserved for the imperial family.',
    },
    year: 1833,
    camera: [28, 12, -55],
    lookAt: [0, 5, -95],
    dwellSec: 9,
    transitSec: 5,
  },
  {
    id: 'duyet-thi',
    poiId: 'duyet-thi-duong',
    title: { vi: 'Duyệt Thị Đường', en: 'Duyet Thi Duong Theatre' },
    narration: {
      vi: 'Duyệt Thị Đường — nhà hát cung đình cổ nhất Việt Nam còn lại trong Tử Cấm. Cột lim sơn son, mái thanh lưu ly; xây 1826, phục hồi khoảng 2004.',
      en: 'Duyệt Thị Đường is Vietnam’s oldest surviving court theatre inside the Forbidden City: lacquered lim columns, green glaze roof — built 1826, restored around 2004.',
    },
    year: 1826,
    camera: [150, 14, -150],
    lookAt: [110, 6, -180],
    dwellSec: 10,
    transitSec: 5,
  },
  {
    id: 'thai-binh-lau',
    poiId: 'thai-binh-lau',
    title: { vi: 'Thái Bình Lâu', en: 'Thai Binh Pavilion' },
    narration: {
      vi: 'Thái Bình Lâu — lầu đọc sách vua Khải Định (1919–1921), điểm nhấn pháp lam cuối triều Nguyễn trước khi Kinh thành bước vào giai đoạn biến động 1945–1947.',
      en: 'Thái Bình Lâu, Khải Định’s reading pavilion (1919–1921), marks late Nguyễn pháp lam craft before the Citadel’s upheavals of 1945–1947.',
    },
    year: 1921,
    camera: [110, 14, -220],
    lookAt: [70, 6, -260],
    dwellSec: 9,
    transitSec: 4,
  },
  {
    id: 'overview',
    title: { vi: 'Toàn cảnh Kinh Thành', en: 'Citadel Overview' },
    narration: {
      vi: 'Nhìn toàn cảnh từ sông Hương vào Hoàng thành và Tử Cấm: trục thần đạo Bắc–Nam của triều Nguyễn, kéo dài từ 1802 đến 1945 — một Kinh thành Vauban hòa quyện phong thủy Việt.',
      en: 'Pull back over river, Imperial City, and Forbidden Purple City: the Nguyễn north–south spirit axis from 1802 to 1945 — a Vauban citadel woven with Vietnamese geomancy.',
    },
    year: 1945,
    camera: [180, 160, 420],
    lookAt: [0, 5, -80],
    dwellSec: 12,
    transitSec: 8,
  },
] as const

export const TOUR_YEAR_MIN = 1802
export const TOUR_YEAR_MAX = 1945

export function getTourStop(index: number): TourStop {
  const i = Math.max(0, Math.min(TOUR_STOPS.length - 1, index))
  return TOUR_STOPS[i]!
}

/** Nearest stop index for a year on the 1802–1945 timeline. */
export function nearestStopIndexForYear(year: number): number {
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < TOUR_STOPS.length; i++) {
    const d = Math.abs(TOUR_STOPS[i]!.year - year)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }
  return best
}
