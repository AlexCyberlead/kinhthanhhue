import { useEffect, useMemo } from 'react'
import {
  buildCitadelWallGroup,
  disposeCitadelWallGroup,
} from './buildCitadelWalls'
import type { LodLevel } from './constants'

export type CitadelWallsProps = {
  lod?: LodLevel
}

/**
 * Procedural outer Kinh Thành wall + 24 Vauban bastions (R3F).
 * Geometry is merged aggressively (≤ 8 draw calls).
 */
export function CitadelWalls({ lod = 1 }: CitadelWallsProps) {
  const group = useMemo(() => buildCitadelWallGroup(lod), [lod])

  useEffect(() => {
    return () => {
      disposeCitadelWallGroup(group)
    }
  }, [group])

  return <primitive object={group} />
}
