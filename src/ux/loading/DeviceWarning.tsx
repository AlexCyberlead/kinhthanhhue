import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../../state/appStore'
import { assessDeviceRisk, type DeviceRisk } from './detectDevice'

const DISMISS_KEY = 'kth:deviceWarningDismissed'

const COPY = {
  vi: {
    mobile:
      'Thiết bị di động có thể chạy chậm với bản 3D đầy đủ. Nên dùng máy tính hoặc hạ chất lượng đồ họa.',
    weak: 'Thiết bị có thể yếu cho digital twin 3D. Hãy chọn preset chất lượng thấp nếu bị giật.',
    both: 'Thiết bị di động / GPU yếu — trải nghiệm 3D có thể chậm. Nên hạ chất lượng hoặc dùng máy mạnh hơn.',
    dismiss: 'Đã hiểu',
  },
  en: {
    mobile:
      'Mobile devices may struggle with the full 3D twin. Prefer a desktop or lower graphics quality.',
    weak: 'This device may be underpowered for the 3D twin. Switch to a low quality preset if it stutters.',
    both: 'Mobile / weak GPU detected — 3D may run slowly. Lower quality or use a stronger machine.',
    dismiss: 'Got it',
  },
} as const

function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

function writeDismissed(): void {
  try {
    sessionStorage.setItem(DISMISS_KEY, '1')
  } catch {
    /* private mode */
  }
}

function messageFor(risk: DeviceRisk, locale: 'vi' | 'en'): string {
  const c = COPY[locale]
  if (risk.reason === 'both') return c.both
  if (risk.reason === 'mobile') return c.mobile
  return c.weak
}

/**
 * Banner cảnh báo mobile / thiết bị yếu — dismiss theo session.
 */
export function DeviceWarning(): JSX.Element {
  const locale = useAppStore((s) => s.locale)
  const [risk, setRisk] = useState<DeviceRisk | null>(null)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    setDismissed(readDismissed())
    setRisk(assessDeviceRisk())
  }, [])

  const onDismiss = useCallback(() => {
    writeDismissed()
    setDismissed(true)
  }, [])

  const visible = Boolean(risk?.shouldWarn) && !dismissed

  const text = useMemo(() => {
    if (!risk?.shouldWarn) return ''
    return messageFor(risk, locale === 'en' ? 'en' : 'vi')
  }, [risk, locale])

  if (!visible) {
    return <></>
  }

  return (
    <div
      role="alert"
      className="pointer-events-auto absolute inset-x-0 top-0 z-40 flex justify-center px-3 pt-3"
    >
      <div className="flex max-w-xl items-start gap-3 rounded-md border border-[#C9A227]/45 bg-[#1a1410]/92 px-3 py-2.5 text-left text-[#E8DCC8] shadow-lg backdrop-blur-sm">
        <span
          aria-hidden
          className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-[#8B1A1A]/80 text-[11px] font-semibold text-[#E8DCC8]"
        >
          !
        </span>
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-[#E8DCC8]/opacity-90">{text}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded border border-[#C9A227]/40 px-2 py-1 text-[11px] tracking-wide text-[#C9A227] transition hover:border-[#C9A227] hover:bg-[#C9A227]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
        >
          {locale === 'en' ? COPY.en.dismiss : COPY.vi.dismiss}
        </button>
      </div>
    </div>
  )
}
