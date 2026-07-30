/**
 * Deep-link helpers for `?poi=<monument-id>` (e.g. `?poi=ngo-mon`).
 */
import { getMonument } from '../../registry/monuments'
import { useAppStore } from '../../state/appStore'

export function readPoiFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get('poi')
  if (!raw) return null
  const id = raw.trim()
  return id.length > 0 ? id : null
}

export function writePoiToUrl(id: string | null): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (id) url.searchParams.set('poi', id)
  else url.searchParams.delete('poi')

  const next = `${url.pathname}${url.search}${url.hash}`
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (next === current) return

  window.history.pushState({ poi: id }, '', next)
}

/** Select / deselect POI and keep `?poi=` history in sync. */
export function selectPoi(id: string | null): void {
  if (id && !getMonument(id)) return
  useAppStore.getState().setSelectedPoiId(id)
  writePoiToUrl(id)
}

/** Toggle: same id clears; other id switches. */
export function togglePoi(id: string): void {
  const current = useAppStore.getState().selectedPoiId
  selectPoi(current === id ? null : id)
}
