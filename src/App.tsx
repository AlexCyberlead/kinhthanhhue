import { Suspense, lazy } from 'react'
import { Engine } from './core/Engine'

const WorldScene = lazy(() =>
  import('./scenes/WorldScene').then((m) => ({ default: m.WorldScene })),
)

function BootScreen() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#1a1410]">
      <div className="text-center">
        <p className="text-2xl tracking-[0.2em] text-[#C9A227]">KINH THÀNH HUẾ</p>
        <p className="mt-2 text-sm text-[#E8DCC8]/opacity-70">Đang tải digital twin…</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="relative h-full w-full">
      <Suspense fallback={<BootScreen />}>
        <Engine>
          <WorldScene />
        </Engine>
      </Suspense>
    </div>
  )
}
