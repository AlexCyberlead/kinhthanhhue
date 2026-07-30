import type { QualityPreset } from '../../state/appStore'

/** Session flag — UI gọi `markQualityUserOverride()` khi user đổi quality tay. */
export const QUALITY_OVERRIDE_KEY = 'kth:qualityUserOverride'

export function isQualityUserOverridden(): boolean {
  try {
    return sessionStorage.getItem(QUALITY_OVERRIDE_KEY) === '1'
  } catch {
    return false
  }
}

/** Gọi từ settings UI khi user chọn preset thủ công. */
export function markQualityUserOverride(): void {
  try {
    sessionStorage.setItem(QUALITY_OVERRIDE_KEY, '1')
  } catch {
    /* private mode / SSR */
  }
}

function readGpuRenderer(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2', { powerPreference: 'high-performance' }) ??
      canvas.getContext('webgl', { powerPreference: 'high-performance' })
    if (!gl) return ''

    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '')
      : String(gl.getParameter(gl.RENDERER) ?? '')

    const lose = gl.getExtension('WEBGL_lose_context')
    lose?.loseContext()
    return renderer
  } catch {
    return ''
  }
}

/**
 * Heuristic one-shot: integrated / software / low cores → med hoặc low.
 * Discrete GPU mạnh → giữ `high` (không auto-ultra).
 */
export function detectRecommendedQuality(): QualityPreset {
  const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency ?? 4) : 4
  const renderer = readGpuRenderer().toLowerCase()

  const isSoftware = /swiftshader|llvmpipe|softpipe|microsoft basic render|gdi generic/.test(
    renderer,
  )
  // Apple Silicon (M1+) mạnh dù iGPU — không hạ preset. Intel / mobile GPU → yếu hơn.
  const isAppleSilicon = /apple\s*m[1-9]|apple gpu/.test(renderer)
  const isWeakIntegrated =
    !isAppleSilicon &&
    /intel|uhd|iris|hd graphics|mali|adreno|powervr|videocore|radeon\(tm\) graphics/.test(
      renderer,
    )

  if (isSoftware || cores <= 2) return 'low'
  if (isWeakIntegrated || cores <= 4) return 'med'
  return 'high'
}
