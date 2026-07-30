import { useEffect, useMemo } from 'react'
import {
  buildTuCamWallGroup,
  disposeTuCamWallGroup,
} from './buildTuCamWalls'
import { TUCAM, type LodLevel } from './constants'

export type TuCamWallsProps = {
  lod?: LodLevel
}

/**
 * R3F wrapper — tường chu vi Tử Cấm Thành (~324×290.7 m).
 * Positions local wall group at geometric center [0, 0, -235].
 * Always restored (không đọc reconstructionMode).
 */
export function TuCamWalls({ lod = 1 }: TuCamWallsProps) {
  const group = useMemo(() => {
    const g = buildTuCamWallGroup(lod)
    g.position.set(TUCAM.centerX, 0, TUCAM.centerZ)
    return g
  }, [lod])

  useEffect(() => {
    return () => {
      disposeTuCamWallGroup(group)
    }
  }, [group])

  return <primitive object={group} />
}
