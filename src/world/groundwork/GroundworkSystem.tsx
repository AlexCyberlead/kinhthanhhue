import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { Lod } from './constants'
import { buildGroundwork } from './buildGroundwork'

export type GroundworkSystemProps = {
  lod?: Lod
}

/**
 * Roads, Trung Đạo bridge, small moat bridges, stone steps, tường hoa / pháp lam.
 * Procedural, budget-aware (merged pavements + InstancedMesh details).
 */
export function GroundworkSystem({ lod = 1 }: GroundworkSystemProps): React.JSX.Element {
  const group = useMemo(() => buildGroundwork(lod), [lod])

  useEffect(() => {
    return () => {
      group.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.isMesh) {
          mesh.geometry?.dispose()
        }
      })
    }
  }, [group])

  return <primitive object={group} />
}
