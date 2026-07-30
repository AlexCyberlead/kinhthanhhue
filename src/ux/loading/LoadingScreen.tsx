import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../../state/appStore'
import { CalligraphyMark } from './CalligraphyMark'
import { HISTORICAL_TIPS, tipIndexAt, tipText } from './tips'
import './loading.css'

export type LoadingScreenProps = {
  /** Tiến độ thật 0..1 — nếu bỏ trống thì bar indeterminate. */
  progress?: number
  /** Tip cố định; nếu bỏ trống thì rotate tip lịch sử theo locale. */
  tip?: string
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0
  return Math.min(1, Math.max(0, n))
}

function usePrefersReducedMotionLocal(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduced
}

/**
 * Boot / Suspense loader — calligraphy art + progress + historical tips.
 */
export function LoadingScreen({ progress, tip }: LoadingScreenProps): JSX.Element {
  const locale = useAppStore((s) => s.locale)
  const reducedMotion = usePrefersReducedMotionLocal()
  const hasProgress = typeof progress === 'number' && Number.isFinite(progress)
  const value = hasProgress ? clamp01(progress) : 0
  const pct = Math.round(value * 100)

  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (tip) return
    if (reducedMotion) return
    const id = window.setInterval(() => setTick((t) => t + 1), 7000)
    return () => window.clearInterval(id)
  }, [tip, reducedMotion])

  const rotatedTip = useMemo(() => {
    if (tip) return tip
    const entry = HISTORICAL_TIPS[tipIndexAt(tick)]
    return tipText(entry, locale)
  }, [tip, tick, locale])

  const statusLabel =
    locale === 'en'
      ? hasProgress
        ? `Loading digital twin… ${pct}%`
        : 'Loading digital twin…'
      : hasProgress
        ? `Đang tải digital twin… ${pct}%`
        : 'Đang tải digital twin…'

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 35%, #2a1c14 0%, #1a1410 55%, #0e0b09 100%)',
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-valuemin={hasProgress ? 0 : undefined}
      aria-valuemax={hasProgress ? 100 : undefined}
      aria-valuenow={hasProgress ? pct : undefined}
      aria-label={statusLabel}
    >
      {/* Subtle paper grain via CSS gradients only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, #E8DCC8 2px, #E8DCC8 3px), repeating-linear-gradient(90deg, transparent, transparent 3px, #C9A227 3px, #C9A227 4px)',
          backgroundSize: '7px 7px, 11px 11px',
        }}
      />

      <div className="relative z-[1] mx-6 w-full max-w-md text-center">
        <CalligraphyMark reducedMotion={reducedMotion} />

        <p className="mt-6 text-2xl tracking-[0.22em] text-[#C9A227]">KINH THÀNH HUẾ</p>
        <p className="mt-2 text-sm text-[#E8DCC8]/opacity-70">{statusLabel}</p>

        <div
          className="mx-auto mt-6 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[#E8DCC8]/15"
          aria-hidden
        >
          {hasProgress ? (
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8B1A1A] via-[#C9A227] to-[#E8D5A3] transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          ) : (
            <div className="relative h-full w-full">
              <div
                className={`absolute inset-y-0 left-0 w-2/5 rounded-full bg-gradient-to-r from-transparent via-[#C9A227] to-transparent ${
                  reducedMotion ? '' : 'kth-loading-bar-indeterminate'
                }`}
                style={reducedMotion ? { left: '30%', width: '40%', opacity: 0.7 } : undefined}
              />
            </div>
          )}
        </div>

        <p
          key={tip ? 'fixed' : tick}
          className={`mx-auto mt-8 max-w-sm text-xs leading-relaxed text-[#E8DCC8]/opacity-55 ${
            tip || reducedMotion ? '' : 'kth-loading-tip'
          }`}
        >
          {rotatedTip}
        </p>
      </div>
    </div>
  )
}
