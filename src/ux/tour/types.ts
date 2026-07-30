export type TourLocaleText = { vi: string; en: string }

/** One cinematic stop on the guided tour (camera + bilingual narration). */
export type TourStop = {
  id: string
  /** Optional monument / POI id for store highlight. */
  poiId?: string
  title: TourLocaleText
  narration: TourLocaleText
  /** Historical year marker for the 1802–1945 timeline. */
  year: number
  /** World-space camera eye position (meters). */
  camera: [number, number, number]
  /** World-space look-at target. */
  lookAt: [number, number, number]
  /** Seconds to hold after arriving (narration window). */
  dwellSec: number
  /** Seconds to fly in from previous stop. */
  transitSec: number
}
