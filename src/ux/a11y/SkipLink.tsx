import { useState, type CSSProperties, type ReactNode } from 'react'
import { useT } from '../../i18n'
import type { MessageKey } from '../../i18n'
import { A11Y_IDS } from './hudAria'

type SkipTarget = 'main' | 'hud' | 'canvas'

const TARGET_HREF: Record<SkipTarget, string> = {
  main: `#${A11Y_IDS.main}`,
  hud: `#${A11Y_IDS.hud}`,
  canvas: `#${A11Y_IDS.canvas}`,
}

const TARGET_LABEL: Record<SkipTarget, MessageKey> = {
  main: 'skip.toMain',
  hud: 'skip.toHud',
  canvas: 'skip.toCanvas',
}

const hiddenStyle: CSSProperties = {
  position: 'absolute',
  left: 12,
  top: 12,
  zIndex: 10000,
  padding: '10px 14px',
  borderRadius: 4,
  background: '#1a1410',
  color: '#E8DCC8',
  border: '1px solid #C9A227',
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  fontSize: 14,
  textDecoration: 'none',
  transform: 'translateY(-200%)',
}

const visibleStyle: CSSProperties = {
  ...hiddenStyle,
  transform: 'translateY(0)',
}

type SkipLinkProps = {
  /** Which landmark to jump to. Default: main. */
  target?: SkipTarget
  /** Override href (must start with #). */
  href?: string
  children?: ReactNode
  className?: string
}

/**
 * Visually hidden until focused — place as first focusable child of the app shell.
 * Pair with matching `id` from `A11Y_IDS` on landmarks (Hud / canvas / main).
 */
export function SkipLink({
  target = 'main',
  href,
  children,
  className,
}: SkipLinkProps) {
  const t = useT()
  const [focused, setFocused] = useState(false)
  const resolvedHref = href ?? TARGET_HREF[target]
  const label = children ?? t(TARGET_LABEL[target])

  return (
    <a
      href={resolvedHref}
      className={className}
      style={focused ? visibleStyle : hiddenStyle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {label}
    </a>
  )
}

type SkipLinksProps = {
  /** Which skip targets to render. Default: main + hud + canvas. */
  targets?: SkipTarget[]
}

/** Convenience cluster of common skip links for the Hud shell. */
export function SkipLinks({ targets = ['main', 'hud', 'canvas'] }: SkipLinksProps) {
  const t = useT()
  return (
    <nav aria-label={t('skip.nav')}>
      {targets.map((target) => (
        <SkipLink key={target} target={target} />
      ))}
    </nav>
  )
}
