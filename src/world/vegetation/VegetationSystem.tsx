import { useEffect, useMemo, useRef, type JSX, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createPlantGeometry } from './geometries'
import { SPECIES } from './species'
import {
  countInstances,
  generatePlacements,
  type SpeciesPlacements,
} from './placements'
import { createWindMaterial, tickWindMaterials } from './windMaterial'
import type { Placement, VegetationSystemProps } from './types'

const _dummy = new THREE.Object3D()

function fillInstances(mesh: THREE.InstancedMesh, list: Placement[]): void {
  for (let i = 0; i < list.length; i++) {
    const p = list[i]!
    _dummy.position.set(p.x, p.y, p.z)
    _dummy.rotation.set(0, p.rotY, 0)
    _dummy.scale.setScalar(p.scale)
    _dummy.updateMatrix()
    mesh.setMatrixAt(i, _dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  mesh.count = list.length
}

type SpeciesLayerProps = {
  data: SpeciesPlacements
  enableWind: boolean
  materialsRef: MutableRefObject<THREE.Material[]>
}

/**
 * 2 InstancedMesh / loài (LOD near=1, far=2) → max 16 draw calls cho 8 loài.
 */
function SpeciesLayer({ data, enableWind, materialsRef }: SpeciesLayerProps) {
  const def = SPECIES[data.id]
  const nearRef = useRef<THREE.InstancedMesh>(null)
  const farRef = useRef<THREE.InstancedMesh>(null)

  const { nearGeo, farGeo, nearMat, farMat } = useMemo(() => {
    // LOD0 near + LOD2 far (LOD1 vẫn có qua createPlantGeometry).
    const nearGeo = createPlantGeometry(data.id, 0)
    const farGeo = createPlantGeometry(data.id, 2)
    // Warm LOD1 cache for consumers / future distance swaps.
    createPlantGeometry(data.id, 1)
    const nearMat = createWindMaterial({
      windStrength: def.windStrength,
      enableWind,
    })
    const farMat = createWindMaterial({
      windStrength: def.windStrength * 0.65,
      enableWind,
    })
    return { nearGeo, farGeo, nearMat, farMat }
  }, [data.id, def.windStrength, enableWind])

  useEffect(() => {
    materialsRef.current.push(nearMat, farMat)
    return () => {
      materialsRef.current = materialsRef.current.filter((m) => m !== nearMat && m !== farMat)
      nearMat.dispose()
      farMat.dispose()
    }
  }, [nearMat, farMat, materialsRef])

  useEffect(() => {
    if (nearRef.current && data.near.length > 0) {
      fillInstances(nearRef.current, data.near)
    }
    if (farRef.current && data.far.length > 0) {
      fillInstances(farRef.current, data.far)
    }
  }, [data])

  const nearCount = Math.max(1, data.near.length)
  const farCount = Math.max(1, data.far.length)

  return (
    <group name={`veg_${data.id}`}>
      {data.near.length > 0 && (
        <instancedMesh
          ref={nearRef}
          args={[nearGeo, nearMat, nearCount]}
          castShadow={def.height > 2}
          receiveShadow
          frustumCulled
        />
      )}
      {data.far.length > 0 && (
        <instancedMesh
          ref={farRef}
          args={[farGeo, farMat, farCount]}
          castShadow={false}
          receiveShadow
          frustumCulled
        />
      )}
    </group>
  )
}

/**
 * Vegetation system — 8 loài InstancedMesh + vertex wind.
 * `density=1` → ≥5000 instances; ≤16 draw calls (8×2 LOD).
 */
export function VegetationSystem(props: VegetationSystemProps = {}): JSX.Element {
  const { density = 1, enableWind = true } = props
  const materialsRef = useRef<THREE.Material[]>([])

  const placements = useMemo(() => generatePlacements(density), [density])
  const total = useMemo(() => countInstances(placements), [placements])

  useFrame(({ clock }) => {
    if (!enableWind) return
    tickWindMaterials(materialsRef.current, clock.elapsedTime)
  })

  return (
    <group name="VegetationSystem" userData={{ instanceCount: total, density }}>
      {placements.map((p) => (
        <SpeciesLayer
          key={p.id}
          data={p}
          enableWind={enableWind}
          materialsRef={materialsRef}
        />
      ))}
    </group>
  )
}

export type { VegetationSystemProps }
