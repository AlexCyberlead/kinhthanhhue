export { NpcSystem } from './NpcSystem'
export type {
  NpcSystemProps,
  NpcTypeId,
  NpcCostumeId,
  NpcCostumePalette,
  NpcAnimState,
  NpcTypeDef,
  NpcAgent,
  WaypointNode,
} from './types'
export { NPC_TYPES, NPC_TYPE_ORDER, FALLBACK_COSTUMES, SPAWN_WEIGHTS } from './npcDefs'
export {
  resolveCostume,
  resolveAllCostumes,
  resolveCostumeRect,
  tryGetCostumeAtlasTexture,
  hasCostumeAtlas,
} from './costumeResolve'
export { WAYPOINT_GRAPH, nodesInZone, pickZoneNode } from './waypoints'
export { spawnAgents, tickAgents } from './agents'
export { createNpcGeometry, getNpcGeometry, disposeNpcGeometryCache } from './geometry'
export { createNpcMaterial } from './material'
