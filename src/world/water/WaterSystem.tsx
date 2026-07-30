import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAppStore } from '../../state/appStore'
import { createWaterMaterial } from './createWaterMaterial'
import { createWaterMeshes } from './buildWaterMeshes'

/**
 * Wave A / A5 — Ngự Hà + Hồ Tịnh Tâm + Hồ Thái Dịch.
 * Shared ShaderMaterial (fresnel / waves / fake reflection / rain ripples).
 * Draw calls: 3 meshes ≤ 4 budget.
 */
export function WaterSystem() {
  const raining = useAppStore((s) => s.raining)
  const handle = useMemo(() => createWaterMaterial(), [])
  const meshes = useMemo(
    () => createWaterMeshes(handle.material),
    [handle.material],
  )

  useEffect(() => {
    handle.setRaining(raining)
  }, [handle, raining])

  useEffect(() => {
    return () => {
      meshes.dispose()
      handle.dispose()
    }
  }, [meshes, handle])

  useFrame(({ clock }) => {
    handle.setTime(clock.elapsedTime)
  })

  return (
    <group name="WaterSystem">
      <primitive object={meshes.thaiDich} />
      <primitive object={meshes.tinhTam} />
      <primitive object={meshes.nguHa} />
    </group>
  )
}
