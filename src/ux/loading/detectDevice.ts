export type DeviceRisk = {
  isMobile: boolean
  isWeak: boolean
  /** true nếu nên hiện banner */
  shouldWarn: boolean
  reason: 'mobile' | 'weak' | 'both' | null
}

function readGpuHint(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2', { powerPreference: 'low-power' }) ??
      canvas.getContext('webgl', { powerPreference: 'low-power' })
    if (!gl) return ''
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '')
      : String(gl.getParameter(gl.RENDERER) ?? '')
    const lose = gl.getExtension('WEBGL_lose_context')
    lose?.loseContext()
    return renderer.toLowerCase()
  } catch {
    return ''
  }
}

function detectMobile(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  if (/Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return true
  }
  const coarse =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  const narrow =
    typeof window !== 'undefined' && window.innerWidth > 0 && window.innerWidth < 768
  return Boolean(coarse && narrow)
}

function detectWeak(): boolean {
  if (typeof navigator === 'undefined') return false
  const cores = navigator.hardwareConcurrency ?? 4
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  const renderer = readGpuHint()
  const isSoftware = /swiftshader|llvmpipe|softpipe|microsoft basic render|gdi generic/.test(
    renderer,
  )
  const isAppleSilicon = /apple\s*m[1-9]|apple gpu/.test(renderer)
  const isWeakGpu =
    !isAppleSilicon &&
    /intel|uhd|iris|hd graphics|mali|adreno|powervr|videocore|radeon\(tm\) graphics/.test(
      renderer,
    )

  if (isSoftware || cores <= 2) return true
  if (typeof mem === 'number' && mem <= 2) return true
  if (isWeakGpu && cores <= 4) return true
  return false
}

/** One-shot heuristic — gọi lúc mount banner. */
export function assessDeviceRisk(): DeviceRisk {
  const isMobile = detectMobile()
  const isWeak = detectWeak()
  if (isMobile && isWeak) {
    return { isMobile, isWeak, shouldWarn: true, reason: 'both' }
  }
  if (isMobile) return { isMobile, isWeak, shouldWarn: true, reason: 'mobile' }
  if (isWeak) return { isMobile, isWeak, shouldWarn: true, reason: 'weak' }
  return { isMobile, isWeak, shouldWarn: false, reason: null }
}
