import { useEffect, useMemo, type JSX, type ReactElement } from 'react'
import {
  EffectComposer,
  Bloom,
  BrightnessContrast,
  DepthOfField,
  HueSaturation,
  SMAA,
  SSAO,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { Color, HalfFloatType } from 'three'
import { useAppStore } from '../../state/appStore'
import {
  detectRecommendedQuality,
  isQualityUserOverridden,
} from './detectGpu'
import { resolvePostFxPreset } from './presets'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/** AO ấm — bóng đổ kiểu hoài cổ, không đen lạnh. */
const SSAO_WARM = new Color('#2c1a12')

/**
 * Post-processing stack theo `quality` zustand.
 * Auto-detect GPU một lần / session nếu user chưa override.
 */
export function PostFX(): JSX.Element {
  const quality = useAppStore((s) => s.quality)
  const setQuality = useAppStore((s) => s.setQuality)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (isQualityUserOverridden()) return
    const recommended = detectRecommendedQuality()
    if (recommended !== useAppStore.getState().quality) {
      setQuality(recommended)
    }
  }, [setQuality])

  const preset = useMemo(
    () => resolvePostFxPreset(quality, reducedMotion),
    [quality, reducedMotion],
  )

  const effects = useMemo(() => {
    if (!preset.enabled) return null

    const nodes: ReactElement[] = []

    if (preset.ssao) {
      nodes.push(
        <SSAO
          key="ssao"
          blendFunction={BlendFunction.MULTIPLY}
          samples={preset.ssaoSamples}
          rings={4}
          intensity={preset.ssaoIntensity}
          radius={preset.ssaoRadius}
          // AO buffer chạy ở res thấp hơn. Phải đặt ở đây, KHÔNG đặt
          // `resolutionScale` trên <EffectComposer>: prop đó không hạ res render,
          // nó chỉ thêm DepthDownsamplingPass rồi đẩy SSAO sang nhánh
          // NORMAL_DEPTH + DEPTH_AWARE_UPSAMPLING — nhánh đó cho AO bão hoà,
          // MULTIPLY với 0 và bôi đen toàn khung.
          resolutionScale={preset.ssaoResolutionScale}
          depthAwareUpsampling={false}
          luminanceInfluence={0.55}
          bias={0.035}
          worldDistanceThreshold={55}
          worldDistanceFalloff={22}
          worldProximityThreshold={10}
          worldProximityFalloff={5}
          color={SSAO_WARM}
        />,
      )
    }

    if (preset.bloom) {
      nodes.push(
        <Bloom
          key="bloom"
          intensity={preset.bloomIntensity}
          luminanceThreshold={preset.bloomLuminanceThreshold}
          luminanceSmoothing={preset.bloomLuminanceSmoothing}
          mipmapBlur={preset.bloomMipmapBlur}
        />,
      )
    }

    if (preset.dof) {
      nodes.push(
        <DepthOfField
          key="dof"
          focusDistance={preset.dofFocusDistance}
          focalLength={preset.dofFocalLength}
          bokehScale={preset.dofBokehScale}
          height={480}
        />,
      )
    }

    if (preset.tone) {
      nodes.push(<ToneMapping key="tone" mode={ToneMappingMode.ACES_FILMIC} />)
    }

    if (preset.grade) {
      nodes.push(
        <HueSaturation
          key="hue"
          hue={preset.gradeHue}
          saturation={preset.gradeSaturation}
        />,
        <BrightnessContrast
          key="contrast"
          brightness={preset.gradeBrightness}
          contrast={preset.gradeContrast}
        />,
      )
    }

    if (preset.vignette) {
      nodes.push(
        <Vignette
          key="vignette"
          offset={preset.vignetteOffset}
          darkness={preset.vignetteDarkness}
          eskil={false}
        />,
      )
    }

    // SMAA = AA chính (TAA-ish budget; không thêm dep temporal).
    if (preset.smaa) {
      nodes.push(<SMAA key="smaa" />)
    }

    return nodes
  }, [preset])

  if (!preset.enabled || !effects || effects.length === 0) {
    return <></>
  }

  return (
    <EffectComposer
      key={`${quality}-${reducedMotion ? 'rm' : 'full'}`}
      multisampling={preset.multisampling}
      enableNormalPass={preset.enableNormalPass}
      frameBufferType={HalfFloatType}
    >
      {effects}
    </EffectComposer>
  )
}
