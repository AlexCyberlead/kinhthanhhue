import { useEffect } from 'react'
import { useAppStore, type Locale } from '../../state/appStore'
import { t } from '../../i18n/messages'
import {
  DEFAULT_KEYWORDS,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  SITE_NAME_EN,
  SITE_NAME_VI,
  SITE_ORIGIN,
} from './site'

function upsertMeta(
  attr: 'name' | 'property',
  key: string,
  content: string,
): void {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function upsertLink(rel: string, href: string, hreflang?: string): void {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`
  let el = document.head.querySelector<HTMLLinkElement>(selector)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    if (hreflang) el.hreflang = hreflang
    document.head.appendChild(el)
  }
  el.href = href
}

function applyLocaleDocument(locale: Locale): void {
  const title = t(locale, 'app.title')
  const description = t(locale, 'app.description')
  const siteName = locale === 'vi' ? SITE_NAME_VI : SITE_NAME_EN
  const ogLocale = locale === 'vi' ? 'vi_VN' : 'en_US'
  const altLocale = locale === 'vi' ? 'en_US' : 'vi_VN'
  const url = `${SITE_ORIGIN}/`
  const image = `${SITE_ORIGIN}${OG_IMAGE_PATH}`

  document.title = title
  document.documentElement.lang = locale

  upsertMeta('name', 'description', description)
  upsertMeta('name', 'keywords', DEFAULT_KEYWORDS.join(', '))
  upsertMeta('name', 'theme-color', '#8B1A1A')
  upsertMeta('name', 'application-name', siteName)

  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:site_name', siteName)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:url', url)
  upsertMeta('property', 'og:locale', ogLocale)
  upsertMeta('property', 'og:locale:alternate', altLocale)
  upsertMeta('property', 'og:image', image)
  upsertMeta('property', 'og:image:width', String(OG_IMAGE_WIDTH))
  upsertMeta('property', 'og:image:height', String(OG_IMAGE_HEIGHT))
  upsertMeta('property', 'og:image:type', 'image/svg+xml')

  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  upsertMeta('name', 'twitter:image', image)

  upsertLink('canonical', url)
  upsertLink('alternate', `${SITE_ORIGIN}/?lang=vi`, 'vi')
  upsertLink('alternate', `${SITE_ORIGIN}/?lang=en`, 'en')
  upsertLink('alternate', url, 'x-default')
}

type HeadMetaProps = {
  /** Override locale; defaults to zustand store. */
  locale?: Locale
  /** Extra title suffix, e.g. POI name. */
  titleSuffix?: string
}

/**
 * SPA document head sync — mount once near App root.
 * Static crawlers still need the tags listed in `SEO_NOTES.md` baked into `index.html`.
 */
export function HeadMeta({ locale: localeProp, titleSuffix }: HeadMetaProps) {
  const storeLocale = useAppStore((s) => s.locale)
  const locale = localeProp ?? storeLocale

  useEffect(() => {
    applyLocaleDocument(locale)
    if (titleSuffix) {
      document.title = `${t(locale, 'app.title')} — ${titleSuffix}`
      upsertMeta('property', 'og:title', document.title)
      upsertMeta('name', 'twitter:title', document.title)
    }
  }, [locale, titleSuffix])

  return null
}
