import type { CameraMode, Locale, QualityPreset } from '../../state/appStore'

export type Season = 'xuan' | 'ha' | 'thu' | 'dong'

type Dict = {
  camera: string
  time: string
  season: string
  rain: string
  rainOn: string
  rainOff: string
  quality: string
  reconstruction: string
  ruin: string
  restored: string
  locale: string
  cameras: Record<CameraMode, string>
  seasons: Record<Season, string>
  qualities: Record<QualityPreset, string>
  markers: { ngoMon: string; thaiHoa: string }
}

const VI: Dict = {
  camera: 'Camera',
  time: 'Giờ',
  season: 'Mùa',
  rain: 'Mưa',
  rainOn: 'Có mưa',
  rainOff: 'Nắng',
  quality: 'Chất lượng',
  reconstruction: 'Phục dựng',
  ruin: 'Đổ nát',
  restored: 'Phục hồi',
  locale: 'Ngôn ngữ',
  cameras: {
    orbit: 'Quỹ đạo',
    walk: 'Đi bộ',
    drone: 'Drone',
    tour: 'Tour',
  },
  seasons: {
    xuan: 'Xuân',
    ha: 'Hạ',
    thu: 'Thu',
    dong: 'Đông',
  },
  qualities: {
    low: 'Thấp',
    med: 'Vừa',
    high: 'Cao',
    ultra: 'Ultra',
  },
  markers: {
    ngoMon: 'Ngọ Môn',
    thaiHoa: 'Thái Hòa',
  },
}

const EN: Dict = {
  camera: 'Camera',
  time: 'Time',
  season: 'Season',
  rain: 'Rain',
  rainOn: 'Rain',
  rainOff: 'Clear',
  quality: 'Quality',
  reconstruction: 'Rebuild',
  ruin: 'Ruin',
  restored: 'Restored',
  locale: 'Language',
  cameras: {
    orbit: 'Orbit',
    walk: 'Walk',
    drone: 'Drone',
    tour: 'Tour',
  },
  seasons: {
    xuan: 'Spring',
    ha: 'Summer',
    thu: 'Autumn',
    dong: 'Winter',
  },
  qualities: {
    low: 'Low',
    med: 'Med',
    high: 'High',
    ultra: 'Ultra',
  },
  markers: {
    ngoMon: 'Ngo Mon',
    thaiHoa: 'Thai Hoa',
  },
}

export function t(locale: Locale): Dict {
  return locale === 'en' ? EN : VI
}

export const CAMERA_MODES: CameraMode[] = ['orbit', 'walk', 'drone', 'tour']
export const SEASONS: Season[] = ['xuan', 'ha', 'thu', 'dong']
export const QUALITIES: QualityPreset[] = ['low', 'med', 'high', 'ultra']
