import { useMemo } from 'react'
import { useAppStore } from '../../state/appStore'
import {
  TOUR_STOPS,
  TOUR_YEAR_MAX,
  TOUR_YEAR_MIN,
  nearestStopIndexForYear,
} from './stops'
import { useTourStore } from './tourStore'
import { stopTourSpeech } from './tts'

const panel =
  'pointer-events-auto rounded-md border border-[#C9A227]/35 bg-[#1a1410]/82 text-[#E8DCC8] shadow-md backdrop-blur-sm'

const btn =
  'inline-flex h-8 min-w-8 items-center justify-center rounded border border-[#C9A227]/35 bg-[#1a1410]/60 px-2 text-xs tracking-wide text-[#E8DCC8] transition hover:border-[#C9A227] hover:bg-[#8B1A1A]/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] disabled:opacity-35'

/**
 * DOM overlay for guided tour — play/pause/next/prev + 1802–1945 timeline.
 * Visible when `cameraMode === 'tour'`.
 */
export function TourPanel(): JSX.Element | null {
  const cameraMode = useAppStore((s) => s.cameraMode)
  const locale = useAppStore((s) => s.locale)
  const setCameraMode = useAppStore((s) => s.setCameraMode)

  const stopIndex = useTourStore((s) => s.stopIndex)
  const playing = useTourStore((s) => s.playing)
  const phase = useTourStore((s) => s.phase)
  const togglePlaying = useTourStore((s) => s.togglePlaying)
  const next = useTourStore((s) => s.next)
  const prev = useTourStore((s) => s.prev)
  const goTo = useTourStore((s) => s.goTo)
  const setPlaying = useTourStore((s) => s.setPlaying)

  const stop = TOUR_STOPS[stopIndex]!
  const title = stop.title[locale]
  const narration = stop.narration[locale]

  const yearPct = useMemo(() => {
    const span = TOUR_YEAR_MAX - TOUR_YEAR_MIN
    return ((stop.year - TOUR_YEAR_MIN) / span) * 100
  }, [stop.year])

  if (cameraMode !== 'tour') return null

  const labels =
    locale === 'vi'
      ? {
          guided: 'Tour dẫn đường',
          play: 'Phát',
          pause: 'Tạm dừng',
          prev: 'Trước',
          next: 'Sau',
          exit: 'Thoát tour',
          of: 'của',
          timeline: 'Niên biểu Nguyễn',
          flying: 'Đang bay…',
        }
      : {
          guided: 'Guided tour',
          play: 'Play',
          pause: 'Pause',
          prev: 'Prev',
          next: 'Next',
          exit: 'Exit tour',
          of: 'of',
          timeline: 'Nguyễn timeline',
          flying: 'In transit…',
        }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center p-3 sm:p-4"
      role="region"
      aria-label={labels.guided}
    >
      <div className={`${panel} w-full max-w-xl px-3 py-3 sm:px-4`}>
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#C9A227]/80">
              {labels.guided} · {stopIndex + 1} {labels.of} {TOUR_STOPS.length}
            </p>
            <h2 className="truncate font-serif text-base text-[#E8DCC8] sm:text-lg">{title}</h2>
            <p className="text-[11px] text-[#C9A227]/90">{stop.year}</p>
          </div>
          <button
            type="button"
            className={btn}
            onClick={() => {
              setPlaying(false)
              stopTourSpeech()
              setCameraMode('orbit')
            }}
          >
            {labels.exit}
          </button>
        </div>

        <p className="mb-3 max-h-16 overflow-y-auto text-[12px] leading-relaxed text-[#E8DCC8]/85 sm:max-h-20 sm:text-[13px]">
          {phase === 'transit' ? labels.flying : narration}
        </p>

        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            className={btn}
            aria-label={labels.prev}
            disabled={stopIndex <= 0 && phase !== 'transit'}
            onClick={() => prev()}
          >
            ‹
          </button>
          <button
            type="button"
            className={btn}
            aria-label={playing ? labels.pause : labels.play}
            aria-pressed={playing}
            onClick={() => togglePlaying()}
          >
            {playing ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className={btn}
            aria-label={labels.next}
            disabled={stopIndex >= TOUR_STOPS.length - 1}
            onClick={() => next()}
          >
            ›
          </button>

          <div className="ml-1 flex min-w-0 flex-1 gap-1 overflow-x-auto pb-0.5">
            {TOUR_STOPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                title={`${s.title[locale]} (${s.year})`}
                aria-label={s.title[locale]}
                aria-current={i === stopIndex ? 'step' : undefined}
                className={`h-2 w-2 shrink-0 rounded-sm transition ${
                  i === stopIndex
                    ? 'bg-[#C9A227]'
                    : i < stopIndex
                      ? 'bg-[#8B1A1A]'
                      : 'bg-[#E8DCC8]/25 hover:bg-[#E8DCC8]/45'
                }`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-[10px] tracking-wide text-[#E8DCC8]/55">
            <span>{labels.timeline}</span>
            <span>
              {TOUR_YEAR_MIN} — {TOUR_YEAR_MAX}
            </span>
          </div>
          <div className="relative h-6">
            <input
              type="range"
              min={TOUR_YEAR_MIN}
              max={TOUR_YEAR_MAX}
              step={1}
              value={stop.year}
              aria-label={labels.timeline}
              className="absolute inset-x-0 top-1/2 z-10 h-2 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent accent-[#C9A227]"
              onChange={(e) => {
                const year = Number(e.target.value)
                goTo(nearestStopIndexForYear(year))
              }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#E8DCC8]/15">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#8B1A1A] to-[#C9A227]"
                style={{ width: `${yearPct}%` }}
              />
            </div>
            {/* Dynasty markers */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex h-full items-end justify-between px-0.5 text-[9px] text-[#E8DCC8]/40">
              <span>1802</span>
              <span>1833</span>
              <span>1885</span>
              <span>1945</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
