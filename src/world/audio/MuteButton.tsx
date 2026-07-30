import { useAppStore } from '../../state/appStore'

/**
 * Corner mute toggle — syncs with `useAppStore().muted`.
 * DOM overlay; place outside `<Canvas>`.
 */
export function MuteButton() {
  const muted = useAppStore((s) => s.muted)
  const setMuted = useAppStore((s) => s.setMuted)

  return (
    <button
      type="button"
      aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
      aria-pressed={muted}
      title={muted ? 'Unmute' : 'Mute'}
      onClick={() => setMuted(!muted)}
      className="pointer-events-auto absolute bottom-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-md border border-[#C9A227]/40 bg-[#1a1410]/75 text-[#E8DCC8] shadow-md backdrop-blur-sm transition hover:border-[#C9A227] hover:bg-[#1a1410]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
    >
      {muted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M11 5L6 9H3v6h3l5 4V5z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M22 9l-6 6M16 9l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M11 5L6 9H3v6h3l5 4V5z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M15.5 8.5a5 5 0 010 7M18.5 6a9 9 0 010 12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  )
}
