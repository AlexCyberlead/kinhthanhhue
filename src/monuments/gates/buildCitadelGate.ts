import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildGate } from '../../core/geometry/kit/buildGate'

export type CitadelGateStyle = 'vom' | 'tam-quan'

export type CitadelGateBuildOpts = {
  lod: 0 | 1 | 2
  style?: CitadelGateStyle
  /** Chiều ngang thân cửa (m). */
  width?: number
  /** Chiều cao thân vòm (m) — Hội Điển ~8.5. */
  height?: number
}

/**
 * Cửa Kinh thành: thân vòm/tam quan (kit) + vọng lâu 2 tầng mái thanh lưu ly.
 * Số đo tham chiếu Hội Điển: cửa ~8.5 m, vọng lâu ~8.9 m → tổng ~17.4 m.
 */
export function buildCitadelGate(opts: CitadelGateBuildOpts): THREE.Group {
  const { lod, style = 'vom', width, height } = opts
  const group = new THREE.Group()
  group.name = `citadel-gate:${style}`

  const w = width ?? (style === 'tam-quan' ? 22 : 14)
  const h = height ?? 8.5

  const base = buildGate({ type: style, lod, width: w, height: h })
  stripKitRoof(base)
  group.add(base)

  // tam-quan: lintel ngồi trên pier → deck cao hơn một chút
  const deckY = style === 'tam-quan' ? h + 1.2 : h
  const pavilion = buildVongLau({
    lod,
    width: Math.min(w * (style === 'tam-quan' ? 0.7 : 0.9), 16),
    depth: style === 'tam-quan' ? 6.5 : 7.5,
  })
  pavilion.position.y = deckY
  group.add(pavilion)

  return group
}

/** Gỡ mái mặc định của buildGate (name === 'roof') để gắn vọng lâu. */
function stripKitRoof(gate: THREE.Group): void {
  const roofs = gate.children.filter((c) => c.name === 'roof')
  for (const r of roofs) gate.remove(r)
}

/**
 * Vọng lâu 2 tầng — cột InstancedMesh + sàn + mái thanh lưu ly.
 * LOD1 giữ draw-call thấp (platform + 1 InstancedMesh cột + floor + roof group).
 */
function buildVongLau(opts: {
  lod: 0 | 1 | 2
  width: number
  depth: number
}): THREE.Group {
  const { lod, width, depth } = opts
  const g = new THREE.Group()
  g.name = 'vong-lau'

  const deckH = lod === 2 ? 0.6 : 0.85
  // LOD1: steps=1, no balustrade → giữ ≤12 draw calls / cửa
  const platform = buildPlatform({
    width: width * 1.05,
    depth: depth * 1.05,
    steps: lod === 0 ? 2 : 1,
    balustrade: lod === 0,
    height: deckH,
    lod,
  })
  g.add(platform)

  const colH = lod === 2 ? 4.2 : 5.2
  if (lod < 2) {
    const cols = buildColumnGrid({
      rows: 2,
      cols: lod === 0 ? 4 : 3,
      spacing: [width / (lod === 0 ? 3.2 : 2.4), depth * 0.55],
      height: colH,
      radius: 0.22,
      material: 'go_son_son',
      lod,
    })
    cols.position.y = deckH
    g.add(cols)

    // sàn chỉ LOD0 — tiết kiệm 1 draw call ở LOD1
    if (lod === 0) {
      const floor = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.92, 0.18, depth * 0.85),
        getMaterial('go_lim', lod),
      )
      floor.position.y = deckH + colH
      floor.castShadow = true
      g.add(floor)
    }
  } else {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.7, colH, depth * 0.55),
      getMaterial('go_son_son', lod),
    )
    body.position.y = deckH + colH / 2
    g.add(body)
  }

  // 2 tầng chỉ LOD0; LOD1/2 = 1 tầng để ngân sách draw call
  const roof = buildRoof({
    width: width * 1.15,
    depth: depth * 1.2,
    tiers: lod === 0 ? 2 : 1,
    tileMaterial: 'ngoi_thanh_luu_ly',
    ridgeOrnament: lod === 0 ? 'dragon' : 'none',
    lod,
  })
  roof.position.y = deckH + colH + (lod === 2 ? 0.1 : 0.2)
  g.add(roof)

  return g
}
