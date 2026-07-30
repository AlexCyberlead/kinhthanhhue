import { useEffect, useMemo, type JSX } from 'react'
import {
  buildPropsGroup,
  DEFAULT_PROP_PLACEMENTS,
  type PropPlacement,
} from './buildPropsGroup'
import type { PropLod } from './geometries'

export type PropsSystemProps = {
  lod?: PropLod
  placements?: PropPlacement[]
  disabled?: boolean
}

/**
 * Optional R3F mount — ceremonial lọng / cờ / kiệu.
 * C4 có thể bỏ qua và gọi `buildPropsGroup` thủ công.
 */
export function PropsSystem({
  lod = 1,
  placements = DEFAULT_PROP_PLACEMENTS,
  disabled = false,
}: PropsSystemProps): JSX.Element | null {
  const group = useMemo(() => {
    if (disabled) return null
    return buildPropsGroup(lod, placements)
  }, [lod, placements, disabled])

  useEffect(() => {
    if (!group) return
    return () => {
      const disposeMats = group.userData.disposeMaterials as (() => void) | undefined
      disposeMats?.()
      // Geometries live in shared cache — do not dispose here.
    }
  }, [group])

  if (!group) return null
  return <primitive object={group} />
}
