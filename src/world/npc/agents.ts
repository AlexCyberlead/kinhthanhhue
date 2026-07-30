import * as THREE from 'three'
import { NPC_TYPES, NPC_TYPE_ORDER, SPAWN_WEIGHTS } from './npcDefs'
import { resolveCostume, resolveCostumeRect } from './costumeResolve'
import { pickZoneNode, WAYPOINT_GRAPH } from './waypoints'
import type { NpcAgent, NpcAnimState, NpcCostumeId } from './types'

function createRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 4294967296
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const c = new THREE.Color(hex)
  return [c.r, c.g, c.b]
}

function weightedPick(rng: () => number): NpcCostumeId {
  let total = 0
  for (const id of NPC_TYPE_ORDER) total += SPAWN_WEIGHTS[id]
  let r = rng() * total
  for (const id of NPC_TYPE_ORDER) {
    r -= SPAWN_WEIGHTS[id]
    if (r <= 0) return id
  }
  return 'npc_tourist'
}

function pickNeighbor(nodeIdx: number, avoid: number, rng: () => number): number {
  const node = WAYPOINT_GRAPH[nodeIdx]!
  const edges = node.edges.filter((e) => e !== avoid)
  const pool = edges.length > 0 ? edges : node.edges
  if (pool.length === 0) return nodeIdx
  return pool[(rng() * pool.length) | 0]!
}

function dist2(ax: number, az: number, bx: number, bz: number): number {
  const dx = bx - ax
  const dz = bz - az
  return Math.sqrt(dx * dx + dz * dz)
}

export function spawnAgents(count: number, seed = 0x4e5043): NpcAgent[] {
  const rng = createRng(seed ^ (count * 2654435761))
  const agents: NpcAgent[] = []

  for (let i = 0; i < count; i++) {
    const typeId = weightedPick(rng)
    const def = NPC_TYPES[typeId]
    const costume = resolveCostume(typeId)
    const rect = resolveCostumeRect(typeId)
    const zone = def.zones[(rng() * def.zones.length) | 0]!
    const from = pickZoneNode(zone, rng)
    const to = pickNeighbor(from, -1, rng)
    const fromN = WAYPOINT_GRAPH[from]!
    const toN = WAYPOINT_GRAPH[to]!
    const progress = rng()
    const x = fromN.x + (toN.x - fromN.x) * progress
    const z = fromN.z + (toN.z - fromN.z) * progress
    const rotY = Math.atan2(toN.x - fromN.x, toN.z - fromN.z)

    const startAnim: NpcAnimState = rng() < 0.18 ? 'idle' : 'walk'

    agents.push({
      typeId,
      from,
      to,
      progress,
      anim: startAnim,
      animT: rng() * 2,
      phase: rng() * Math.PI * 2,
      x,
      z,
      rotY,
      scale: def.scale * (0.94 + rng() * 0.12),
      speed: def.walkSpeed * (0.85 + rng() * 0.3),
      primary: hexToRgb(costume.primary),
      secondary: hexToRgb(costume.secondary),
      accent: hexToRgb(costume.accent),
      skin: hexToRgb(costume.skin ?? '#E8C4A8'),
      hat: hexToRgb(costume.hat ?? costume.accent),
      hasHat: def.hasHat || typeId === 'npc_non_la' ? 1 : 0,
      atlasRect: [rect.u, rect.v, rect.w, rect.h],
    })
  }

  return agents
}

/**
 * Advance pathfollow + anim state machine.
 * Returns true if any agent moved (always true while walking).
 */
export function tickAgents(agents: NpcAgent[], dt: number, rngTick: number): void {
  const rng = createRng((rngTick * 1000) | 0)

  for (let i = 0; i < agents.length; i++) {
    const a = agents[i]!
    a.animT += dt

    if (a.anim === 'bow') {
      if (a.animT >= 1.7) {
        a.anim = rng() < 0.35 ? 'idle' : 'walk'
        a.animT = 0
      }
      continue
    }

    if (a.anim === 'idle') {
      if (a.animT >= 1.2 + rng() * 2.5) {
        if (rng() < 0.22) {
          a.anim = 'bow'
          a.animT = 0
        } else {
          a.anim = 'walk'
          a.animT = 0
        }
      }
      continue
    }

    // walk
    const fromN = WAYPOINT_GRAPH[a.from]!
    const toN = WAYPOINT_GRAPH[a.to]!
    const len = Math.max(0.5, dist2(fromN.x, fromN.z, toN.x, toN.z))
    a.progress += (a.speed * dt) / len

    if (a.progress >= 1) {
      a.progress = 0
      const prev = a.from
      a.from = a.to
      a.to = pickNeighbor(a.from, prev, rng)

      // At node: chance idle / bow (more at miếu & đại triều)
      const zone = WAYPOINT_GRAPH[a.from]!.zone
      const bowBias = zone === 'wp_mieu' || zone === 'wp_dai_trieu_nghi' ? 0.28 : 0.08
      const idleBias = 0.12
      const roll = rng()
      if (roll < bowBias) {
        a.anim = 'bow'
        a.animT = 0
      } else if (roll < bowBias + idleBias) {
        a.anim = 'idle'
        a.animT = 0
      }
    }

    const t = Math.min(1, a.progress)
    const fx = WAYPOINT_GRAPH[a.from]!.x
    const fz = WAYPOINT_GRAPH[a.from]!.z
    const tx = WAYPOINT_GRAPH[a.to]!.x
    const tz = WAYPOINT_GRAPH[a.to]!.z
    a.x = fx + (tx - fx) * t
    a.z = fz + (tz - fz) * t
    if (a.anim === 'walk') {
      a.rotY = Math.atan2(tx - fx, tz - fz)
    }
  }
}

export function animStateCode(anim: NpcAnimState): number {
  if (anim === 'walk') return 1
  if (anim === 'bow') return 2
  return 0
}
