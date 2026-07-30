import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'

export type CungComplexOpts = {
  name: string
  lod: 0 | 1 | 2
  /** Số gian mặt tiền (stylized). */
  bays: number
  mainWidth: number
  mainDepth: number
  wallH: number
  /** Cánh đông/tây — chiều rộng theo X. */
  wingWidth: number
  wingDepth: number
  columnRows: number
  columnCols: number
  /** Hư hại / partial — Điện Phụng Tiên. */
  ruin?: boolean
  ridgeOrnament?: 'dragon' | 'phoenix' | 'none'
}

/**
 * Cung/điện phức hợp nhiều gian — nền đá, tường vôi, cột InstancedMesh,
 * mái trùng thiềm ngói thanh lưu ly (cung Thái hậu / không trục dũng đạo).
 *
 * LOD1 budget: ≤ 25 draw calls
 *   platform lean + walls + 1 col InstancedMesh + deck/plate/door
 *   + main curved roof + 2 lean wing roofs (trùng thiềm full ở LOD0).
 */
export function buildCungComplex(opts: CungComplexOpts): THREE.Group {
  const {
    name,
    lod,
    bays,
    mainWidth,
    mainDepth,
    wallH,
    wingWidth,
    wingDepth,
    columnRows,
    columnCols,
    ruin = false,
    ridgeOrnament = 'phoenix',
  } = opts

  const root = new THREE.Group()
  root.name = name

  const plaster = getMaterial('tuong_voi', lod)
  const wood = getMaterial('go_lim', lod)
  const son = getMaterial('go_son_son', lod)
  const stone = getMaterial('da_thanh', lod)
  const brick = getMaterial('gach_bat_trang', lod)
  const tileMat = getMaterial('ngoi_thanh_luu_ly', lod)
  const tile = 'ngoi_thanh_luu_ly' as const

  // —— Platform ——
  const platW = mainWidth + wingWidth * 2 + (lod === 2 ? 4 : 8)
  const platD = Math.max(mainDepth, wingDepth) + (lod === 2 ? 4 : 10)
  const platH = lod === 2 ? 0.9 : 1.25
  const platform = buildPlatform({
    width: platW,
    depth: platD,
    height: platH,
    // LOD1: 1 step → deck+step = 2 dc (giữ ngân sách)
    steps: lod === 2 ? 1 : lod === 1 ? 1 : 4,
    balustrade: lod === 0 && !ruin,
    lod,
  })
  root.add(platform)
  const floorY = platH

  if (lod === 2) {
    const mass = new THREE.Mesh(
      new THREE.BoxGeometry(mainWidth * 0.95, wallH * 0.85, mainDepth * 0.9),
      plaster,
    )
    mass.position.y = floorY + wallH * 0.42
    root.add(mass)
    if (wingWidth > 0) {
      for (const sx of [-1, 1]) {
        const wing = new THREE.Mesh(
          new THREE.BoxGeometry(wingWidth * 0.85, wallH * 0.7, wingDepth * 0.8),
          plaster,
        )
        wing.position.set(
          sx * (mainWidth / 2 + wingWidth * 0.4),
          floorY + wallH * 0.35,
          -mainDepth * 0.05,
        )
        root.add(wing)
      }
    }
    const roof = buildRoof({
      width: mainWidth * 1.05,
      depth: mainDepth * 1.05,
      tiers: 1,
      tileMaterial: tile,
      lod,
    })
    roof.position.y = floorY + wallH * 0.85
    root.add(roof)
    return root
  }

  // —— Courtyard paving (LOD0 only — tiết kiệm 1 dc LOD1) ——
  if (lod === 0) {
    const court = new THREE.Mesh(
      new THREE.BoxGeometry(mainWidth * 0.55, 0.08, mainDepth * 0.35),
      brick,
    )
    court.position.set(0, floorY + 0.05, mainDepth * 0.42)
    court.receiveShadow = true
    root.add(court)
  }

  // —— Main hall walls (lime plaster) ——
  const wallT = lod === 0 ? 0.42 : 0.5
  const openW = Math.min(mainWidth * 0.22, 4.2)

  const sideGeo = new THREE.BoxGeometry(wallT, wallH, mainDepth)
  for (const x of [-mainWidth / 2 + wallT / 2, mainWidth / 2 - wallT / 2]) {
    const side = new THREE.Mesh(sideGeo, plaster)
    side.position.set(x, floorY + wallH / 2, 0)
    side.castShadow = true
    side.receiveShadow = true
    root.add(side)
  }

  const rear = new THREE.Mesh(new THREE.BoxGeometry(mainWidth, wallH, wallT), plaster)
  rear.position.set(0, floorY + wallH / 2, -mainDepth / 2 + wallT / 2)
  rear.castShadow = true
  root.add(rear)

  // Front breast walls flanking central gian
  const breastW = (mainWidth - openW) / 2 - 0.15
  const breastH = ruin ? wallH * 0.55 : wallH * 0.72
  const breastGeo = new THREE.BoxGeometry(breastW, breastH, wallT)
  for (const sx of [-1, 1]) {
    const breast = new THREE.Mesh(breastGeo, plaster)
    breast.position.set(
      sx * (openW / 2 + breastW / 2 + 0.05),
      floorY + breastH / 2,
      mainDepth / 2 - wallT / 2,
    )
    breast.castShadow = true
    root.add(breast)
  }

  // Door — single mesh LOD1; frame+leaf LOD0
  if (!ruin) {
    if (lod === 0) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(openW * 0.92, wallH * 0.78, 0.28), son)
      frame.position.set(0, floorY + wallH * 0.39, mainDepth / 2 - 0.18)
      root.add(frame)
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(openW * 0.78, wallH * 0.7, 0.1), wood)
      leaf.position.set(0, floorY + wallH * 0.36, mainDepth / 2 - 0.06)
      root.add(leaf)
    } else {
      const door = new THREE.Mesh(new THREE.BoxGeometry(openW * 0.85, wallH * 0.72, 0.22), son)
      door.position.set(0, floorY + wallH * 0.36, mainDepth / 2 - 0.12)
      root.add(door)
    }
  } else {
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(openW * 1.05, 0.35, 0.4), stone)
    lintel.position.set(0, floorY + breastH + 0.2, mainDepth / 2 - 0.15)
    root.add(lintel)
  }

  // —— Timber deck ——
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(mainWidth - wallT * 2.2, 0.16, mainDepth - wallT * 2.2),
    wood,
  )
  deck.position.y = floorY + 0.1
  deck.receiveShadow = true
  root.add(deck)

  // —— Column grid (InstancedMesh — 1 dc) ——
  const colH = wallH - 0.25
  const cols = buildColumnGrid({
    rows: columnRows,
    cols: columnCols,
    spacing: [
      (mainWidth - 2.4) / Math.max(1, columnCols - 1),
      (mainDepth - 2.2) / Math.max(1, columnRows - 1),
    ] as [number, number],
    height: colH,
    radius: lod === 0 ? 0.24 : 0.28,
    material: 'go_son_son',
    lod,
  })
  cols.position.y = floorY
  root.add(cols)

  // —— Entablature plate ——
  const beamY = floorY + colH
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(mainWidth * 0.98, 0.22, mainDepth * 0.98),
    wood,
  )
  plate.position.y = beamY
  root.add(plate)

  // —— Side wings ——
  if (wingWidth > 0.5) {
    const wingH = wallH * (ruin ? 0.55 : 0.88)
    for (const sx of [-1, 1] as const) {
      const wx = sx * (mainWidth / 2 + wingWidth / 2 - 0.15)
      const wz = -mainDepth * 0.08
      const wing = new THREE.Mesh(
        new THREE.BoxGeometry(wingWidth * 0.92, wingH, wingDepth * 0.9),
        plaster,
      )
      wing.position.set(wx, floorY + wingH / 2, wz)
      wing.castShadow = true
      wing.receiveShadow = true
      root.add(wing)

      if (lod === 0) {
        const wingRoof = buildRoof({
          width: wingWidth * 1.05,
          depth: wingDepth * 1.05,
          tiers: 1,
          tileMaterial: tile,
          ridgeOrnament: 'none',
          curvature: 0.78,
          lod,
        })
        wingRoof.position.set(wx, floorY + wingH, wz)
        if (ruin && sx === 1) {
          wingRoof.position.y -= 0.8
          wingRoof.rotation.z = 0.12
        }
        root.add(wingRoof)
      } else {
        // LOD1: 1 mesh / cánh (ngói thanh) — tránh 3 dc/buildRoof
        const lean = new THREE.Mesh(
          new THREE.ConeGeometry(
            Math.max(wingWidth, wingDepth) * 0.55,
            1.35,
            4,
          ),
          tileMat,
        )
        lean.rotation.y = Math.PI / 4
        lean.position.set(wx, floorY + wingH + 0.65, wz)
        lean.scale.set(wingWidth / wingDepth, 1, 1)
        lean.castShadow = true
        if (ruin && sx === 1) {
          lean.position.y -= 0.6
          lean.rotation.z = 0.1
        }
        root.add(lean)
      }
    }
  }

  // —— Trùng thiềm: lower wrap chỉ LOD0 (giống Phu Văn Lâu) ——
  if (lod === 0) {
    const lowerRoof = buildRoof({
      width: mainWidth * 1.18,
      depth: mainDepth * 1.18,
      tiers: 1,
      tileMaterial: tile,
      ridgeOrnament: 'none',
      curvature: 0.72,
      lod,
    })
    lowerRoof.position.y = beamY - 0.05
    if (ruin) {
      lowerRoof.position.y -= 0.35
      lowerRoof.rotation.x = 0.04
    }
    root.add(lowerRoof)
  }

  // Upper / main roof — curved kit (không box-only)
  const upperRoof = buildRoof({
    width: mainWidth * 0.98,
    depth: mainDepth * 0.98,
    tiers: lod === 0 && !ruin ? 2 : 1,
    tileMaterial: tile,
    ridgeOrnament: lod === 0 && !ruin ? ridgeOrnament : 'none',
    curvature: 0.88,
    lod,
  })
  upperRoof.position.y = beamY + (lod === 0 && !ruin ? 1.35 : 0.95)
  if (ruin) {
    upperRoof.position.x = 0.6
    upperRoof.rotation.z = -0.06
  }
  root.add(upperRoof)

  // —— LOD0 extras ——
  if (lod === 0) {
    for (const x of [-mainWidth * 0.38, mainWidth * 0.38]) {
      for (const z of [-mainDepth * 0.38, mainDepth * 0.38]) {
        const br = buildBracketSet({
          width: 1.5,
          depth: 1.0,
          height: 0.8,
          layers: 3,
          lod,
        })
        br.position.set(x, beamY - 0.05, z)
        root.add(br)
      }
    }

    const winCount = ruin ? 4 : 8
    const wins = new THREE.InstancedMesh(new THREE.BoxGeometry(1.35, 1.55, 0.18), wood, winCount)
    const dummy = new THREE.Object3D()
    let wi = 0
    const zFront = mainDepth / 2 - wallT - 0.05
    const zBack = -mainDepth / 2 + wallT + 0.05
    const xs = [-mainWidth * 0.28, -mainWidth * 0.12, mainWidth * 0.12, mainWidth * 0.28]
    for (const z of ruin ? [zFront] : [zFront, zBack]) {
      for (const x of xs) {
        if (wi >= winCount) break
        dummy.position.set(x, floorY + wallH * 0.52, z)
        dummy.updateMatrix()
        wins.setMatrixAt(wi++, dummy.matrix)
      }
    }
    wins.instanceMatrix.needsUpdate = true
    wins.castShadow = true
    root.add(wins)

    // Bay rhythm posts (gian markers) — InstancedMesh
    const bayPosts = Math.max(4, bays)
    const posts = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.12, 0.14, wallH * 0.65, 8),
      son,
      bayPosts,
    )
    let pi = 0
    for (let i = 0; i < bayPosts; i++) {
      const t = (i + 0.5) / bayPosts
      let x = -mainWidth / 2 + t * mainWidth
      if (Math.abs(x) < openW * 0.55) {
        x = (x >= 0 ? 1 : -1) * (openW * 0.55 + 0.4)
      }
      dummy.position.set(x, floorY + wallH * 0.32, mainDepth / 2 - wallT * 0.3)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      posts.setMatrixAt(pi++, dummy.matrix)
    }
    posts.instanceMatrix.needsUpdate = true
    posts.castShadow = true
    root.add(posts)

    if (ruin) {
      const rubble = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.55, 0.7), stone, 12)
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2
        dummy.position.set(
          Math.cos(a) * (mainWidth * 0.35 + (i % 3) * 0.8),
          floorY + 0.28,
          Math.sin(a) * (mainDepth * 0.3) + mainDepth * 0.15,
        )
        dummy.rotation.set(0.1 * (i % 3), a * 0.3, 0.08 * (i % 2))
        dummy.scale.setScalar(0.7 + (i % 4) * 0.15)
        dummy.updateMatrix()
        rubble.setMatrixAt(i, dummy.matrix)
      }
      rubble.instanceMatrix.needsUpdate = true
      rubble.castShadow = true
      root.add(rubble)
    }
  }

  return root
}
