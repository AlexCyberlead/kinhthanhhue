import { useCallback } from 'react'
import { useAppStore, type Locale } from '../state/appStore'
import { messages, t, type MessageKey } from './messages'

export type TranslateFn = (
  key: MessageKey,
  vars?: Record<string, string | number>,
) => string

/**
 * Lightweight i18n — reads `locale` from zustand `useAppStore`.
 * No react-i18next dependency.
 */
export function useT(): TranslateFn {
  const locale = useAppStore((s) => s.locale)
  return useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => t(locale, key, vars),
    [locale],
  )
}

/** Current locale from store (convenience for bilingual panels). */
export function useLocale(): Locale {
  return useAppStore((s) => s.locale)
}

/** Static dictionary accessor for the active locale. */
export function useMessages() {
  const locale = useAppStore((s) => s.locale)
  return messages[locale]
}
