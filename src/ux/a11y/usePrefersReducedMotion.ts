/**
 * Re-export prefers-reduced-motion from postfx (single source of truth).
 * UX / Hud layers should import from `@/ux/a11y` instead of diving into world/postfx.
 */
export { usePrefersReducedMotion } from '../../world/postfx/usePrefersReducedMotion'

/** Synchronous check — useful outside React (e.g. init guards). */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
