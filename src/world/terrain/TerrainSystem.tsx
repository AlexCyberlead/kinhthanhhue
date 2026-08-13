import { useMemo, useEffect } from 'react'
import { Detailed } from '@react-three/drei'
import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { useAppStore } from '../../state/appStore'
import { buildTerrainGeometry } from './buildTerrainGeometry'
import { buildWaterGeometry } from './buildWaterGeometry'
import { createTerrainMaterial } from './createTerrainMaterial'
import { TERRAIN_LOD } from './terrainConfig'

/**
 * Procedural terrain: heightfield splat + sông Hương + cồn + hào Hộ Thành.
 *
 * Land: 1 mesh LOD-swapped. Vertex color = brick/dirt/grass weights.
 * Water (sông + hào Kinh thành merged): +1 draw call.
 */
export function TerrainSystem(): JSX.Element {
  const quality = useAppStore((s) => s.quality)

  const lod1Seg =
    quality === 'low' ? TERRAIN_LOD.lod2Segments : quality === 'med' ? 128 : TERRAIN_LOD.lod1Segments

  const landLod1 = useMemo(() => buildTerrainGeometry(lod1Seg), [lod1Seg])
  const landLod2 = useMemo(() => buildTerrainGeometry(TERRAIN_LOD.lod2Segments), [])
  const water = useMemo(() => buildWaterGeometry(), [])

  const landMat = useMemo(() => createTerrainMaterial(1), [])
  const landMatFar = useMemo(() => createTerrainMaterial(2), [])

  const waterMat = useMemo(() => {
    const mat = getMaterial('nuoc', 1).clone()
    mat.transparent = true
    mat.opacity = 0.88
    mat.depthWrite = true
    mat.side = THREE.DoubleSide
    mat.name = 'terrain_water_nuoc'
    return mat
  }, [])

  useEffect(() => {
    return () => {
      landLod1.geometry.dispose()
      landLod2.geometry.dispose()
      water.geometry.dispose()
      landMat.dispose()
      landMatFar.dispose()
      waterMat.dispose()
    }
  }, [landLod1, landLod2, water, landMat, landMatFar, waterMat])

  return (
    <group name="TerrainSystem">
      <Detailed distances={[0, TERRAIN_LOD.farDistance]}>
        <mesh
          name="terrain_land_lod1"
          geometry={landLod1.geometry}
          material={landMat}
          receiveShadow
          castShadow={false}
          frustumCulled
        />
        <mesh
          name="terrain_land_lod2"
          geometry={landLod2.geometry}
          material={landMatFar}
          receiveShadow
          castShadow={false}
          frustumCulled
        />
      </Detailed>

      <mesh
        name="terrain_water"
        geometry={water.geometry}
        material={waterMat}
        receiveShadow
        castShadow={false}
        frustumCulled
        renderOrder={1}
      />
    </group>
  )
}

/** Triangle estimates for acceptance report / debug. */
export function getTerrainTriangleEstimate(segments = TERRAIN_LOD.lod1Segments): {
  land: number
  waterApproxUpper: number
  totalApprox: number
} {
  const land = segments * segments * 2
  const waterApproxUpper = 96 * 24 * 2 + 20_000
  return { land, waterApproxUpper, totalApprox: land + waterApproxUpper }
}
