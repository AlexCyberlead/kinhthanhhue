import { useEffect, useMemo, type JSX } from 'react'
import * as THREE from 'three'
import { applyWetness } from '../../core/materials/MaterialLibrary'
import { useAppStore } from '../../state/appStore'
import { dayFactor, isNight } from '../sky/skyMath'
import { RainStreaks } from './RainStreaks'
import { IncenseSmoke } from './IncenseSmoke'
import { DustField } from './DustField'
import { SeasonalLeaves } from './SeasonalLeaves'
import { BirdPoints } from './BirdPoints'
import { MorningMist } from './MorningMist'
import { GodRaySprites } from './GodRaySprites'

/**
 * Early mist window: strong 5–7.5h, soft shoulders.
 * Returns 0..1.
 */
function morningMistFactor(timeOfDay: number): number {
  const t = ((timeOfDay % 24) + 24) % 24
  if (t >= 4.5 && t < 5.5) return THREE.MathUtils.smoothstep(t, 4.5, 5.5)
  if (t >= 5.5 && t <= 7.5) return 1
  if (t > 7.5 && t < 9) return 1 - THREE.MathUtils.smoothstep(t, 7.5, 9)
  return 0
}

/**
 * AtmosphereSystem — particle & atmosphere FX for Kinh Thành Huế.
 *
 * Layers (≤ 7 draw calls, budget 10):
 * 1. GodRaySprites (InstancedMesh) — optional dawn shafts
 * 2. MorningMist (InstancedMesh) — early soft fog sprites
 * 3. DustField (Points)
 * 4. IncenseSmoke (Points) — near temples
 * 5. SeasonalLeaves (Points)
 * 6. RainStreaks (Points) — mưa Huế when raining
 * 7. BirdPoints (Points) — billboard flock
 *
 * No external particle libraries. GPU-driven via ShaderMaterial uniforms.
 */
export function AtmosphereSystem(): JSX.Element {
  const timeOfDay = useAppStore((s) => s.timeOfDay)
  const season = useAppStore((s) => s.season)
  const raining = useAppStore((s) => s.raining)
  // Optional store flag (audio); atmosphere stays visual-only.
  useAppStore((s) => s.muted)

  useEffect(() => {
    applyWetness(raining ? 1 : 0)
  }, [raining])

  const factors = useMemo(() => {
    const day = dayFactor(timeOfDay)
    const night = isNight(timeOfDay)
    const mist = morningMistFactor(timeOfDay)
    const rainMul = raining ? 1 : 0

    // Dust fades in rain / night
    const dust = raining ? 0.08 : night ? 0.15 : 0.55 + day * 0.45
    // Incense always present by day, softer at night
    const incense = night ? 0.35 : 0.85
    // Leaves reduced in rain
    const leaves = raining ? 0.25 : 1
    // Birds hide at night / heavy rain
    const birds = night ? 0 : raining ? 0.15 : Math.min(1, day * 1.2)
    // God rays: clear dawn / morning, sun up a bit
    const godRay =
      raining || night ? 0 : mist > 0.2 ? mist * 0.85 : day > 0.35 && day < 0.75 ? 0.25 : 0

    return {
      rain: rainMul,
      mist: mist * (raining ? 1.15 : 1),
      dust,
      incense,
      leaves,
      birds,
      godRay,
    }
  }, [timeOfDay, raining])

  return (
    <group name="AtmosphereSystem">
      <GodRaySprites timeOfDay={timeOfDay} intensity={factors.godRay} />
      <MorningMist intensity={factors.mist} />
      <DustField intensity={factors.dust} />
      <IncenseSmoke intensity={factors.incense} />
      <SeasonalLeaves season={season} intensity={factors.leaves} />
      <RainStreaks active={raining} />
      <BirdPoints intensity={factors.birds} />
    </group>
  )
}
