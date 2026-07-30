import type { Locale } from '../../state/appStore'

export type HistoricalTip = { vi: string; en: string }

/** Tip lịch sử ngắn — rotate khi LoadingScreen không nhận `tip` prop. */
export const HISTORICAL_TIPS: HistoricalTip[] = [
  {
    vi: 'Kinh Thành Huế xây 1805–1832 thời Gia Long–Minh Mạng, chu vi gần 10 km.',
    en: 'The Huế Citadel was built 1805–1832 under Gia Long–Minh Mạng; perimeter ~10 km.',
  },
  {
    vi: 'Ba vòng thành: Kinh Thành → Hoàng Thành (Đại Nội) → Tử Cấm Thành.',
    en: 'Three nested walls: Citadel → Imperial City (Đại Nội) → Forbidden Purple City.',
  },
  {
    vi: 'Ngọ Môn là cổng chính phía Nam Hoàng Thành, có Lầu Ngũ Phụng phía trên.',
    en: 'Ngọ Môn is the south main gate of the Imperial City, topped by the Five-Phoenix Pavilion.',
  },
  {
    vi: 'Điện Thái Hòa — nơi vua Nguyễn đăng quang và thiết triều.',
    en: 'Điện Thái Hòa — coronation and court audiences of the Nguyễn emperors.',
  },
  {
    vi: 'Kỳ Đài có cột cờ cao khoảng 37 m; tổng đài + cột gần 54 m.',
    en: 'Kỳ Đài’s flagpole rises ~37 m; tower plus pole reach nearly 54 m.',
  },
  {
    vi: 'Hoàng Thành khoảng 606 × 622 m, bốn cổng: Ngọ Môn, Hiển Nhơn, Chương Đức, Hòa Bình.',
    en: 'Imperial City ~606 × 622 m with four gates: Ngọ Môn, Hiển Nhơn, Chương Đức, Hòa Bình.',
  },
  {
    vi: 'Tường Kinh Thành kiểu Vauban kết hợp phong thủy Đông Á — 24 pháo đài.',
    en: 'Citadel walls blend Vauban fortification with East Asian geomancy — 24 bastions.',
  },
  {
    vi: 'Ngói hoàng lưu ly (vàng) dành cho công trình vua; thanh lưu ly (xanh) cho miếu thờ.',
    en: 'Imperial yellow glazed tiles for royal halls; blue-green tiles for ancestral temples.',
  },
  {
    vi: 'Cửu Đỉnh trước Thế Tổ Miếu đúc đồng thời Minh Mạng (1835–1837).',
    en: 'The Nine Dynastic Urns before Thế Tổ Miếu were cast under Minh Mạng (1835–1837).',
  },
  {
    vi: 'UNESCO công nhận Quần thể Di tích Cố đô Huế năm 1993.',
    en: 'UNESCO inscribed the Complex of Huế Monuments in 1993.',
  },
]

export function tipText(tip: HistoricalTip, locale: Locale): string {
  return locale === 'en' ? tip.en : tip.vi
}

/** Index ổn định theo tick — tránh Math.random mỗi render. */
export function tipIndexAt(tick: number, length = HISTORICAL_TIPS.length): number {
  if (length <= 0) return 0
  return ((tick % length) + length) % length
}
