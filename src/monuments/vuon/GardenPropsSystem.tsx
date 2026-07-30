import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { coHaGardenModule } from './coHaGarden'
import { thieuPhuongModule } from './thieuPhuong'

export type GardenPropsSystemProps = {
  lod?: 0 | 1 | 2
  /** When true, skip mounting (use MonumentModule registry instead). */
  disabled?: boolean
}

/**
 * Optional R3F mount for both garden hardscapes at world anchors.
 * Prefer registering `coHaGardenModule` + `thieuPhuongModule` via bootstrap —
 * do NOT mount this AND register the same modules (double geometry).
 *
 * No trees — VegetationSystem owns foliage.
 */
export function GardenPropsSystem({
  lod = 1,
  disabled = false,
}: GardenPropsSystemProps): React.JSX.Element | null {
  const group = useMemo(() => {
    if (disabled) return null
    const root = new THREE.Group()
    root.name = 'garden-props-system'

    for (const mod of [coHaGardenModule, thieuPhuongModule]) {
      const g = mod.build(lod)
      g.position.set(...mod.anchor)
      g.rotation.y = mod.rotationY
      root.add(g)
    }
    return root
  }, [lod, disabled])

  useEffect(() => {
    if (!group) return
    return () => {
      group.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.isMesh) mesh.geometry?.dispose()
      })
    }
  }, [group])

  if (!group) return null
  return <primitive object={group} />
}
