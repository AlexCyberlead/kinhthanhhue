import type { ReactNode } from 'react'
import type { QualityPreset } from '../../state/appStore'
import { useAppStore } from '../../state/appStore'
// Trỏ thẳng vào module, KHÔNG qua barrel `world/postfx`: barrel re-export cả
// PostFX nên sẽ kéo @react-three/postprocessing (~84KB gzip) vào graph tĩnh của
// HUD, đẩy chunk `post` lên critical path dù WorldScene đã lazy.
import { markQualityUserOverride } from '../../world/postfx/detectGpu'
import { Minimap } from './Minimap'
import { CAMERA_MODES, QUALITIES, SEASONS, t, type Season } from './i18n'
import { chipActive, chipIdle, panelClass } from './theme'

function formatHour(t24: number): string {
  const h = ((t24 % 24) + 24) % 24
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60) % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

/**
 * DOM HUD overlay — đặt ngoài `<Canvas>`.
 * Camera / TOD / season / rain / quality / reconstruction / locale + minimap.
 */
export function Hud(): JSX.Element {
  const locale = useAppStore((s) => s.locale)
  const cameraMode = useAppStore((s) => s.cameraMode)
  const timeOfDay = useAppStore((s) => s.timeOfDay)
  const season = useAppStore((s) => s.season)
  const raining = useAppStore((s) => s.raining)
  const quality = useAppStore((s) => s.quality)
  const reconstructionMode = useAppStore((s) => s.reconstructionMode)

  const setLocale = useAppStore((s) => s.setLocale)
  const setCameraMode = useAppStore((s) => s.setCameraMode)
  const setTimeOfDay = useAppStore((s) => s.setTimeOfDay)
  const setSeason = useAppStore((s) => s.setSeason)
  const setRaining = useAppStore((s) => s.setRaining)
  const setQuality = useAppStore((s) => s.setQuality)
  const setReconstructionMode = useAppStore((s) => s.setReconstructionMode)

  const L = t(locale)

  const onQuality = (q: QualityPreset) => {
    markQualityUserOverride()
    setQuality(q)
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 font-sans text-[#E8DCC8]"
      aria-label="Kinh Thành Huế HUD"
    >
      {/* Controls — top-left compact cluster */}
      <aside className={`absolute top-3 left-3 flex w-[min(100%-1.5rem,280px)] flex-col gap-2 p-2.5 ${panelClass}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold tracking-[0.18em] text-[#C9A227]">
            KINH THÀNH HUẾ
          </span>
          <div className="flex gap-0.5" role="group" aria-label={L.locale}>
            <button
              type="button"
              className={locale === 'vi' ? chipActive : chipIdle}
              aria-pressed={locale === 'vi'}
              onClick={() => setLocale('vi')}
            >
              VI
            </button>
            <button
              type="button"
              className={locale === 'en' ? chipActive : chipIdle}
              aria-pressed={locale === 'en'}
              onClick={() => setLocale('en')}
            >
              EN
            </button>
          </div>
        </div>

        <Row label={L.camera}>
          <div className="flex flex-wrap gap-0.5" role="group" aria-label={L.camera}>
            {CAMERA_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                className={cameraMode === mode ? chipActive : chipIdle}
                aria-pressed={cameraMode === mode}
                onClick={() => setCameraMode(mode)}
              >
                {L.cameras[mode]}
              </button>
            ))}
          </div>
        </Row>

        <Row label={`${L.time} ${formatHour(timeOfDay)}`}>
          <input
            type="range"
            min={0}
            max={24}
            step={0.05}
            value={timeOfDay}
            aria-label={L.time}
            onChange={(e) => setTimeOfDay(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E8DCC8]/20 accent-[#C9A227]"
          />
        </Row>

        <Row label={L.season}>
          <select
            value={season}
            aria-label={L.season}
            onChange={(e) => setSeason(e.target.value as Season)}
            className="w-full rounded border border-[#C9A227]/35 bg-[#1a1410] px-2 py-1 text-[11px] text-[#E8DCC8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
          >
            {SEASONS.map((s) => (
              <option key={s} value={s}>
                {L.seasons[s]}
              </option>
            ))}
          </select>
        </Row>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={raining ? chipActive : chipIdle}
            aria-pressed={raining}
            aria-label={L.rain}
            onClick={() => setRaining(!raining)}
          >
            {raining ? L.rainOn : L.rainOff}
          </button>

          <button
            type="button"
            className={reconstructionMode === 'ruin' ? chipActive : chipIdle}
            aria-pressed={reconstructionMode === 'ruin'}
            aria-label={L.reconstruction}
            onClick={() =>
              setReconstructionMode(reconstructionMode === 'ruin' ? 'restored' : 'ruin')
            }
          >
            {reconstructionMode === 'ruin' ? L.ruin : L.restored}
          </button>
        </div>

        <Row label={L.quality}>
          <select
            value={quality}
            aria-label={L.quality}
            onChange={(e) => onQuality(e.target.value as QualityPreset)}
            className="w-full rounded border border-[#C9A227]/35 bg-[#1a1410] px-2 py-1 text-[11px] text-[#E8DCC8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
          >
            {QUALITIES.map((q) => (
              <option key={q} value={q}>
                {L.qualities[q]}
              </option>
            ))}
          </select>
        </Row>
      </aside>

      {/* Minimap — bottom-left */}
      <div className={`absolute bottom-3 left-3 p-1.5 ${panelClass}`}>
        <Minimap locale={locale} />
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] tracking-wide text-[#E8DCC8]/55">{label}</span>
      {children}
    </div>
  )
}
