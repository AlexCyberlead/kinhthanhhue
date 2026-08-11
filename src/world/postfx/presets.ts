import type { QualityPreset } from '../../state/appStore'

export type PostFxPreset = {
  /** false = không mount EffectComposer (giữ ACES của Engine). */
  enabled: boolean
  enableNormalPass: boolean
  /**
   * Phải > 0 khi bật SSAO. SSAO khai báo EffectAttribute.DEPTH nên shader của
   * EffectPass có `float depth = readDepth(UV)`. Với multisampling = 0 composer
   * gắn depthTexture thẳng vào inputBuffer, và sau swap pass vừa sample depth
   * texture vừa render vào đúng render target sở hữu nó — feedback loop, ra
   * khung đen tuyệt đối. Target MSAA riêng + bước resolve phá vòng lặp đó.
   */
  multisampling: number
  /** Res của AO buffer riêng — truyền cho <SSAO>, không phải cho <EffectComposer>. */
  ssaoResolutionScale: number
  smaa: boolean
  ssao: boolean
  bloom: boolean
  dof: boolean
  tone: boolean
  grade: boolean
  vignette: boolean
  ssaoSamples: number
  ssaoIntensity: number
  ssaoRadius: number
  bloomIntensity: number
  bloomLuminanceThreshold: number
  bloomLuminanceSmoothing: number
  bloomMipmapBlur: boolean
  dofFocusDistance: number
  dofFocalLength: number
  dofBokehScale: number
  /** Hue shift (rad) — ấm nhẹ về phía cam/đỏ. */
  gradeHue: number
  /** Saturation delta — âm = muted greens / vintage. */
  gradeSaturation: number
  gradeBrightness: number
  gradeContrast: number
  vignetteOffset: number
  vignetteDarkness: number
}

const OFF: PostFxPreset = {
  enabled: false,
  enableNormalPass: false,
  multisampling: 0,
  ssaoResolutionScale: 1,
  smaa: false,
  ssao: false,
  bloom: false,
  dof: false,
  tone: false,
  grade: false,
  vignette: false,
  ssaoSamples: 8,
  ssaoIntensity: 0,
  ssaoRadius: 0.15,
  bloomIntensity: 0,
  bloomLuminanceThreshold: 0.9,
  bloomLuminanceSmoothing: 0.4,
  bloomMipmapBlur: true,
  dofFocusDistance: 0.02,
  dofFocalLength: 0.04,
  dofBokehScale: 0,
  gradeHue: 0.032,
  gradeSaturation: -0.16,
  gradeBrightness: -0.025,
  gradeContrast: 0.06,
  vignetteOffset: 0.35,
  vignetteDarkness: 0.4,
}

const BY_QUALITY: Record<QualityPreset, PostFxPreset> = {
  /** Ngân sách thấp: bỏ hết post — Canvas MSAA + ACES Engine. */
  low: { ...OFF },

  med: {
    ...OFF,
    enabled: true,
    enableNormalPass: true,
    multisampling: 2,
    ssaoResolutionScale: 0.5,
    smaa: true,
    ssao: true,
    bloom: true,
    tone: true,
    grade: true,
    ssaoSamples: 8,
    ssaoIntensity: 1,
    ssaoRadius: 0.14,
    bloomIntensity: 0.35,
    bloomLuminanceThreshold: 0.88,
    bloomLuminanceSmoothing: 0.45,
  },

  high: {
    ...OFF,
    enabled: true,
    enableNormalPass: true,
    multisampling: 4,
    ssaoResolutionScale: 0.75,
    smaa: true,
    ssao: true,
    bloom: true,
    dof: true,
    tone: true,
    grade: true,
    vignette: true,
    ssaoSamples: 16,
    ssaoIntensity: 1.5,
    ssaoRadius: 0.18,
    bloomIntensity: 0.55,
    bloomLuminanceThreshold: 0.82,
    bloomLuminanceSmoothing: 0.35,
    dofFocusDistance: 0.018,
    dofFocalLength: 0.035,
    dofBokehScale: 1.4,
    vignetteOffset: 0.32,
    vignetteDarkness: 0.42,
  },

  /** Full stack. */
  ultra: {
    ...OFF,
    enabled: true,
    enableNormalPass: true,
    multisampling: 4,
    ssaoResolutionScale: 1,
    smaa: true,
    ssao: true,
    bloom: true,
    dof: true,
    tone: true,
    grade: true,
    vignette: true,
    ssaoSamples: 28,
    ssaoIntensity: 2,
    ssaoRadius: 0.22,
    bloomIntensity: 0.75,
    bloomLuminanceThreshold: 0.78,
    bloomLuminanceSmoothing: 0.28,
    dofFocusDistance: 0.015,
    dofFocalLength: 0.04,
    dofBokehScale: 2.2,
    gradeHue: 0.038,
    gradeSaturation: -0.18,
    gradeBrightness: -0.03,
    gradeContrast: 0.08,
    vignetteOffset: 0.28,
    vignetteDarkness: 0.5,
  },
}

/**
 * Áp `prefers-reduced-motion`: cắt DoF, giảm bloom mạnh.
 */
export function resolvePostFxPreset(
  quality: QualityPreset,
  reducedMotion: boolean,
): PostFxPreset {
  const base = BY_QUALITY[quality]
  if (!reducedMotion || !base.enabled) return base

  return {
    ...base,
    dof: false,
    dofBokehScale: 0,
    bloomIntensity: base.bloom ? base.bloomIntensity * 0.28 : 0,
    bloom: base.bloom && base.bloomIntensity * 0.28 > 0.05,
  }
}
