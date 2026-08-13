import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAppStore } from '../../state/appStore'
import { createWaterMaterial } from './createWaterMaterial'
import { createWaterMeshes } from './buildWaterMeshes'
import { buildThaiDichLotus, buildTinhTamLotus } from './buildLotusField'

/**
 * Ngự Hà + Hồ Tịnh Tâm + Hồ Thái Dịch + Ngoại Kim Thủy.
 * Shared ShaderMaterial (fresnel / waves / fake reflection / rain ripples).
 * Draw calls: 5 water meshes + 2 lotus groups.
 */
export function WaterSystem() {
  const raining = useAppStore((s) => s.raining)
  const handle = useMemo(() => createWaterMaterial(), [])
  const meshes = useMemo(
    () => createWaterMeshes(handle.material),
    [handle.material],
  )
  const lotus = useMemo(() => buildThaiDichLotus(1), [])
  const tinhLotus = useMemo(() => buildTinhTamLotus(1), [])

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
      <primitive object={lotus} />
      <primitive object={tinhLotus} />
      <primitive object={meshes.tinhTam} />
      <primitive object={meshes.nguHa} />
      <primitive object={meshes.ngoaiKimThuy} />
      <primitive object={meshes.noiKimThuy} />
    </group>
  )
}
