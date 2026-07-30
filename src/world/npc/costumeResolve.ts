import * as THREE from 'three'
import { FALLBACK_COSTUMES } from './npcDefs'
import type { NpcCostumeId, NpcCostumePalette } from './types'

type CostumeRect = { u: number; v: number; w: number; h: number }

type CostumeModule = {
  COSTUME_PALETTES?: Partial<Record<NpcCostumeId, Partial<NpcCostumePalette>>>
  COSTUME_RECTS?: Record<string, CostumeRect>
  getCostumeAtlasTexture?: () => THREE.Texture
  default?: Partial<Record<NpcCostumeId, Partial<NpcCostumePalette>>>
}

const mods = import.meta.glob<CostumeModule>('./costumes/**/*.{ts,tsx}', {
  eager: true,
})

/**
 * C5 owns `costumes/**`. Merge `COSTUME_PALETTES` over Wave C fallbacks when present.
 */
function loadCostumeOverlays(): Partial<
  Record<NpcCostumeId, Partial<NpcCostumePalette>>
> {
  const merged: Partial<Record<NpcCostumeId, Partial<NpcCostumePalette>>> = {}
  for (const mod of Object.values(mods)) {
    const table = mod.COSTUME_PALETTES ?? mod.default
    if (!table) continue
    for (const [id, partial] of Object.entries(table)) {
      const key = id as NpcCostumeId
      merged[key] = { ...merged[key], ...partial }
    }
  }
  return merged
}

const overlays = loadCostumeOverlays()

export function resolveCostume(id: NpcCostumeId): NpcCostumePalette {
  const base = FALLBACK_COSTUMES[id]
  const over = overlays[id]
  if (!over) return base
  return {
    ...base,
    ...over,
    id,
  }
}

export function resolveAllCostumes(): Record<NpcCostumeId, NpcCostumePalette> {
  const out = {} as Record<NpcCostumeId, NpcCostumePalette>
  for (const id of Object.keys(FALLBACK_COSTUMES) as NpcCostumeId[]) {
    out[id] = resolveCostume(id)
  }
  return out
}

/** Optional C5 atlas — null if costumes module chưa có / SSR. */
export function tryGetCostumeAtlasTexture(): THREE.Texture | null {
  for (const mod of Object.values(mods)) {
    if (typeof mod.getCostumeAtlasTexture === 'function') {
      try {
        return mod.getCostumeAtlasTexture()
      } catch {
        return null
      }
    }
  }
  return null
}

const FALLBACK_RECT: CostumeRect = { u: 0, v: 0, w: 1, h: 1 }

/** UV cell trong atlas; fallback full-quad nếu C5 chưa ship rects. */
export function resolveCostumeRect(id: NpcCostumeId): CostumeRect {
  for (const mod of Object.values(mods)) {
    const rect = mod.COSTUME_RECTS?.[id]
    if (rect) return rect
  }
  return FALLBACK_RECT
}

export function hasCostumeAtlas(): boolean {
  return tryGetCostumeAtlasTexture() !== null
}
