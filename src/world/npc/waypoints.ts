import { WORLD } from '../../data/worldConfig'
import type { WaypointNode } from './types'

type RawNode = {
  id: string
  x: number
  z: number
  zone: string
  links: string[]
}

/**
 * Waypoint graph quanh Ngọ Môn, sân Đại Triều, thần đạo, miếu.
 * Origin = Đại Triều Nghi; +Z = Nam (Ngọ Môn).
 */
const RAW: RawNode[] = [
  // —— Sân Đại Triều Nghi ——
  { id: 'dt_c', x: 0, z: 0, zone: 'wp_dai_trieu_nghi', links: ['dt_n', 'dt_s', 'dt_e', 'dt_w', 'td_0'] },
  { id: 'dt_n', x: 0, z: -28, zone: 'wp_dai_trieu_nghi', links: ['dt_c', 'dt_ne', 'dt_nw'] },
  { id: 'dt_s', x: 0, z: 28, zone: 'wp_dai_trieu_nghi', links: ['dt_c', 'td_0', 'dt_se', 'dt_sw'] },
  { id: 'dt_e', x: 32, z: 0, zone: 'wp_dai_trieu_nghi', links: ['dt_c', 'dt_ne', 'dt_se'] },
  { id: 'dt_w', x: -32, z: 0, zone: 'wp_dai_trieu_nghi', links: ['dt_c', 'dt_nw', 'dt_sw'] },
  { id: 'dt_ne', x: 28, z: -22, zone: 'wp_dai_trieu_nghi', links: ['dt_n', 'dt_e'] },
  { id: 'dt_nw', x: -28, z: -22, zone: 'wp_dai_trieu_nghi', links: ['dt_n', 'dt_w'] },
  { id: 'dt_se', x: 28, z: 22, zone: 'wp_dai_trieu_nghi', links: ['dt_s', 'dt_e'] },
  { id: 'dt_sw', x: -28, z: 22, zone: 'wp_dai_trieu_nghi', links: ['dt_s', 'dt_w'] },

  // —— Thần đạo (Đại Triều → Ngọ Môn) ——
  { id: 'td_0', x: 0, z: 40, zone: 'wp_than_dao', links: ['dt_s', 'td_1', 'td_e0', 'td_w0'] },
  { id: 'td_1', x: 0, z: 55, zone: 'wp_than_dao', links: ['td_0', 'td_2'] },
  { id: 'td_2', x: 0, z: 75, zone: 'wp_than_dao', links: ['td_1', 'td_3', 'td_e1', 'td_w1'] },
  { id: 'td_3', x: 0, z: 100, zone: 'wp_than_dao', links: ['td_2', 'nm_c'] },
  { id: 'td_e0', x: 18, z: 42, zone: 'wp_than_dao', links: ['td_0', 'td_e1'] },
  { id: 'td_w0', x: -18, z: 42, zone: 'wp_than_dao', links: ['td_0', 'td_w1'] },
  { id: 'td_e1', x: 18, z: 78, zone: 'wp_than_dao', links: ['td_2', 'td_e0', 'nm_e'] },
  { id: 'td_w1', x: -18, z: 78, zone: 'wp_than_dao', links: ['td_2', 'td_w0', 'nm_w'] },

  // —— Ngọ Môn ——
  {
    id: 'nm_c',
    x: WORLD.landmarks.ngoMon[0],
    z: 130,
    zone: 'wp_ngo_mon',
    links: ['td_3', 'nm_e', 'nm_w', 'nm_s', 'nm_n'],
  },
  { id: 'nm_n', x: 0, z: 118, zone: 'wp_ngo_mon', links: ['nm_c', 'td_3'] },
  { id: 'nm_s', x: 0, z: 155, zone: 'wp_ngo_mon', links: ['nm_c', 'nm_se', 'nm_sw', 'pho_0'] },
  { id: 'nm_e', x: 35, z: 130, zone: 'wp_ngo_mon', links: ['nm_c', 'td_e1', 'nm_se'] },
  { id: 'nm_w', x: -35, z: 130, zone: 'wp_ngo_mon', links: ['nm_c', 'td_w1', 'nm_sw'] },
  { id: 'nm_se', x: 30, z: 148, zone: 'wp_ngo_mon', links: ['nm_s', 'nm_e'] },
  { id: 'nm_sw', x: -30, z: 148, zone: 'wp_ngo_mon', links: ['nm_s', 'nm_w'] },

  // —— Phố ngoài (south of gate) ——
  { id: 'pho_0', x: 0, z: 175, zone: 'wp_pho_ngoai', links: ['nm_s', 'pho_e', 'pho_w'] },
  { id: 'pho_e', x: 40, z: 180, zone: 'wp_pho_ngoai', links: ['pho_0'] },
  { id: 'pho_w', x: -40, z: 180, zone: 'wp_pho_ngoai', links: ['pho_0'] },

  // —— Tử Cấm / nội (north of Thái Hòa) ——
  { id: 'tc_0', x: 0, z: -55, zone: 'wp_tu_cam', links: ['dt_n', 'tc_1', 'tc_e', 'tc_w'] },
  { id: 'tc_1', x: 0, z: -90, zone: 'wp_tu_cam', links: ['tc_0', 'tc_2'] },
  { id: 'tc_2', x: 0, z: -120, zone: 'wp_tu_cam', links: ['tc_1'] },
  { id: 'tc_e', x: 40, z: -70, zone: 'wp_tu_cam', links: ['tc_0', 'tp_0'] },
  { id: 'tc_w', x: -40, z: -70, zone: 'wp_tu_cam', links: ['tc_0', 'mieu_e'] },

  // —— Thiệu Phương (đông) ——
  { id: 'tp_0', x: 90, z: -80, zone: 'wp_thieu_phuong', links: ['tc_e', 'tp_1'] },
  { id: 'tp_1', x: 130, z: -100, zone: 'wp_thieu_phuong', links: ['tp_0', 'tp_2'] },
  { id: 'tp_2', x: 140, z: -140, zone: 'wp_thieu_phuong', links: ['tp_1'] },

  // —— Thế Tổ Miếu ——
  {
    id: 'mieu_c',
    x: WORLD.landmarks.theToMieu[0],
    z: WORLD.landmarks.theToMieu[2],
    zone: 'wp_mieu',
    links: ['mieu_e', 'mieu_n', 'mieu_s', 'mieu_w'],
  },
  { id: 'mieu_e', x: -90, z: -80, zone: 'wp_mieu', links: ['mieu_c', 'tc_w', 'mieu_s'] },
  { id: 'mieu_n', x: -120, z: -105, zone: 'wp_mieu', links: ['mieu_c', 'mieu_w'] },
  { id: 'mieu_s', x: -120, z: -55, zone: 'wp_mieu', links: ['mieu_c', 'mieu_e'] },
  { id: 'mieu_w', x: -150, z: -80, zone: 'wp_mieu', links: ['mieu_c', 'mieu_n'] },
]

function buildGraph(): WaypointNode[] {
  const indexById = new Map<string, number>()
  RAW.forEach((n, i) => indexById.set(n.id, i))

  return RAW.map((n) => ({
    id: n.id,
    x: n.x,
    z: n.z,
    zone: n.zone,
    edges: n.links
      .map((id) => indexById.get(id))
      .filter((i): i is number => i !== undefined),
  }))
}

export const WAYPOINT_GRAPH: WaypointNode[] = buildGraph()

export function nodesInZone(zone: string): number[] {
  const out: number[] = []
  for (let i = 0; i < WAYPOINT_GRAPH.length; i++) {
    if (WAYPOINT_GRAPH[i]!.zone === zone) out.push(i)
  }
  return out
}

export function pickZoneNode(zone: string, rng: () => number): number {
  const list = nodesInZone(zone)
  if (list.length === 0) return (rng() * WAYPOINT_GRAPH.length) | 0
  return list[(rng() * list.length) | 0]!
}
