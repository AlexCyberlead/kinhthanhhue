import { Suspense, lazy, useEffect } from 'react'
import { Engine } from './core/Engine'
import { MuteButton } from './world/audio'
import { Hud } from './ux/ui'
import { PoiPanel } from './ux/poi'
import { TourPanel } from './ux/tour'
import { LoadingScreen, DeviceWarning } from './ux/loading'
import { HeadMeta } from './ux/seo'
import { SkipLinks } from './ux/a11y'
import { useAppStore } from './state/appStore'

const WorldScene = lazy(() =>
  import('./scenes/WorldScene').then((m) => ({ default: m.WorldScene })),
)

function LocaleFromUrl() {
  const setLocale = useAppStore((s) => s.setLocale)
  useEffect(() => {
    const lang = new URLSearchParams(window.location.search).get('lang')
    if (lang === 'vi' || lang === 'en') setLocale(lang)
  }, [setLocale])
  return null
}

export default function App() {
  return (
    <div className="relative h-full w-full" id="main-content" role="main">
      <HeadMeta />
      <SkipLinks />
      <LocaleFromUrl />
      <Suspense fallback={<LoadingScreen />}>
        <div id="scene-canvas" className="h-full w-full" role="application" aria-label="Kinh Thành Huế 3D">
          <Engine>
            <WorldScene />
          </Engine>
        </div>
      </Suspense>
      <Hud />
      <PoiPanel />
      <TourPanel />
      <DeviceWarning />
      <MuteButton />
    </div>
  )
}
