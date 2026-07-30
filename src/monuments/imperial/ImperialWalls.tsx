import { useEffect, useMemo } from 'react'
import {
  buildImperialWallGroup,
  disposeImperialWallGroup,
} from './buildImperialWalls'
import { IMPERIAL, type LodLevel } from './constants'

export type ImperialWallsProps = {
  lod?: LodLevel
}

/**
 * R3F wrapper — tường chu vi Hoàng Thành (~622×604 m).
 * Positions local wall group at geometric center [0, 0, -180].
 */
export function ImperialWalls({ lod = 1 }: ImperialWallsProps) {
  const group = useMemo(() => {
    const g = buildImperialWallGroup(lod)
    g.position.set(IMPERIAL.centerX, 0, IMPERIAL.centerZ)
    return g
  }, [lod])

  useEffect(() => {
    return () => {
      disposeImperialWallGroup(group)
    }
  }, [group])

  return <primitive object={group} />
}
