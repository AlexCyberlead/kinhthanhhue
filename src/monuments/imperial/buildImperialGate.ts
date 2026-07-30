import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildGate } from '../../core/geometry/kit/buildGate'

export type ImperialGateStyle = 'vom' | 'tam-quan'

export type ImperialGateBuildOpts = {
  lod: 0 | 1 | 2
  style?: ImperialGateStyle
  /** Chiều ngang thân cửa (m). */
  width?: number
  /** Chiều cao thân (m). */
  height?: number
}

/**
 * Cửa Hoàng thành (Hiển Nhơn / Chương Đức / Hòa Bình):
 * thân kit buildGate + vọng lâu mái thanh lưu ly.
 * LOD1 target ≤ 12 draw calls.
 */
export function buildImperialGate(opts: ImperialGateBuildOpts): THREE.Group {
  const { lod, style = 'vom', width, height } = opts
  const group = new THREE.Group()
  group.name = `imperial-gate:${style}`

  const w = width ?? (style === 'tam-quan' ? 18 : 14)
  const h = height ?? 7.5

  const base = buildGate({ type: style, lod, width: w, height: h })
  stripKitRoof(base)
  group.add(base)

  const deckY = style === 'tam-quan' ? h + 1.2 : h
  const pavilion = buildVongLau({
    lod,
    width: Math.min(w * (style === 'tam-quan' ? 0.72 : 0.88), 14),
    depth: style === 'tam-quan' ? 5.8 : 6.5,
  })
  pavilion.position.y = deckY
  group.add(pavilion)

  return group
}

function stripKitRoof(gate: THREE.Group): void {
  const roofs = gate.children.filter((c) => c.name === 'roof')
  for (const r of roofs) gate.remove(r)
}

/**
 * Vọng lâu — cột InstancedMesh + mái thanh lưu ly.
 * LOD1: platform(deck+1 step) + cols + roof(1 tier) ≈ 2+1+3 = 6 DC.
 * + kit base vom ≈ 2 → total ~8; tam-quan base ≈ 4 → total ~10.
 */
function buildVongLau(opts: {
  lod: 0 | 1 | 2
  width: number
  depth: number
}): THREE.Group {
  const { lod, width, depth } = opts
  const g = new THREE.Group()
  g.name = 'vong-lau'

  const deckH = lod === 2 ? 0.5 : 0.75
  const platform = buildPlatform({
    width: width * 1.04,
    depth: depth * 1.04,
    steps: lod === 0 ? 2 : 1,
    balustrade: lod === 0,
    height: deckH,
    lod,
  })
  g.add(platform)

  const colH = lod === 2 ? 3.8 : 4.8
  if (lod < 2) {
    const cols = buildColumnGrid({
      rows: 2,
      cols: lod === 0 ? 4 : 3,
      spacing: [width / (lod === 0 ? 3.2 : 2.4), depth * 0.52],
      height: colH,
      radius: 0.2,
      material: 'go_son_son',
      lod,
    })
    cols.position.y = deckH
    g.add(cols)

    if (lod === 0) {
      const floor = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.9, 0.16, depth * 0.82),
        getMaterial('go_lim', lod),
      )
      floor.position.y = deckH + colH
      floor.castShadow = true
      g.add(floor)
    }
  } else {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.65, colH, depth * 0.5),
      getMaterial('go_son_son', lod),
    )
    body.position.y = deckH + colH / 2
    g.add(body)
  }

  const roof = buildRoof({
    width: width * 1.12,
    depth: depth * 1.15,
    tiers: lod === 0 ? 2 : 1,
    tileMaterial: 'ngoi_thanh_luu_ly',
    ridgeOrnament: lod === 0 ? 'dragon' : 'none',
    lod,
  })
  roof.position.y = deckH + colH + (lod === 2 ? 0.08 : 0.15)
  g.add(roof)

  return g
}

/** Mesh count ≈ draw calls. */
export function countGateDrawCalls(group: THREE.Object3D): number {
  let n = 0
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) n += 1
  })
  return n
}
