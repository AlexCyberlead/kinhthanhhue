import type { Locale } from '../state/appStore'

/** Flat message keys used by Hud, a11y, SEO, loading, tour. */
export type MessageKey =
  | 'app.title'
  | 'app.description'
  | 'app.loading'
  | 'skip.nav'
  | 'skip.toMain'
  | 'skip.toHud'
  | 'skip.toCanvas'
  | 'hud.region'
  | 'hud.camera'
  | 'hud.camera.orbit'
  | 'hud.camera.walk'
  | 'hud.camera.drone'
  | 'hud.camera.tour'
  | 'hud.timeOfDay'
  | 'hud.season'
  | 'hud.season.xuan'
  | 'hud.season.ha'
  | 'hud.season.thu'
  | 'hud.season.dong'
  | 'hud.rain'
  | 'hud.rain.on'
  | 'hud.rain.off'
  | 'hud.quality'
  | 'hud.quality.low'
  | 'hud.quality.med'
  | 'hud.quality.high'
  | 'hud.quality.ultra'
  | 'hud.reconstruction'
  | 'hud.reconstruction.ruin'
  | 'hud.reconstruction.restored'
  | 'hud.locale'
  | 'hud.locale.vi'
  | 'hud.locale.en'
  | 'hud.minimap'
  | 'hud.mute'
  | 'hud.unmute'
  | 'poi.close'
  | 'poi.open'
  | 'tour.play'
  | 'tour.pause'
  | 'tour.next'
  | 'tour.prev'
  | 'device.weakTitle'
  | 'device.weakBody'
  | 'a11y.canvasLabel'
  | 'a11y.mainLandmark'

type MessageDict = Record<MessageKey, string>

const vi: MessageDict = {
  'app.title': 'Kinh Thành Huế 3D',
  'app.description':
    'Digital Twin giáo dục — tái hiện 3D toàn bộ Kinh thành Huế: Hoàng Thành, Tử Cấm Thành, cung điện và di tích.',
  'app.loading': 'Đang tải digital twin…',
  'skip.nav': 'Liên kết bỏ qua',
  'skip.toMain': 'Bỏ qua tới nội dung chính',
  'skip.toHud': 'Bỏ qua tới bảng điều khiển',
  'skip.toCanvas': 'Bỏ qua tới cảnh 3D',
  'hud.region': 'Bảng điều khiển Kinh Thành Huế',
  'hud.camera': 'Chế độ camera',
  'hud.camera.orbit': 'Quỹ đạo',
  'hud.camera.walk': 'Đi bộ',
  'hud.camera.drone': 'Bay',
  'hud.camera.tour': 'Tour dẫn',
  'hud.timeOfDay': 'Giờ trong ngày',
  'hud.season': 'Mùa',
  'hud.season.xuan': 'Xuân',
  'hud.season.ha': 'Hạ',
  'hud.season.thu': 'Thu',
  'hud.season.dong': 'Đông',
  'hud.rain': 'Mưa Huế',
  'hud.rain.on': 'Bật mưa',
  'hud.rain.off': 'Tắt mưa',
  'hud.quality': 'Chất lượng đồ họa',
  'hud.quality.low': 'Thấp',
  'hud.quality.med': 'Trung bình',
  'hud.quality.high': 'Cao',
  'hud.quality.ultra': 'Cực cao',
  'hud.reconstruction': 'Chế độ phục dựng',
  'hud.reconstruction.ruin': 'Di tích / đổ nát',
  'hud.reconstruction.restored': 'Phục dựng',
  'hud.locale': 'Ngôn ngữ',
  'hud.locale.vi': 'Tiếng Việt',
  'hud.locale.en': 'English',
  'hud.minimap': 'Bản đồ thu nhỏ Kinh Thành',
  'hud.mute': 'Tắt âm thanh',
  'hud.unmute': 'Bật âm thanh',
  'poi.close': 'Đóng thông tin điểm',
  'poi.open': 'Mở thông tin điểm',
  'tour.play': 'Phát tour',
  'tour.pause': 'Tạm dừng tour',
  'tour.next': 'Điểm tiếp theo',
  'tour.prev': 'Điểm trước',
  'device.weakTitle': 'Thiết bị yếu',
  'device.weakBody':
    'Máy của bạn có thể chạy chậm. Hãy chọn chất lượng Thấp hoặc Trung bình trong bảng điều khiển.',
  'a11y.canvasLabel': 'Cảnh 3D tương tác Kinh Thành Huế',
  'a11y.mainLandmark': 'Nội dung chính',
}

const en: MessageDict = {
  'app.title': 'Hue Imperial City 3D',
  'app.description':
    'Educational digital twin — a 3D reconstruction of Hue Imperial City: Citadel, Forbidden Purple City, palaces and monuments.',
  'app.loading': 'Loading digital twin…',
  'skip.nav': 'Skip links',
  'skip.toMain': 'Skip to main content',
  'skip.toHud': 'Skip to controls',
  'skip.toCanvas': 'Skip to 3D scene',
  'hud.region': 'Hue Imperial City controls',
  'hud.camera': 'Camera mode',
  'hud.camera.orbit': 'Orbit',
  'hud.camera.walk': 'Walk',
  'hud.camera.drone': 'Drone',
  'hud.camera.tour': 'Guided tour',
  'hud.timeOfDay': 'Time of day',
  'hud.season': 'Season',
  'hud.season.xuan': 'Spring',
  'hud.season.ha': 'Summer',
  'hud.season.thu': 'Autumn',
  'hud.season.dong': 'Winter',
  'hud.rain': 'Hue rain',
  'hud.rain.on': 'Enable rain',
  'hud.rain.off': 'Disable rain',
  'hud.quality': 'Graphics quality',
  'hud.quality.low': 'Low',
  'hud.quality.med': 'Medium',
  'hud.quality.high': 'High',
  'hud.quality.ultra': 'Ultra',
  'hud.reconstruction': 'Reconstruction mode',
  'hud.reconstruction.ruin': 'Ruin',
  'hud.reconstruction.restored': 'Restored',
  'hud.locale': 'Language',
  'hud.locale.vi': 'Vietnamese',
  'hud.locale.en': 'English',
  'hud.minimap': 'Citadel minimap',
  'hud.mute': 'Mute audio',
  'hud.unmute': 'Unmute audio',
  'poi.close': 'Close point of interest',
  'poi.open': 'Open point of interest',
  'tour.play': 'Play tour',
  'tour.pause': 'Pause tour',
  'tour.next': 'Next stop',
  'tour.prev': 'Previous stop',
  'device.weakTitle': 'Low-power device',
  'device.weakBody':
    'Your device may struggle. Switch Quality to Low or Medium in the control panel.',
  'a11y.canvasLabel': 'Interactive 3D scene of Hue Imperial City',
  'a11y.mainLandmark': 'Main content',
}

export const messages: Record<Locale, MessageDict> = { vi, en }

/** Resolve a message without React (SSR-safe / non-hook contexts). */
export function t(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  const dict = messages[locale] ?? messages.vi
  let text = dict[key] ?? messages.vi[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v))
    }
  }
  return text
}
