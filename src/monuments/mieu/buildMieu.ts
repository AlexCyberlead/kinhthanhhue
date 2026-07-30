import * as THREE from 'three'
import type { MaterialId } from '../../core/materials/MaterialLibrary'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'
import { buildMieuCourtyard } from './courtyard'

export type BuildMieuOpts = {
  /** Roof tiers (trùng thiềm). */
  tiers: number
  /** Bay count along X (columns). */
  cols: number
  /** Bay count along Z (rows). Default 3. */
  rows?: number
  roofMaterial: MaterialId
  lod?: 0 | 1 | 2
  /** Hall footprint scale (default mid ancestral temple). */
  scale?: number
  /** Include sân + nghi môn. */
  courtyard?: boolean
  courtyardWidth?: number
  courtyardDepth?: number
  name?: string
}

/**
 * Shared ancestral-temple (miếu) builder — nền đá, cột son, mái lưu ly, sân + nghi môn.
 * LOD1 target: ≤15 draw calls for the whole group (hall + court).
 */
export function buildMieu(opts: BuildMieuOpts): THREE.Group {
  const {
    tiers,
    cols,
    rows = 3,
    roofMaterial,
    lod = 1,
    scale = 1,
    courtyard = true,
    courtyardWidth,
    courtyardDepth,
    name = 'mieu',
  } = opts

  const root = new THREE.Group()
  root.name = name

  const hallW = (cols === 5 ? 18 : cols === 4 ? 14.5 : 12) * scale
  const hallD = (rows === 4 ? 12 : 10) * scale
  const colH = (lod === 2 ? 3.8 : 5.2) * scale
  const platH = lod === 2 ? 0.9 : 1.15

  if (courtyard) {
    const cw = courtyardWidth ?? hallW * 2.1
    const cd = courtyardDepth ?? hallD * 2.4
    const court = buildMieuCourtyard({
      width: cw,
      depth: cd,
      lod,
      nghiMon: true,
    })
    // Court sits under / around hall; hall at origin
    root.add(court)
  }

  // —— Platform ——
  // LOD1: single deck (no steps/balustrade) to stay ≤15 draw calls with courtyard
  if (lod === 0) {
    root.add(
      buildPlatform({
        width: hallW * 1.2,
        depth: hallD * 1.25,
        height: platH,
        steps: 3,
        balustrade: true,
        lod,
      }),
    )
  } else {
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(hallW * 1.15, platH, hallD * 1.15),
      getMaterial('da_thanh', lod),
    )
    deck.position.y = platH / 2
    deck.receiveShadow = true
    deck.castShadow = true
    root.add(deck)
  }

  const floorY = platH

  // —— Hall body ——
  if (lod === 2) {
    const mass = new THREE.Mesh(
      new THREE.BoxGeometry(hallW * 0.95, colH, hallD * 0.9),
      getMaterial('tuong_voi', lod),
    )
    mass.position.y = floorY + colH / 2
    root.add(mass)

    const roof = buildRoof({
      width: hallW * 1.15,
      depth: hallD * 1.1,
      tiers: 1,
      tileMaterial: roofMaterial,
      lod,
    })
    roof.position.y = floorY + colH
    root.add(roof)
    return root
  }

  const plaster = getMaterial('tuong_voi', lod)
  const wallH = colH * 0.92
  const wallT = 0.4

  if (lod === 1) {
    // Single U-mass (1 call) — open south (+Z)
    const mass = new THREE.Mesh(
      new THREE.BoxGeometry(hallW * 0.95, wallH, hallD * 0.78),
      plaster,
    )
    mass.position.set(0, floorY + wallH / 2, -hallD * 0.08)
    mass.castShadow = true
    root.add(mass)
  } else {
    // LOD0: discrete rear + side walls
    const back = new THREE.Mesh(new THREE.BoxGeometry(hallW * 0.92, wallH, wallT), plaster)
    back.position.set(0, floorY + wallH / 2, -hallD * 0.42)
    back.castShadow = true
    root.add(back)
    for (const x of [-hallW * 0.44, hallW * 0.44]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, hallD * 0.78), plaster)
      side.position.set(x, floorY + wallH / 2, -hallD * 0.05)
      side.castShadow = true
      root.add(side)
    }
  }

  // Columns — InstancedMesh = 1 draw call
  const spacingX = (hallW * 0.82) / Math.max(1, cols - 1)
  const spacingZ = (hallD * 0.72) / Math.max(1, rows - 1)
  const columns = buildColumnGrid({
    rows,
    cols,
    spacing: [spacingX, spacingZ] as [number, number],
    height: colH,
    radius: 0.24 * scale,
    material: 'go_son_son',
    lod,
  })
  columns.position.y = floorY
  root.add(columns)

  // Entablature
  const wood = getMaterial('go_lim', lod)
  const beamY = floorY + colH
  if (lod === 0) {
    const longBeam = new THREE.Mesh(new THREE.BoxGeometry(hallW * 0.95, 0.28, 0.32), wood)
    for (const z of [-hallD * 0.38, hallD * 0.32]) {
      const b = longBeam.clone()
      b.position.set(0, beamY, z)
      root.add(b)
    }
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, hallD * 0.85), wood)
    const midCols = Math.min(cols, 5)
    for (let i = 0; i < midCols; i++) {
      const t = midCols === 1 ? 0.5 : i / (midCols - 1)
      const x = -hallW * 0.4 + t * hallW * 0.8
      const b = cross.clone()
      b.position.set(x, beamY, 0)
      root.add(b)
    }
    // Corner brackets
    for (const x of [-hallW * 0.4, hallW * 0.4]) {
      for (const z of [-hallD * 0.35, hallD * 0.28]) {
        const br = buildBracketSet({ width: 1.2, depth: 0.9, height: 0.7, layers: 2, lod })
        br.position.set(x, beamY - 0.05, z)
        root.add(br)
      }
    }
  } else {
    // LOD1: single plate
    const plate = new THREE.Mesh(new THREE.BoxGeometry(hallW * 0.98, 0.22, hallD * 0.9), wood)
    plate.position.y = beamY
    root.add(plate)
  }

  // Altar block (rear interior) — 1 call
  if (lod === 0) {
    const altar = new THREE.Mesh(
      new THREE.BoxGeometry(hallW * 0.35, 1.1, 0.9),
      getMaterial('go_son_son', lod),
    )
    altar.position.set(0, floorY + 0.55, -hallD * 0.28)
    root.add(altar)
  }

  // Roof
  const safeTiers = lod === 1 ? Math.min(tiers, 1) : Math.max(1, tiers)
  const roof = buildRoof({
    width: hallW * (lod === 0 ? 1.28 : 1.18),
    depth: hallD * (lod === 0 ? 1.22 : 1.12),
    tiers: safeTiers,
    tileMaterial: roofMaterial,
    ridgeOrnament: lod === 0 && roofMaterial === 'ngoi_hoang_luu_ly' ? 'dragon' : 'none',
    curvature: 0.9,
    lod,
  })
  roof.position.y = beamY + 0.12
  root.add(roof)

  return root
}

/** Count mesh draw calls under a subtree. */
export function countDrawCalls(root: THREE.Object3D): number {
  let n = 0
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) n += 1
  })
  return n
}
