import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'
import { NGO_MON, buildColumnsAt, buildCompactRoof } from './geometry'

type RoofSpec = {
  x: number
  z: number
  w: number
  d: number
  /** true = hoàng lưu ly (mái vua giữa) */
  royal: boolean
  tiers: number
  ornament?: 'dragon' | 'phoenix' | 'none'
}

/**
 * 9 bộ mái Lầu Ngũ Phụng:
 * 5 chính trên trục Đông–Tây + 4 phụ góc.
 * Mái giữa hoàng lưu ly; 8 còn lại thanh lưu ly.
 */
function roofSpecs(lod: 0 | 1 | 2): RoofSpec[] {
  const s = lod === 2 ? 0.92 : 1
  return [
    // 5 chính (row along north bar, facing south)
    { x: 0, z: -1.2, w: 11 * s, d: 9 * s, royal: true, tiers: lod === 0 ? 2 : 1, ornament: 'dragon' },
    { x: -9.5, z: -1.0, w: 8 * s, d: 7.5 * s, royal: false, tiers: 1, ornament: 'phoenix' },
    { x: 9.5, z: -1.0, w: 8 * s, d: 7.5 * s, royal: false, tiers: 1, ornament: 'phoenix' },
    { x: -18.5, z: -0.6, w: 7 * s, d: 7 * s, royal: false, tiers: 1 },
    { x: 18.5, z: -0.6, w: 7 * s, d: 7 * s, royal: false, tiers: 1 },
    // 4 phụ (góc / cánh)
    { x: -14, z: 5.5, w: 6.5 * s, d: 6 * s, royal: false, tiers: 1 },
    { x: 14, z: 5.5, w: 6.5 * s, d: 6 * s, royal: false, tiers: 1 },
    { x: -20, z: -6.5, w: 6 * s, d: 5.5 * s, royal: false, tiers: 1 },
    { x: 20, z: -6.5, w: 6 * s, d: 5.5 * s, royal: false, tiers: 1 },
  ]
}

/**
 * Lầu Ngũ Phụng — 2 tầng, ~100 cột lim sơn son, 9 bộ mái.
 * Đặt local origin trên mặt đài (y=0 = deck top).
 */
export function buildNguPhung(lod: 0 | 1 | 2): THREE.Group {
  const g = new THREE.Group()
  g.name = 'lau-ngu-phung'

  const plaster = getMaterial('tuong_voi', lod)
  const stone = getMaterial('da_thanh', lod)
  const wood = getMaterial('go_lim', lod)
  const son = getMaterial('go_son_son', lod)

  const floor1H = lod === 2 ? 3.6 : NGO_MON.pavilionFloorH
  const floor2H = lod === 2 ? 2.8 : NGO_MON.upperFloorH
  const pavilionW = 42
  const pavilionD = 16

  // Ground-floor slab / raised wood floor
  if (lod < 2) {
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(pavilionW + 1, 0.22, pavilionD + 1),
      getMaterial('gach_bat_trang', lod),
    )
    slab.position.y = 0.11
    slab.receiveShadow = true
    g.add(slab)
  }

  // Enclosure walls (open galleries south)
  if (lod === 2) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(pavilionW * 0.95, floor1H + floor2H, pavilionD * 0.85), plaster)
    mass.position.set(0, (floor1H + floor2H) / 2, -0.5)
    mass.castShadow = true
    g.add(mass)
  } else {
    const wallT = 0.4
    const wallH = floor1H
    // Rear (+N / -Z) wall
    const rear = new THREE.Mesh(new THREE.BoxGeometry(pavilionW * 0.92, wallH, wallT), plaster)
    rear.position.set(0, wallH / 2, -pavilionD / 2 + 0.5)
    rear.castShadow = true
    g.add(rear)
    // Side walls
    for (const sx of [-1, 1] as const) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, pavilionD * 0.7), plaster)
      side.position.set(sx * (pavilionW / 2 - 1), wallH / 2, -1)
      side.castShadow = true
      g.add(side)
    }
    // Breast walls south (between openings)
    if (lod === 0) {
      const breast = new THREE.Mesh(new THREE.BoxGeometry(3.2, wallH * 0.45, wallT), plaster)
      for (const x of [-14, -5, 5, 14]) {
        const b = breast.clone()
        b.position.set(x, wallH * 0.22, pavilionD / 2 - 1.2)
        g.add(b)
      }
      // Central door
      const frame = new THREE.Mesh(new THREE.BoxGeometry(3.0, wallH * 0.82, 0.28), son)
      frame.position.set(0, wallH * 0.41, pavilionD / 2 - 1.3)
      g.add(frame)
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(2.5, wallH * 0.72, 0.12), wood)
      leaf.position.set(0, wallH * 0.38, pavilionD / 2 - 1.15)
      g.add(leaf)
    }
  }

  // --- ~100 columns: 48 through-both-floors + 52 gallery ---
  if (lod < 2) {
    const tallH = floor1H + floor2H - 0.15
    const shortH = floor1H - 0.1
    const tall = placeTallColumns()
    const short = placeGalleryColumns()
    // Ensure totals ≈ 100
    g.add(buildColumnsAt(tall, tallH, 0.3, 'go_son_son', lod))
    g.add(buildColumnsAt(short, shortH, 0.26, 'go_son_son', lod))

    if (lod === 0) {
      // Stone bases under a subset of tall columns
      const baseGeo = new THREE.CylinderGeometry(0.42, 0.48, 0.28, 8)
      const bases = new THREE.InstancedMesh(baseGeo, stone, tall.length)
      const dummy = new THREE.Object3D()
      tall.forEach((p, i) => {
        dummy.position.set(p[0], 0.14, p[2])
        dummy.updateMatrix()
        bases.setMatrixAt(i, dummy.matrix)
      })
      bases.instanceMatrix.needsUpdate = true
      g.add(bases)
    }
  }

  // Mid floor slab (upper storey)
  const midY = floor1H
  if (lod < 2) {
    const mid = new THREE.Mesh(new THREE.BoxGeometry(pavilionW * 0.88, 0.25, pavilionD * 0.85), stone)
    mid.position.set(0, midY, -0.4)
    mid.receiveShadow = true
    g.add(mid)

    // Upper short walls
    const upperH = floor2H * 0.72
    if (lod === 0) {
      const uw = new THREE.Mesh(new THREE.BoxGeometry(pavilionW * 0.7, upperH, 0.28), plaster)
      uw.position.set(0, midY + upperH / 2, -pavilionD / 2 + 1.2)
      g.add(uw)
      for (const sx of [-1, 1] as const) {
        const us = new THREE.Mesh(new THREE.BoxGeometry(0.28, upperH, pavilionD * 0.5), plaster)
        us.position.set(sx * pavilionW * 0.32, midY + upperH / 2, -0.5)
        g.add(us)
      }
    } else {
      // LOD1: single upper mass band
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(pavilionW * 0.75, upperH * 0.55, pavilionD * 0.55),
        plaster,
      )
      band.position.set(0, midY + upperH * 0.35, -0.5)
      g.add(band)
    }
  }

  // Lower gallery roof ring (thanh lưu ly) — connecting eaves around floor 1
  const galleryY = floor1H - 0.15
  if (lod === 0) {
    for (const [x, z, w, d] of [
      [0, -pavilionD / 2 - 0.3, 38, 4.5],
      [-pavilionW / 2 + 1, 1, 4.5, 12],
      [pavilionW / 2 - 1, 1, 4.5, 12],
    ] as const) {
      const r = buildRoof({
        width: w,
        depth: d,
        tiers: 1,
        tileMaterial: 'ngoi_thanh_luu_ly',
        ridgeOrnament: 'none',
        lod,
      })
      r.position.set(x, galleryY, z)
      g.add(r)
    }
  } else if (lod === 1) {
    // One compact strip north + instanced side caps
    const north = buildCompactRoof(36, 4, 1.1, 'ngoi_thanh_luu_ly', lod)
    north.position.set(0, galleryY, -pavilionD / 2 - 0.2)
    g.add(north)
  }

  // Brackets under upper eaves (LOD0 only — style chồng rường / con sơn)
  if (lod === 0) {
    const bracketYs = midY + floor2H * 0.15
    for (const x of [-16, -8, 0, 8, 16]) {
      const b = buildBracketSet({ width: 2.2, depth: 1.1, height: 0.9, layers: 3, lod })
      b.position.set(x, bracketYs, -pavilionD / 2 + 1.5)
      g.add(b)
    }
  }

  // --- 9 bộ mái tầng trên ---
  const roofY = midY + floor2H * (lod === 2 ? 0.85 : 0.95)
  addNineRoofs(g, lod, roofY)

  return g
}

function addNineRoofs(g: THREE.Group, lod: 0 | 1 | 2, roofY: number): void {
  const specs = roofSpecs(lod)

  if (lod === 2) {
    for (const s of specs) {
      const rise = s.royal ? 2.2 : 1.5
      const mesh = buildCompactRoof(s.w, s.d, rise, s.royal ? 'ngoi_hoang_luu_ly' : 'ngoi_thanh_luu_ly', 2)
      mesh.position.x = s.x
      mesh.position.z = s.z
      mesh.position.y += roofY
      g.add(mesh)
    }
    return
  }

  if (lod === 1) {
    const center = specs.find((s) => s.royal)!
    const royal = buildCompactRoof(center.w, center.d, 2.0, 'ngoi_hoang_luu_ly', lod)
    royal.position.set(center.x, roofY, center.z)
    g.add(royal)

    // 8 green roofs — one InstancedMesh
    const green = specs.filter((s) => !s.royal)
    const baseW = 7
    const baseD = 6.5
    const rise = 1.45
    const geo = buildCompactRoof(baseW, baseD, rise, 'ngoi_thanh_luu_ly', lod).geometry
    const mat = getMaterial('ngoi_thanh_luu_ly', lod)
    const inst = new THREE.InstancedMesh(geo, mat, green.length)
    inst.castShadow = true
    inst.name = 'roofs-thanh'
    const dummy = new THREE.Object3D()
    green.forEach((s, i) => {
      dummy.position.set(s.x, roofY, s.z)
      dummy.scale.set(s.w / baseW, 1, s.d / baseD)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    })
    inst.instanceMatrix.needsUpdate = true
    g.add(inst)
    return
  }

  // LOD0: full kit roofs, distinct materials + ornaments
  for (const s of specs) {
    const roof = buildRoof({
      width: s.w,
      depth: s.d,
      tiers: s.tiers,
      curvature: s.royal ? 0.95 : 0.8,
      tileMaterial: s.royal ? 'ngoi_hoang_luu_ly' : 'ngoi_thanh_luu_ly',
      ridgeOrnament: s.ornament ?? 'none',
      lod: 0,
    })
    roof.position.set(s.x, roofY, s.z)
    g.add(roof)
  }
}

/** 48 cột xuyên 2 tầng — lưới trung tâm. */
function placeTallColumns(): Array<[number, number, number]> {
  const cols = 8
  const rows = 6
  const sx = 4.6
  const sz = 2.35
  const originX = -((cols - 1) * sx) / 2
  const originZ = -((rows - 1) * sz) / 2 - 0.8
  const out: Array<[number, number, number]> = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push([originX + c * sx, 0, originZ + r * sz])
    }
  }
  return out // 48
}

/** 52 cột hồi lang tầng dưới — chu vi + cánh. */
function placeGalleryColumns(): Array<[number, number, number]> {
  const out: Array<[number, number, number]> = []
  // South gallery line
  for (let i = 0; i < 12; i++) {
    const x = -20 + i * (40 / 11)
    out.push([x, 0, 6.2])
  }
  // North outer line (behind)
  for (let i = 0; i < 12; i++) {
    const x = -20 + i * (40 / 11)
    out.push([x, 0, -7.4])
  }
  // East / west galleries
  for (let i = 0; i < 8; i++) {
    const z = -6 + i * (12 / 7)
    out.push([-21.5, 0, z])
    out.push([21.5, 0, z])
  }
  // Wing tips (fill to 52)
  for (let i = 0; i < 6; i++) {
    const x = -16 + i * 6.4
    if (Math.abs(x) < 4) continue
    out.push([x, 0, 4.0])
  }
  // Ensure exactly 52
  while (out.length > 52) out.pop()
  while (out.length < 52) {
    const i = out.length
    out.push([-18 + (i % 10) * 4, 0, 5.0 + (i % 3) * 0.3])
  }
  return out
}
