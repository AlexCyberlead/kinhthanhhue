import { create } from 'zustand'
import { TOUR_STOPS } from './stops'

export type TourPhase = 'idle' | 'transit' | 'dwell'

type TourPlaybackState = {
  /** Active stop index 0..TOUR_STOPS.length-1 */
  stopIndex: number
  /** Auto-advance through stops */
  playing: boolean
  phase: TourPhase
  /** 0..1 within current transit */
  transitT: number
  /** Elapsed seconds in current dwell */
  dwellElapsed: number
  setPlaying: (v: boolean) => void
  togglePlaying: () => void
  next: () => void
  prev: () => void
  goTo: (index: number) => void
  /** Internal — driven by TourController useFrame */
  _tickTransit: (dt: number) => void
  _tickDwell: (dt: number) => void
  _beginTransitTo: (index: number) => void
  _enterDwell: () => void
}

function clampIndex(i: number): number {
  return Math.max(0, Math.min(TOUR_STOPS.length - 1, i | 0))
}

export const useTourStore = create<TourPlaybackState>((set, get) => ({
  stopIndex: 0,
  playing: false,
  phase: 'idle',
  transitT: 1,
  dwellElapsed: 0,

  setPlaying: (playing) => {
    const { phase } = get()
    if (playing) {
      if (phase === 'idle') {
        set({ playing: true, phase: 'dwell', dwellElapsed: 0, transitT: 1 })
      } else {
        set({ playing: true })
      }
      return
    }
    set({ playing: false })
  },

  togglePlaying: () => {
    const { playing, setPlaying } = get()
    setPlaying(!playing)
  },

  next: () => {
    const { stopIndex } = get()
    const next = clampIndex(stopIndex + 1)
    if (next === stopIndex) {
      set({ playing: false, phase: 'dwell', transitT: 1 })
      return
    }
    get()._beginTransitTo(next)
  },

  prev: () => {
    const { stopIndex } = get()
    const prev = clampIndex(stopIndex - 1)
    if (prev === stopIndex) {
      set({ phase: 'dwell', transitT: 1, dwellElapsed: 0 })
      return
    }
    get()._beginTransitTo(prev)
  },

  goTo: (index) => {
    const target = clampIndex(index)
    if (target === get().stopIndex && get().phase !== 'transit') {
      set({ phase: 'dwell', transitT: 1, dwellElapsed: 0 })
      return
    }
    get()._beginTransitTo(target)
  },

  _beginTransitTo: (index) => {
    set({
      stopIndex: clampIndex(index),
      phase: 'transit',
      transitT: 0,
      dwellElapsed: 0,
    })
  },

  _enterDwell: () => {
    set({ phase: 'dwell', transitT: 1, dwellElapsed: 0 })
  },

  _tickTransit: (dt) => {
    const { stopIndex, transitT, phase } = get()
    if (phase !== 'transit') return
    const stop = TOUR_STOPS[stopIndex]!
    const nextT = Math.min(1, transitT + dt / Math.max(0.1, stop.transitSec))
    set({ transitT: nextT })
    if (nextT >= 1) get()._enterDwell()
  },

  _tickDwell: (dt) => {
    const { stopIndex, dwellElapsed, phase, playing } = get()
    if (phase !== 'dwell') return
    const stop = TOUR_STOPS[stopIndex]!
    const elapsed = dwellElapsed + dt
    set({ dwellElapsed: elapsed })
    if (!playing) return
    if (elapsed < stop.dwellSec) return
    if (stopIndex >= TOUR_STOPS.length - 1) {
      set({ playing: false })
      return
    }
    get()._beginTransitTo(stopIndex + 1)
  },
}))
