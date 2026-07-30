import type { JSX } from 'react'

/** Shared costume ids — C5 refines meshes/materials under `costumes/**`. */
export type NpcCostumeId =
  | 'npc_vua'
  | 'npc_quan_van'
  | 'npc_quan_vo'
  | 'npc_ve_binh'
  | 'npc_thai_giam'
  | 'npc_cung_nu'
  | 'npc_hau'
  | 'npc_tang_si'
  | 'npc_dan_ngu_than'
  | 'npc_non_la'
  | 'npc_tay_su'
  | 'npc_tourist'
  | 'npc_hoang_hau'
  | 'npc_nhac_cong'

/** Alias contract — string-compatible type id (= costume id for Wave C). */
export type NpcTypeId = NpcCostumeId | (string & {})

export type NpcAnimState = 'idle' | 'walk' | 'bow'

export type NpcCostumePalette = {
  id: NpcCostumeId
  /** Áo / primary garment */
  primary: string
  /** Quần / secondary */
  secondary: string
  /** Mũ / khăn / trim */
  accent: string
  /** Da / cổ */
  skin?: string
  /** Optional hat cone (nón lá, phốc đầu, …) */
  hat?: string
}

export type NpcTypeDef = {
  id: NpcCostumeId
  name: string
  height: number
  scale: number
  /** Preferred waypoint zone ids */
  zones: string[]
  walkSpeed: number
  hasHat: boolean
}

export type NpcSystemProps = {
  /** Instance count. Default 300. */
  count?: number
}

export type NpcSystemComponent = (props?: NpcSystemProps) => JSX.Element

export type WaypointNode = {
  id: string
  x: number
  z: number
  zone: string
  /** Neighbor node indices in the flat graph array */
  edges: number[]
}

export type NpcAgent = {
  typeId: NpcCostumeId
  from: number
  to: number
  /** 0..1 along current edge */
  progress: number
  anim: NpcAnimState
  /** Seconds in current anim (bow timer / idle linger) */
  animT: number
  phase: number
  x: number
  z: number
  rotY: number
  scale: number
  speed: number
  primary: [number, number, number]
  secondary: [number, number, number]
  accent: [number, number, number]
  skin: [number, number, number]
  hat: [number, number, number]
  hasHat: number
  /** Atlas cell UV (u, v, w, h) — identity if no atlas */
  atlasRect: [number, number, number, number]
}
