import { useMemo } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../../state/appStore'
import {
  computeSkyPalette,
  dayFactor,
  moonDirectionFromTime,
  sunDirectionFromTime,
  twilightFactor,
} from './skyMath'
import { SkyDome } from './SkyDome'
import { Celestial } from './Celestial'
import { CloudField } from './CloudField'
import { NightStars } from './NightStars'

/**
 * Day–night sky system: Preetham-like dome, sun/moon lights, instanced clouds, night stars.
 * Reads `timeOfDay`, `season`, `raining` from zustand.
 *
 * Draw calls ≈ 4: sky dome + celestial discs + clouds + stars.
 */
export function SkySystem() {
  const timeOfDay = useAppStore((s) => s.timeOfDay)
  const season = useAppStore((s) => s.season)
  const raining = useAppStore((s) => s.raining)

  const sunDir = useMemo(() => sunDirectionFromTime(timeOfDay, new THREE.Vector3()), [timeOfDay])
  const moonDir = useMemo(() => moonDirectionFromTime(timeOfDay, new THREE.Vector3()), [timeOfDay])
  const day = useMemo(() => dayFactor(timeOfDay), [timeOfDay])
  const twilight = useMemo(() => twilightFactor(timeOfDay), [timeOfDay])
  const palette = useMemo(
    () => computeSkyPalette(timeOfDay, season, raining),
    [timeOfDay, season, raining],
  )

  const cloudTint = useMemo(() => {
    const c = palette.horizon.clone().lerp(new THREE.Color('#ffffff'), 0.55 * day)
    if (raining) c.lerp(new THREE.Color('#7a8288'), 0.45)
    return c
  }, [palette, day, raining])

  return (
    <group name="SkySystem">
      <SkyDome
        palette={palette}
        sunDir={sunDir}
        day={day}
        twilight={twilight}
        raining={raining}
      />
      <Celestial sunDir={sunDir} moonDir={moonDir} palette={palette} day={day} />
      <CloudField opacity={palette.cloudOpacity} raining={raining} tint={cloudTint} />
      <NightStars opacity={palette.starOpacity} />
    </group>
  )
}
