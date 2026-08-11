import { create } from 'zustand'

export type QualityPreset = 'low' | 'med' | 'high' | 'ultra'
export type CameraMode = 'orbit' | 'walk' | 'drone' | 'tour'
export type Locale = 'vi' | 'en'

type AppState = {
  quality: QualityPreset
  cameraMode: CameraMode
  locale: Locale
  timeOfDay: number // 0..24
  season: 'xuan' | 'ha' | 'thu' | 'dong'
  raining: boolean
  muted: boolean
  selectedPoiId: string | null
  reconstructionMode: 'ruin' | 'restored'
  setQuality: (q: QualityPreset) => void
  setCameraMode: (m: CameraMode) => void
  setLocale: (l: Locale) => void
  setTimeOfDay: (t: number) => void
  setSeason: (s: AppState['season']) => void
  setRaining: (v: boolean) => void
  setMuted: (v: boolean) => void
  setSelectedPoiId: (id: string | null) => void
  setReconstructionMode: (m: AppState['reconstructionMode']) => void
}

export const useAppStore = create<AppState>((set) => ({
  quality: 'high',
  cameraMode: 'orbit',
  locale: 'vi',
  timeOfDay: 10,
  season: 'xuan',
  raining: false,
  muted: false,
  selectedPoiId: null,
  reconstructionMode: 'restored',
  setQuality: (quality) => set({ quality }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setLocale: (locale) => set({ locale }),
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setSeason: (season) => set({ season }),
  setRaining: (raining) => set({ raining }),
  setMuted: (muted) => set({ muted }),
  setSelectedPoiId: (selectedPoiId) => set({ selectedPoiId }),
  setReconstructionMode: (reconstructionMode) => set({ reconstructionMode }),
}))

// Handle debug dev-only — đi cùng `window.__r3f` trong Engine.tsx.
if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__store = useAppStore
}
