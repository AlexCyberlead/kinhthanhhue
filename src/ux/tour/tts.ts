import type { Locale } from '../../state/appStore'

/** Cancel any ongoing Web Speech utterance. */
export function stopTourSpeech(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
}

/**
 * Speak narration via Web Speech API.
 * No-op when muted, unsupported, or empty text.
 */
export function speakTourNarration(
  text: string,
  locale: Locale,
  muted: boolean,
): void {
  if (muted || !text.trim()) return
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  stopTourSpeech()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = locale === 'vi' ? 'vi-VN' : 'en-US'
  utter.rate = locale === 'vi' ? 0.95 : 1
  utter.pitch = 1
  window.speechSynthesis.speak(utter)
}
