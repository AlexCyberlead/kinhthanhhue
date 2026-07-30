import type { AriaAttributes, HTMLAttributes } from 'react'
import type { CameraMode, Locale, QualityPreset } from '../../state/appStore'
import { t, type MessageKey } from '../../i18n/messages'

/** Stable DOM ids — Hud / Engine / App should wire these on landmarks. */
export const A11Y_IDS = {
  main: 'main-content',
  hud: 'hud-controls',
  canvas: 'scene-canvas',
  minimap: 'hud-minimap',
  poiPanel: 'poi-panel',
  tourPanel: 'tour-panel',
} as const

export type A11yId = (typeof A11Y_IDS)[keyof typeof A11Y_IDS]

type Season = 'xuan' | 'ha' | 'thu' | 'dong'
type Reconstruction = 'ruin' | 'restored'

const CAMERA_KEYS: Record<CameraMode, MessageKey> = {
  orbit: 'hud.camera.orbit',
  walk: 'hud.camera.walk',
  drone: 'hud.camera.drone',
  tour: 'hud.camera.tour',
}

const SEASON_KEYS: Record<Season, MessageKey> = {
  xuan: 'hud.season.xuan',
  ha: 'hud.season.ha',
  thu: 'hud.season.thu',
  dong: 'hud.season.dong',
}

const QUALITY_KEYS: Record<QualityPreset, MessageKey> = {
  low: 'hud.quality.low',
  med: 'hud.quality.med',
  high: 'hud.quality.high',
  ultra: 'hud.quality.ultra',
}

const RECON_KEYS: Record<Reconstruction, MessageKey> = {
  ruin: 'hud.reconstruction.ruin',
  restored: 'hud.reconstruction.restored',
}

/** Landmark props for the Hud root `<aside>` / `<div role="region">`. */
export function hudRegionProps(
  locale: Locale,
): HTMLAttributes<HTMLElement> & AriaAttributes {
  return {
    id: A11Y_IDS.hud,
    role: 'region',
    'aria-label': t(locale, 'hud.region'),
  }
}

/** Landmark props for the WebGL canvas host. */
export function canvasLandmarkProps(
  locale: Locale,
): HTMLAttributes<HTMLElement> & AriaAttributes {
  return {
    id: A11Y_IDS.canvas,
    role: 'application',
    'aria-label': t(locale, 'a11y.canvasLabel'),
    tabIndex: 0,
  }
}

/** Landmark props for `#main-content`. */
export function mainLandmarkProps(
  locale: Locale,
): HTMLAttributes<HTMLElement> & AriaAttributes {
  return {
    id: A11Y_IDS.main,
    role: 'main',
    'aria-label': t(locale, 'a11y.mainLandmark'),
  }
}

export function cameraModeAriaLabel(locale: Locale, mode: CameraMode): string {
  return `${t(locale, 'hud.camera')}: ${t(locale, CAMERA_KEYS[mode])}`
}

export function seasonAriaLabel(locale: Locale, season: Season): string {
  return `${t(locale, 'hud.season')}: ${t(locale, SEASON_KEYS[season])}`
}

export function qualityAriaLabel(locale: Locale, quality: QualityPreset): string {
  return `${t(locale, 'hud.quality')}: ${t(locale, QUALITY_KEYS[quality])}`
}

export function reconstructionAriaLabel(
  locale: Locale,
  mode: Reconstruction,
): string {
  return `${t(locale, 'hud.reconstruction')}: ${t(locale, RECON_KEYS[mode])}`
}

export function rainAriaLabel(locale: Locale, raining: boolean): string {
  return raining ? t(locale, 'hud.rain.on') : t(locale, 'hud.rain.off')
}

export function muteAriaLabel(locale: Locale, muted: boolean): string {
  return muted ? t(locale, 'hud.unmute') : t(locale, 'hud.mute')
}

export function localeToggleAriaLabel(locale: Locale, next: Locale): string {
  return next === 'vi' ? t(locale, 'hud.locale.vi') : t(locale, 'hud.locale.en')
}

export function minimapAriaProps(
  locale: Locale,
): HTMLAttributes<HTMLElement> & AriaAttributes {
  return {
    id: A11Y_IDS.minimap,
    role: 'img',
    'aria-label': t(locale, 'hud.minimap'),
  }
}

/** Bundle of Hud-facing aria helpers keyed by control. */
export function getHudAriaLabels(locale: Locale) {
  return {
    region: t(locale, 'hud.region'),
    camera: t(locale, 'hud.camera'),
    timeOfDay: t(locale, 'hud.timeOfDay'),
    season: t(locale, 'hud.season'),
    rain: t(locale, 'hud.rain'),
    quality: t(locale, 'hud.quality'),
    reconstruction: t(locale, 'hud.reconstruction'),
    locale: t(locale, 'hud.locale'),
    minimap: t(locale, 'hud.minimap'),
    cameraMode: (mode: CameraMode) => cameraModeAriaLabel(locale, mode),
    seasonValue: (season: Season) => seasonAriaLabel(locale, season),
    qualityValue: (q: QualityPreset) => qualityAriaLabel(locale, q),
    reconstructionValue: (m: Reconstruction) => reconstructionAriaLabel(locale, m),
    rainValue: (raining: boolean) => rainAriaLabel(locale, raining),
    muteValue: (muted: boolean) => muteAriaLabel(locale, muted),
    localeNext: (next: Locale) => localeToggleAriaLabel(locale, next),
  }
}
