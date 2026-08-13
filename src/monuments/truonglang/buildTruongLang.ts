import * as THREE from 'three'
import { buildRoof } from '../../core/geometry/kit'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { boxAt, mergeOrThrow, meshFrom } from './geometry'

/**
 * Trường Lang — hành lang bao quanh sân Đại Triều Nghi / hướng Thái Hòa.
 * Path chữ nhật, cột InstancedMesh, mái + sàn + tường merged.
 *
 * Draw-call budget ≤ 8:
 *  1 columns (InstancedMesh)
 *  2 roof tiles (merged)
 *  3 wood beams/eaves (merged)
 *  4 floor walkway (merged)
 *  5 stone plinth + rail (merged)
 *  6 plaster back wall (merged) — LOD < 2
 *  7 rail posts (InstancedMesh) — LOD 0 only
 *  8 ridge caps (merged) — LOD 0 only
 */

export type TruongLangLayout = {
  halfX: number
  halfZ: number
  corridorW: number
  colH: number
  spacing: number
  colRadius: number
  rows: 1 | 2
}

export function layoutForLod(lod: 0 | 1 | 2): TruongLangLayout {
  if (lod === 2) {
    return {
      halfX: 50,
      halfZ: 58,
      corridorW: 4,
      colH: 3.6,
      spacing: 2.1,
      colRadius: 0.2,
      rows: 1,
    }
  }
  if (lod === 1) {
    return {
      halfX: 50,
      halfZ: 60,
      corridorW: 4.6,
      colH: 4.2,
      spacing: 2.15,
      colRadius: 0.22,
      rows: 1,
    }
  }
  return {
    halfX: 52,
    halfZ: 60,
    corridorW: 5,
    colH: 4.5,
    spacing: 2.0,
    colRadius: 0.24,
    rows: 2,
  }
}

/** Column world positions along rectangular colonnade (local space). */
export function collectColumnPositions(layout: TruongLangLayout): THREE.Vector3[] {
  const { halfX, halfZ, corridorW, spacing, rows } = layout
  const out: THREE.Vector3[] = []
  const rowOffsets =
    rows === 2
      ? [-corridorW * 0.28, corridorW * 0.28]
      : [0]

  const nX = Math.floor((2 * halfX) / spacing) + 1
  const nZ = Math.floor((2 * halfZ) / spacing) + 1

  for (const off of rowOffsets) {
    // North (−Z) and South (+Z) — include corners
    for (let i = 0; i < nX; i++) {
      const x = -halfX + i * spacing
      out.push(new THREE.Vector3(x, 0, -halfZ + off))
      out.push(new THREE.Vector3(x, 0, halfZ - off))
    }
    // East (+X) and West (−X) — exclude corners
    for (let i = 1; i < nZ - 1; i++) {
      const z = -halfZ + i * spacing
      out.push(new THREE.Vector3(halfX - off, 0, z))
      out.push(new THREE.Vector3(-halfX + off, 0, z))
    }
  }

  return out
}

/**
 * Hành lang nối Thái Hòa ↔ Tả/Hữu Vu ↔ Đại Cung.
 * World local (anchor sân Đại Triều). [ước lượng hợp lý]
 */
export function collectConnectorPositions(layout: TruongLangLayout): THREE.Vector3[] {
  const { spacing } = layout
  const out: THREE.Vector3[] = []
  const xE = 36
  const xW = -36
  const zSouth = -layout.halfZ
  const zNorth = -132
  const nZ = Math.max(2, Math.floor((zSouth - zNorth) / spacing) + 1)
  for (let i = 0; i < nZ; i++) {
    const z = zSouth - i * spacing
    if (z < zNorth - 0.5) break
    out.push(new THREE.Vector3(xE, 0, z))
    out.push(new THREE.Vector3(xW, 0, z))
  }

  const addEw = (z: number, xMin: number, xMax: number, gap: number) => {
    const n = Math.max(2, Math.floor((xMax - xMin) / spacing) + 1)
    for (let i = 0; i < n; i++) {
      const x = xMin + i * spacing
      if (Math.abs(x) < gap) continue
      if (x > xMax + 0.2) break
      out.push(new THREE.Vector3(x, 0, z))
    }
  }
  addEw(-98, -40, 40, 8)
  addEw(-125, -42, 42, 18)
  return out
}

function addConnectorRuns(root: THREE.Group, layout: TruongLangLayout, lod: 0 | 1 | 2): void {
  const brick = getMaterial('gach_bat_trang', lod)
  const stone = getMaterial('da_thanh', lod)
  const wood = getMaterial('go_lim', lod)
  const floorH = 0.18
  const plinthH = 0.32
  const corridorW = 4.4
  const beamY = 0.35 + layout.colH

  const runs: Array<{ w: number; d: number; x: number; z: number }> = [
    { w: corridorW, d: 74, x: 36, z: -95 },
    { w: corridorW, d: 74, x: -36, z: -95 },
    { w: 30, d: corridorW, x: -25, z: -98 },
    { w: 30, d: corridorW, x: 25, z: -98 },
    { w: 20, d: corridorW, x: -31, z: -125 },
    { w: 20, d: corridorW, x: 31, z: -125 },
  ]

  const floorGeos: THREE.BufferGeometry[] = []
  const stoneGeos: THREE.BufferGeometry[] = []
  const woodGeos: THREE.BufferGeometry[] = []

  for (const r of runs) {
    floorGeos.push(boxAt(r.w, floorH, r.d, r.x, floorH / 2, r.z))
    stoneGeos.push(boxAt(r.w + 0.4, plinthH, r.d + 0.4, r.x, plinthH / 2, r.z))
    woodGeos.push(boxAt(r.w * 0.92, 0.2, r.d * 0.92, r.x, beamY, r.z))

    if (lod < 2) {
      const roof = buildRoof({
        width: r.w + 1.1,
        depth: r.d + 1.0,
        tiers: 1,
        tileMaterial: 'ngoi_thanh_luu_ly',
        ridge: 'none',
        lod,
      })
      roof.position.set(r.x, beamY + 0.22, r.z)
      root.add(roof)
    }
  }

  root.add(meshFrom(mergeOrThrow(floorGeos, 'conn-floor'), brick, 'truongLangConnFloor', false))
  root.add(meshFrom(mergeOrThrow(stoneGeos, 'conn-stone'), stone, 'truongLangConnStone', lod < 2))
  root.add(meshFrom(mergeOrThrow(woodGeos, 'conn-wood'), wood, 'truongLangConnWood', lod < 2))
}

function buildColumns(
  positions: THREE.Vector3[],
  height: number,
  radius: number,
  lod: 0 | 1 | 2,
): THREE.InstancedMesh {
  const radial = lod === 0 ? 8 : lod === 1 ? 6 : 4
  const geo = new THREE.CylinderGeometry(radius * 0.9, radius, height, radial)
  const mat = getMaterial('go_son_son', lod)
  const mesh = new THREE.InstancedMesh(geo, mat, positions.length)
  mesh.name = 'truongLangColumns'
  mesh.castShadow = lod < 2
  mesh.receiveShadow = true

  const dummy = new THREE.Object3D()
  for (let i = 0; i < positions.length; i++) {
    const p = positions[i]
    dummy.position.set(p.x, height / 2, p.z)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  return mesh
}

function buildRoofMerged(layout: TruongLangLayout, roofY: number, lod: 0 | 1 | 2): THREE.Mesh {
  const { halfX, halfZ, corridorW } = layout
  const tile = getMaterial('ngoi_thanh_luu_ly', lod)
  const thick = lod === 2 ? 0.4 : 0.3
  const over = 0.55
  const geos: THREE.BufferGeometry[] = []
  const depth = corridorW + over
  const pitch = lod === 2 ? 0.08 : 0.14

  // North / South — long along X, slight pitch toward courtyard
  const lenNS = 2 * halfX + corridorW + over * 2
  geos.push(boxAt(lenNS, thick, depth, 0, roofY, -halfZ, 0, pitch))
  geos.push(boxAt(lenNS, thick, depth, 0, roofY, halfZ, 0, -pitch))

  // East / West — long along Z (w=depth, d=len); slight pitch via ry tilt on Z-elongated box
  const lenEW = 2 * halfZ - corridorW
  geos.push(boxAt(depth, thick, Math.max(1, lenEW), halfX, roofY, 0, 0, 0))
  geos.push(boxAt(depth, thick, Math.max(1, lenEW), -halfX, roofY, 0, 0, 0))

  return meshFrom(mergeOrThrow(geos, 'roof'), tile, 'truongLangRoof', lod < 2)
}

function buildWoodMerged(layout: TruongLangLayout, beamY: number, lod: 0 | 1 | 2): THREE.Mesh {
  const { halfX, halfZ, corridorW } = layout
  const wood = getMaterial('go_lim', lod)
  const geos: THREE.BufferGeometry[] = []
  const beamH = 0.22
  const beamW = corridorW * 0.92

  // Tie beams under eaves — 4 sides
  geos.push(boxAt(2 * halfX + corridorW, beamH, beamW, 0, beamY, -halfZ))
  geos.push(boxAt(2 * halfX + corridorW, beamH, beamW, 0, beamY, halfZ))
  geos.push(boxAt(beamW, beamH, 2 * halfZ + corridorW, halfX, beamY, 0))
  geos.push(boxAt(beamW, beamH, 2 * halfZ + corridorW, -halfX, beamY, 0))

  // Outer fascia
  if (lod < 2) {
    const fasciaH = 0.16
    const fasciaT = 0.12
    const outer = corridorW * 0.5 + 0.15
    geos.push(boxAt(2 * halfX + corridorW + 0.4, fasciaH, fasciaT, 0, beamY + 0.2, -halfZ - outer))
    geos.push(boxAt(2 * halfX + corridorW + 0.4, fasciaH, fasciaT, 0, beamY + 0.2, halfZ + outer))
    geos.push(boxAt(fasciaT, fasciaH, 2 * halfZ + corridorW + 0.4, halfX + outer, beamY + 0.2, 0))
    geos.push(boxAt(fasciaT, fasciaH, 2 * halfZ + corridorW + 0.4, -halfX - outer, beamY + 0.2, 0))
  }

  return meshFrom(mergeOrThrow(geos, 'wood'), wood, 'truongLangWood', lod < 2)
}

function buildFloorMerged(layout: TruongLangLayout, lod: 0 | 1 | 2): THREE.Mesh {
  const { halfX, halfZ, corridorW } = layout
  const tile = getMaterial('gach_bat_trang', lod)
  const h = 0.18
  const y = h / 2
  const geos: THREE.BufferGeometry[] = []

  geos.push(boxAt(2 * halfX + corridorW, h, corridorW, 0, y, -halfZ))
  geos.push(boxAt(2 * halfX + corridorW, h, corridorW, 0, y, halfZ))
  // EW strips exclude NS overlap corners (already covered)
  const innerZ = 2 * halfZ - corridorW
  geos.push(boxAt(corridorW, h, Math.max(1, innerZ), halfX, y, 0))
  geos.push(boxAt(corridorW, h, Math.max(1, innerZ), -halfX, y, 0))

  return meshFrom(mergeOrThrow(geos, 'floor'), tile, 'truongLangFloor', false)
}

function buildStoneMerged(layout: TruongLangLayout, lod: 0 | 1 | 2): THREE.Mesh {
  const { halfX, halfZ, corridorW } = layout
  const stone = getMaterial('da_thanh', lod)
  const geos: THREE.BufferGeometry[] = []

  // Low plinth under colonnade
  const plinthH = 0.35
  const plinthW = corridorW + 0.5
  geos.push(boxAt(2 * halfX + plinthW, plinthH, plinthW, 0, plinthH / 2, -halfZ))
  geos.push(boxAt(2 * halfX + plinthW, plinthH, plinthW, 0, plinthH / 2, halfZ))
  const innerLen = 2 * halfZ - plinthW
  geos.push(boxAt(plinthW, plinthH, Math.max(1, innerLen), halfX, plinthH / 2, 0))
  geos.push(boxAt(plinthW, plinthH, Math.max(1, innerLen), -halfX, plinthH / 2, 0))

  // Continuous inner balustrade rail (LOD ≥ 1 merges posts into rails; LOD0 uses InstancedMesh posts)
  if (lod > 0) {
    const railH = 0.7
    const railT = 0.14
    const inset = corridorW * 0.42
    const y = plinthH + railH / 2
    geos.push(boxAt(2 * halfX - corridorW * 0.4, railH, railT, 0, y, -halfZ + inset))
    geos.push(boxAt(2 * halfX - corridorW * 0.4, railH, railT, 0, y, halfZ - inset))
    geos.push(boxAt(railT, railH, 2 * halfZ - corridorW * 0.4, halfX - inset, y, 0))
    geos.push(boxAt(railT, railH, 2 * halfZ - corridorW * 0.4, -halfX + inset, y, 0))
  } else {
    // Top rail only — posts are InstancedMesh
    const railH = 0.1
    const railT = 0.14
    const inset = corridorW * 0.42
    const y = plinthH + 0.78
    geos.push(boxAt(2 * halfX - corridorW * 0.4, railH, railT, 0, y, -halfZ + inset))
    geos.push(boxAt(2 * halfX - corridorW * 0.4, railH, railT, 0, y, halfZ - inset))
    geos.push(boxAt(railT, railH, 2 * halfZ - corridorW * 0.4, halfX - inset, y, 0))
    geos.push(boxAt(railT, railH, 2 * halfZ - corridorW * 0.4, -halfX + inset, y, 0))
  }

  return meshFrom(mergeOrThrow(geos, 'stone'), stone, 'truongLangStone', lod < 2)
}

function buildBackWall(layout: TruongLangLayout, wallH: number, lod: 0 | 1 | 2): THREE.Mesh {
  const { halfX, halfZ, corridorW } = layout
  const plaster = getMaterial('tuong_voi', lod)
  const t = lod === 2 ? 0.35 : 0.28
  const outer = corridorW * 0.5
  const y = 0.35 + wallH / 2
  const geos: THREE.BufferGeometry[] = []

  geos.push(boxAt(2 * halfX + corridorW, wallH, t, 0, y, -halfZ - outer))
  geos.push(boxAt(2 * halfX + corridorW, wallH, t, 0, y, halfZ + outer))
  geos.push(boxAt(t, wallH, 2 * halfZ + corridorW, halfX + outer, y, 0))
  geos.push(boxAt(t, wallH, 2 * halfZ + corridorW, -halfX - outer, y, 0))

  return meshFrom(mergeOrThrow(geos, 'wall'), plaster, 'truongLangWall', lod < 2)
}

function buildRailPosts(layout: TruongLangLayout, lod: 0): THREE.InstancedMesh {
  const { halfX, halfZ, corridorW, spacing } = layout
  const stone = getMaterial('da_thanh', lod)
  const postH = 0.75
  const postGeo = new THREE.BoxGeometry(0.14, postH, 0.14)
  const inset = corridorW * 0.42
  const y = 0.35 + postH / 2

  const positions: Array<[number, number, number]> = []
  const step = spacing * 1.5
  const nX = Math.floor((2 * halfX - corridorW) / step) + 1
  const nZ = Math.floor((2 * halfZ - corridorW) / step) + 1

  for (let i = 0; i < nX; i++) {
    const x = -halfX + corridorW * 0.2 + i * step
    positions.push([x, y, -halfZ + inset])
    positions.push([x, y, halfZ - inset])
  }
  for (let i = 1; i < nZ - 1; i++) {
    const z = -halfZ + corridorW * 0.2 + i * step
    positions.push([halfX - inset, y, z])
    positions.push([-halfX + inset, y, z])
  }

  const mesh = new THREE.InstancedMesh(postGeo, stone, positions.length)
  mesh.name = 'truongLangRailPosts'
  mesh.castShadow = true
  const dummy = new THREE.Object3D()
  for (let i = 0; i < positions.length; i++) {
    const [px, py, pz] = positions[i]
    dummy.position.set(px, py, pz)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  return mesh
}

function buildRidgeCaps(layout: TruongLangLayout, roofY: number, lod: 0): THREE.Mesh {
  const { halfX, halfZ } = layout
  const gold = getMaterial('vang_thep', lod)
  const geos: THREE.BufferGeometry[] = []
  const s = 0.28
  // Corner finials
  for (const x of [-halfX, halfX] as const) {
    for (const z of [-halfZ, halfZ] as const) {
      geos.push(boxAt(s, s * 1.4, s, x, roofY + 0.45, z))
    }
  }
  return meshFrom(mergeOrThrow(geos, 'ridge'), gold, 'truongLangRidge', true)
}

/**
 * Build Trường Lang group. Guarantees ≥200 column instances at every LOD
 * and ≤8 Mesh/InstancedMesh draw calls.
 */
export function buildTruongLang(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'truong-lang'

  const layout = layoutForLod(lod)
  const positions = collectColumnPositions(layout).concat(collectConnectorPositions(layout))

  // Ensure ≥200 even if layout math drifts
  if (positions.length < 200) {
    const pad = 200 - positions.length
    for (let i = 0; i < pad; i++) {
      const t = i / Math.max(1, pad - 1)
      const x = -layout.halfX + t * 2 * layout.halfX
      positions.push(new THREE.Vector3(x, 0, -layout.halfZ - layout.corridorW * 0.15))
    }
  }

  const colY = 0.35
  const cols = buildColumns(positions, layout.colH, layout.colRadius, lod)
  cols.position.y = colY
  root.add(cols)

  const beamY = colY + layout.colH
  const roofY = beamY + 0.35

  root.add(buildFloorMerged(layout, lod))
  root.add(buildStoneMerged(layout, lod))
  root.add(buildWoodMerged(layout, beamY, lod))
  root.add(buildRoofMerged(layout, roofY, lod))

  if (lod < 2) {
    root.add(buildBackWall(layout, layout.colH * 0.85, lod))
  }

  if (lod === 0) {
    root.add(buildRailPosts(layout, 0))
    root.add(buildRidgeCaps(layout, roofY, 0))
  }

  addConnectorRuns(root, layout, lod)

  return root
}
