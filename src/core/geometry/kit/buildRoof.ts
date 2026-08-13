import * as THREE from 'three'
import { getMaterial, type MaterialId } from '../../materials/MaterialLibrary'
import { uvRepeat } from './uvMeters'
import { buildRoofBody } from './roof/body'
import { buildCoDiem } from './roof/coDiem'
import { buildEaveGroup } from './roof/eaves'
import { makeFrame } from './roof/math'
import { meshOf } from './roof/merge'
import { buildRidgeOrnaments } from './roof/ornaments'
import { buildDaoTips, buildRidgeGeo } from './roof/ridges'
import { resolveRidge, type RoofOpts } from './roof/types'
import { buildLinkedValley } from './roof/valley'

export type { RidgeKind, RoofOpts } from './roof/types'

function tileRepeat(id: MaterialId): { u: number; v: number } {
  if (id === 'ngoi_thanh_luu_ly') return uvRepeat('ngoiMenXanh')
  if (id === 'mai_ngoi_am_duong') return uvRepeat('ngoiAmDuong')
  return uvRepeat('ngoiMenVang')
}

/**
 * Kit mái v2 — mái tứ thủy cong, sống nóc/góc, diềm, cổ diêm, con giống.
 * Giữ RoofOpts cũ; field mới đều optional.
 */
export function buildRoof(opts: RoofOpts): THREE.Group {
  const {
    width,
    depth,
    tiers,
    curvature = 0.85,
    tileMaterial = 'ngoi_hoang_luu_ly',
    lod = 0,
    tileScale = 1,
    linkedValley = false,
  } = opts

  const group = new THREE.Group()
  group.name = 'roof'
  const mat = getMaterial(tileMaterial, lod)
  const gold = getMaterial('vang_thep', lod)
  const tile = tileRepeat(tileMaterial)
  const safeTiers = Math.max(1, Math.min(4, Math.floor(tiers)))
  const ridgeKind = resolveRidge(opts)
  const useCoDiem = opts.coDiem ?? safeTiers > 1

  let topFrame: ReturnType<typeof makeFrame> | null = null
  let baseFrame: ReturnType<typeof makeFrame> | null = null

  for (let t = 0; t < safeTiers; t++) {
    const scale = 1 - t * 0.14
    const w = width * scale
    const d = depth * scale
    const yBase = t * (lod === 2 ? 1.2 : 1.55)
    const rise = lod === 2 ? 1.0 : 1.6 + (1 - scale) * 0.4
    const f = makeFrame(w, d, rise, curvature, tileScale, lod)
    topFrame = f
    if (t === 0) baseFrame = f

    if (useCoDiem && t > 0 && lod < 2) {
      const prev = 1 - (t - 1) * 0.14
      const bandW = width * (prev + scale) * 0.5
      const bandD = depth * (prev + scale) * 0.5
      const band = buildCoDiem({ width: bandW, depth: bandD, y: yBase - 0.06, lod })
      if (band) group.add(band)
    }

    const tier = new THREE.Group()
    tier.name = `roof-tier-${t}`
    tier.position.y = yBase

    const body = meshOf(buildRoofBody(f, tile.u, tile.v), mat, 'roof-body')
    if (body) tier.add(body)

    if (lod < 2 || t === safeTiers - 1) {
      const ridges = meshOf(buildRidgeGeo(f), gold, 'roof-ridges')
      if (ridges) tier.add(ridges)
    }

    const tips = meshOf(buildDaoTips(f), gold, 'roof-dao', true)
    if (tips) tier.add(tips)

    const eave = buildEaveGroup(f, lod)
    if (eave) tier.add(eave)

    group.add(tier)
  }

  if (useCoDiem && safeTiers === 1 && lod < 2) {
    const band = buildCoDiem({
      width: width * 0.92,
      depth: depth * 0.92,
      y: 0.08,
      lod,
    })
    if (band) group.add(band)
  }

  if (topFrame && ridgeKind !== 'none' && lod < 2) {
    const ornaments = buildRidgeOrnaments(topFrame, ridgeKind)
    if (ornaments) {
      ornaments.position.y = (safeTiers - 1) * (lod === 2 ? 1.2 : 1.55)
      group.add(ornaments)
    }
  }

  if (linkedValley && baseFrame) {
    const valley = buildLinkedValley(baseFrame)
    if (valley) group.add(valley)
  }

  return group
}
