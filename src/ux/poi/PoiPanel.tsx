import { useEffect, useMemo } from 'react'
import { bootstrapMonuments } from '../../registry/registerAll'
import { getMonument } from '../../registry/monuments'
import { useAppStore } from '../../state/appStore'
import { readPoiFromUrl, selectPoi } from './poiUrl'

/**
 * Bilingual POI info overlay — mount outside `<Canvas>`.
 * Reads `?poi=` on mount; writes history via `selectPoi` on close / hotspot click.
 */
export function PoiPanel(): JSX.Element {
  const locale = useAppStore((s) => s.locale)
  const selectedPoiId = useAppStore((s) => s.selectedPoiId)
  const setSelectedPoiId = useAppStore((s) => s.setSelectedPoiId)

  // Warm registry + hydrate from deep-link once (store only — URL already correct).
  useEffect(() => {
    bootstrapMonuments()
    const fromUrl = readPoiFromUrl()
    if (fromUrl && getMonument(fromUrl)) {
      setSelectedPoiId(fromUrl)
    }
  }, [setSelectedPoiId])

  // Browser back/forward ↔ store.
  useEffect(() => {
    const onPop = () => {
      const fromUrl = readPoiFromUrl()
      if (fromUrl && getMonument(fromUrl)) {
        setSelectedPoiId(fromUrl)
      } else {
        setSelectedPoiId(null)
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [setSelectedPoiId])

  const monument = useMemo(() => {
    if (!selectedPoiId) return null
    return getMonument(selectedPoiId) ?? null
  }, [selectedPoiId])

  if (!monument) {
    return <div className="pointer-events-none" aria-hidden />
  }

  const title = monument.displayName[locale]
  const body = monument.poi[locale]
  const year = monument.poi.year
  const closeLabel = locale === 'vi' ? 'Đóng' : 'Close'
  const yearLabel = locale === 'vi' ? 'Năm' : 'Year'

  return (
    <aside
      className="pointer-events-auto absolute bottom-4 left-4 z-40 flex max-h-[min(52vh,420px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-md border border-[#C9A227]/35 bg-[#1a1410]/88 text-[#E8DCC8] shadow-lg backdrop-blur-md sm:bottom-6 sm:left-6"
      role="dialog"
      aria-labelledby="poi-panel-title"
      aria-modal="false"
    >
      <header className="flex items-start gap-3 border-b border-[#C9A227]/25 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#C9A227]/80">
            POI · {monument.id}
          </p>
          <h2 id="poi-panel-title" className="mt-1 truncate font-semibold text-[#E8DCC8]">
            {title}
          </h2>
          {year ? (
            <p className="mt-1 text-xs text-[#C5B8A4]">
              {yearLabel}: <span className="text-[#C9A227]">{year}</span>
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => selectPoi(null)}
          aria-label={closeLabel}
          className="shrink-0 rounded border border-[#C9A227]/30 px-2 py-1 text-xs text-[#E8DCC8] transition hover:border-[#C9A227] hover:bg-[#8B1A1A]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
        >
          ✕
        </button>
      </header>
      <div className="overflow-y-auto px-4 py-3 text-sm leading-relaxed text-[#E8DCC8]/90">
        <p>{body}</p>
      </div>
    </aside>
  )
}
