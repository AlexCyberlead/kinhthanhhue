import * as THREE from 'three'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildWall } from '../../core/geometry/kit/buildWall'
import {
  buildHoiVanBand,
  buildPhuongDao,
  hoiVanBandGeo,
} from '../../core/geometry/kit/ornament'
import { scaleBoxUvToMeters, uvRepeat } from '../../core/geometry/kit/uvMeters'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import {
  mergeOrNull,
  meterBox,
  NGO_MON,
  ngoMonLayout,
  type Lod,
} from './geometry'

type RoofSpec = {
  x: number
  z: number
  w: number
  d: number
  yOff: number
  royal: boolean
  tiers: number
  ridge: 'long-chau-nhat' | 'phuong' | 'bau-phap-lam' | 'none'
}

/**
 * 9 bộ mái Lầu Ngũ Phụng.
 * 5 chính trên thanh bắc (giữa hoàng lưu ly) + 2 phụ mỗi cánh.
 * [xác thực — Wikipedia / Vietnam Tourism] 9 bộ; giữa hoàng, 8 thanh.
 * Vị trí / kích thước từng nóc: [ước lượng hợp lý].
 */
function roofSpecs(lod: Lod): RoofSpec[] {
  const s = lod === 2 ? 0.94 : 1
  const ridgeLod = lod < 2
  return [
    {
      x: 0,
      z: -0.6,
      w: 12.4 * s,
      d: 10.6 * s,
      yOff: 0.62,
      royal: true,
      tiers: lod === 0 ? 2 : 1,
      ridge: ridgeLod ? 'long-chau-nhat' : 'none',
    },
    {
      x: -10.6,
      z: -0.35,
      w: 9.1 * s,
      d: 8.4 * s,
      yOff: 0.18,
      royal: false,
      tiers: 1,
      ridge: ridgeLod ? 'phuong' : 'none',
    },
    {
      x: 10.6,
      z: -0.35,
      w: 9.1 * s,
      d: 8.4 * s,
      yOff: 0.18,
      royal: false,
      tiers: 1,
      ridge: ridgeLod ? 'phuong' : 'none',
    },
    {
      x: -20.2,
      z: -0.1,
      w: 8.0 * s,
      d: 7.6 * s,
      yOff: 0,
      royal: false,
      tiers: 1,
      ridge: ridgeLod ? 'bau-phap-lam' : 'none',
    },
    {
      x: 20.2,
      z: -0.1,
      w: 8.0 * s,
      d: 7.6 * s,
      yOff: 0,
      royal: false,
      tiers: 1,
      ridge: ridgeLod ? 'bau-phap-lam' : 'none',
    },
    {
      x: -23.6,
      z: 12.2,
      w: 8.4 * s,
      d: 8.0 * s,
      yOff: -0.28,
      royal: false,
      tiers: 1,
      ridge: ridgeLod ? 'phuong' : 'none',
    },
    {
      x: 23.6,
      z: 12.2,
      w: 8.4 * s,
      d: 8.0 * s,
      yOff: -0.28,
      royal: false,
      tiers: 1,
      ridge: ridgeLod ? 'phuong' : 'none',
    },
    {
      x: -23.6,
      z: 19.4,
      w: 7.3 * s,
      d: 6.8 * s,
      yOff: -0.48,
      royal: false,
      tiers: 1,
      ridge: ridgeLod ? 'phuong' : 'none',
    },
    {
      x: 23.6,
      z: 19.4,
      w: 7.3 * s,
      d: 6.8 * s,
      yOff: -0.48,
      royal: false,
      tiers: 1,
      ridge: ridgeLod ? 'phuong' : 'none',
    },
  ]
}

/**
 * Lầu Ngũ Phụng — 2 tầng, ~100 cột lim sơn son, 9 bộ mái.
 * Gốc local = mặt đài tại tâm thanh bắc.
 */
export function buildNguPhung(lod: Lod): THREE.Group {
  const g = new THREE.Group()
  g.name = 'lau-ngu-phung'

  const floor1H = lod === 2 ? 3.5 : NGO_MON.pavilionFloorH
  const floor2H = lod === 2 ? 2.7 : NGO_MON.upperFloorH
  const hallW = NGO_MON.pavilionW
  const hallD = NGO_MON.pavilionD
  const layout = ngoMonLayout()

  if (lod === 2) {
    addLod2Mass(g, floor1H, floor2H, hallW, hallD, layout)
    addNineRoofs(g, lod, floor1H + floor2H * 0.88)
    return g
  }

  addHallFloors(g, lod, floor1H, hallW, hallD)
  addHallWalls(g, lod, floor1H, floor2H, hallW, hallD)
  addHundredColumns(g, lod, floor1H, floor2H, layout)
  addGalleryRoofs(g, lod, floor1H, hallW, hallD, layout)
  addPavilionStairs(g, lod, floor1H, hallD)
  addBienNgach(g, lod, floor1H, hallD)
  addBrackets(g, lod, floor1H, floor2H, hallD)
  addInterior(g, lod, floor1H, floor2H, hallW, hallD)
  addNineRoofs(g, lod, floor1H + floor2H * 0.94)

  return g
}

function addLod2Mass(
  g: THREE.Group,
  floor1H: number,
  floor2H: number,
  hallW: number,
  hallD: number,
  layout: ReturnType<typeof ngoMonLayout>,
): void {
  const plaster = getMaterial('tuong_voi', 2)
  const hall = new THREE.Mesh(
    meterBox(hallW * 0.92, floor1H + floor2H, hallD * 0.82, 0, (floor1H + floor2H) / 2, -0.3, 'tuongVoi'),
    plaster,
  )
  hall.name = 'ngu-phung-mass'
  g.add(hall)
  for (const sx of [-1, 1] as const) {
    const wing = new THREE.Mesh(
      meterBox(layout.armX * 0.28 + 4, floor1H * 0.92, 14, sx * 23.6, floor1H * 0.46, 15.5, 'tuongVoi'),
      plaster,
    )
    wing.name = sx < 0 ? 'wing-w' : 'wing-e'
    g.add(wing)
  }
}

function addHallFloors(g: THREE.Group, lod: Lod, floor1H: number, hallW: number, hallD: number): void {
  const brick = getMaterial('gach_bat_trang', lod)
  const slab = new THREE.Mesh(
    meterBox(hallW + 0.8, 0.2, hallD + 0.6, 0, 0.1, 0, 'gachBatTrang'),
    brick,
  )
  slab.name = 'floor1-slab'
  slab.receiveShadow = true
  g.add(slab)

  const mid = new THREE.Mesh(
    meterBox(hallW * 0.9, 0.22, hallD * 0.86, 0, floor1H, -0.25, 'gachBatTrang'),
    brick,
  )
  mid.name = 'floor2-slab'
  mid.receiveShadow = true
  g.add(mid)
}

function addHallWalls(
  g: THREE.Group,
  lod: Lod,
  floor1H: number,
  floor2H: number,
  hallW: number,
  hallD: number,
): void {
  const zN = -hallD / 2 + 0.35
  const zS = hallD / 2 - 1.15
  const xE = hallW / 2 - 0.9
  const xW = -hallW / 2 + 0.9

  g.add(
    buildWall({
      path: [new THREE.Vector3(-hallW * 0.46, 0, zN), new THREE.Vector3(hallW * 0.46, 0, zN)],
      height: floor1H - 0.12,
      thickness: 0.42,
      finish: 'layered',
      lod,
    }),
  )
  g.add(
    buildWall({
      path: [new THREE.Vector3(xE, 0, zN + 0.2), new THREE.Vector3(xE, 0, zS)],
      height: floor1H - 0.12,
      thickness: 0.38,
      finish: 'layered',
      lod,
    }),
  )
  g.add(
    buildWall({
      path: [new THREE.Vector3(xW, 0, zN + 0.2), new THREE.Vector3(xW, 0, zS)],
      height: floor1H - 0.12,
      thickness: 0.38,
      finish: 'layered',
      lod,
    }),
  )

  const plaster = getMaterial('tuong_voi', lod)
  const son = getMaterial('go_son_son', lod)
  const breastH = floor1H * 0.42
  const breast = new THREE.BoxGeometry(3.15, breastH, 0.32)
  scaleBoxUvToMeters(breast, 3.15, breastH, 0.32, uvRepeat('tuongVoi'))
  const xs = [-16.5, -8.2, 8.2, 16.5]
  const inst = new THREE.InstancedMesh(breast, plaster, xs.length)
  inst.name = 'breast-walls'
  inst.castShadow = true
  const dummy = new THREE.Object3D()
  xs.forEach((x, i) => {
    dummy.position.set(x, breastH / 2, hallD / 2 - 1.05)
    dummy.updateMatrix()
    inst.setMatrixAt(i, dummy.matrix)
  })
  inst.instanceMatrix.needsUpdate = true
  g.add(inst)

  const frame = new THREE.Mesh(
    meterBox(3.05, floor1H * 0.84, 0.26, 0, floor1H * 0.42, hallD / 2 - 1.12, 'sonSon'),
    son,
  )
  frame.name = 'center-door-frame'
  frame.castShadow = true
  g.add(frame)
  const leaf = new THREE.Mesh(
    meterBox(2.45, floor1H * 0.74, 0.1, 0, floor1H * 0.39, hallD / 2 - 1.0, 'goLim'),
    getMaterial('go_lim', lod),
  )
  leaf.name = 'center-door-leaf'
  g.add(leaf)

  const upperH = floor2H * 0.7
  const upperRear = buildWall({
    path: [new THREE.Vector3(-hallW * 0.34, 0, zN + 0.55), new THREE.Vector3(hallW * 0.34, 0, zN + 0.55)],
    height: upperH,
    thickness: 0.3,
    finish: 'layered',
    lod,
  })
  upperRear.position.y = floor1H
  g.add(upperRear)

  const upperE = buildWall({
    path: [new THREE.Vector3(hallW * 0.3, 0, zN + 0.7), new THREE.Vector3(hallW * 0.3, 0, 1.2)],
    height: upperH,
    thickness: 0.28,
    finish: 'layered',
    lod,
  })
  upperE.position.y = floor1H
  g.add(upperE)

  const upperW = buildWall({
    path: [new THREE.Vector3(-hallW * 0.3, 0, zN + 0.7), new THREE.Vector3(-hallW * 0.3, 0, 1.2)],
    height: upperH,
    thickness: 0.28,
    finish: 'layered',
    lod,
  })
  upperW.position.y = floor1H
  g.add(upperW)
}

/**
 * ~100 cột: 48 xuyên 2 tầng (8×6) + 52 hồi lang / cánh.
 * [xác thực — Wikipedia] ~100 cột, ~48 xuyên tầng.
 */
function addHundredColumns(
  g: THREE.Group,
  lod: Lod,
  floor1H: number,
  floor2H: number,
  layout: ReturnType<typeof ngoMonLayout>,
): void {
  const tallH = floor1H + floor2H - 0.12
  const shortH = floor1H - 0.08
  const armX = layout.armX

  const tall = buildColumnGrid({
    rows: 6,
    cols: 8,
    spacing: [5.45, 1.58],
    height: tallH,
    radius: 0.3,
    material: 'go_son_son',
    lod,
  })
  tall.name = 'cols-tall-48'
  tall.position.set(0, 0, -0.15)
  g.add(tall)

  const south = buildColumnGrid({
    rows: 1,
    cols: 12,
    spacing: [3.92, 1],
    height: shortH,
    radius: 0.25,
    material: 'go_son_son',
    lod,
  })
  south.name = 'cols-south-12'
  south.position.set(0, 0, 4.75)
  g.add(south)

  const north = buildColumnGrid({
    rows: 1,
    cols: 10,
    spacing: [4.35, 1],
    height: shortH,
    radius: 0.25,
    material: 'go_son_son',
    lod,
  })
  north.name = 'cols-north-10'
  north.position.set(0, 0, -4.85)
  g.add(north)

  for (const sx of [-1, 1] as const) {
    const outer = buildColumnGrid({
      rows: 10,
      cols: 1,
      spacing: [1, 1.52],
      height: shortH,
      radius: 0.24,
      material: 'go_son_son',
      lod,
    })
    outer.name = sx < 0 ? 'cols-arm-w-10' : 'cols-arm-e-10'
    outer.position.set(sx * armX, 0, 13.6)
    g.add(outer)

    const inner = buildColumnGrid({
      rows: 5,
      cols: 1,
      spacing: [1, 2.15],
      height: shortH,
      radius: 0.24,
      material: 'go_son_son',
      lod,
    })
    inner.name = sx < 0 ? 'cols-inner-w-5' : 'cols-inner-e-5'
    inner.position.set(sx * (armX - 4.15), 0, 12.8)
    g.add(inner)
  }
}

function addGalleryRoofs(
  g: THREE.Group,
  lod: Lod,
  floor1H: number,
  hallW: number,
  hallD: number,
  layout: ReturnType<typeof ngoMonLayout>,
): void {
  // Chỉ diềm hồi lang — không tấm 50 m đè 9 nóc (nhìn như lưới xanh + tối).
  const y = floor1H - 0.08
  const northEave = buildRoof({
    width: hallW * 0.72,
    depth: 4.2,
    tiers: 1,
    curvature: 0.72,
    tileMaterial: 'ngoi_thanh_luu_ly',
    ridge: 'none',
    lod,
    tileScale: 1.15,
  })
  northEave.position.set(0, y, -hallD / 2 - 0.15)
  g.add(northEave)

  for (const sx of [-1, 1] as const) {
    const wing = buildRoof({
      width: 7.6,
      depth: 11.5,
      tiers: 1,
      curvature: 0.72,
      tileMaterial: 'ngoi_thanh_luu_ly',
      ridge: 'none',
      lod,
      tileScale: 1.15,
    })
    wing.position.set(sx * layout.armX, y, 13.4)
    g.add(wing)
  }
}

function addPavilionStairs(g: THREE.Group, lod: Lod, floor1H: number, hallD: number): void {
  const wood = getMaterial('go_lim', lod)
  const stepN = lod === 0 ? 12 : 8
  const tread = 0.34
  const w = 1.45
  const parts: THREE.BufferGeometry[] = []
  const x = 7.4
  const z0 = hallD / 2 - 0.4
  for (let s = 0; s < stepN; s++) {
    const h = ((s + 1) / stepN) * floor1H
    parts.push(meterBox(w, h, tread, x, h / 2, z0 - tread * (s + 0.5), 'goLim'))
  }
  const geo = mergeOrNull(parts)
  if (!geo) return
  const m = new THREE.Mesh(geo, wood)
  m.name = 'stairs-to-floor2'
  m.castShadow = lod === 0
  m.receiveShadow = true
  g.add(m)
}

function addBienNgach(g: THREE.Group, lod: Lod, floor1H: number, hallD: number): void {
  const gold = getMaterial('vang_thep', lod)
  const lam = getMaterial('phap_lam', lod)
  const z = hallD / 2 - 0.55
  const y = floor1H + 1.15

  const plate = new THREE.Mesh(meterBox(4.6, 1.15, 0.08, 0, y, z, 'phapLam'), lam)
  plate.name = 'bien-ngach-plate'
  plate.castShadow = true
  g.add(plate)

  const frame = mergeOrNull([
    meterBox(4.95, 0.1, 0.12, 0, y + 0.62, z + 0.02, 'vangThep'),
    meterBox(4.95, 0.1, 0.12, 0, y - 0.62, z + 0.02, 'vangThep'),
    meterBox(0.1, 1.35, 0.12, -2.42, y, z + 0.02, 'vangThep'),
    meterBox(0.1, 1.35, 0.12, 2.42, y, z + 0.02, 'vangThep'),
  ])
  if (frame) {
    const m = new THREE.Mesh(frame, gold)
    m.name = 'bien-ngach-frame'
    g.add(m)
  }

  const motif = hoiVanBandGeo(3.4, 0.28, 0.035, lod === 0 ? 0 : 1)
  if (motif) {
    const m = new THREE.Mesh(motif, gold)
    m.position.set(0, y - 0.15, z + 0.06)
    g.add(m)
  }

  for (const sx of [-1, 1] as const) {
    const phuong = buildPhuongDao({ scale: 0.42, lod })
    phuong.position.set(sx * 3.15, y - 0.15, z)
    phuong.rotation.y = sx < 0 ? 0.15 : Math.PI - 0.15
    g.add(phuong)
  }

  const fascia = buildHoiVanBand({ width: 18, height: 0.24, relief: 0.035, lod })
  fascia.position.set(0, floor1H + 0.28, z + 0.04)
  g.add(fascia)
}

function addBrackets(g: THREE.Group, lod: Lod, floor1H: number, floor2H: number, hallD: number): void {
  if (lod === 2) return
  const y = floor1H + floor2H * 0.12
  const z = -hallD / 2 + 1.55
  for (const x of [-16, -8, 0, 8, 16]) {
    const b = buildBracketSet({
      width: lod === 0 ? 2.3 : 1.9,
      depth: 1.05,
      height: 0.88,
      layers: lod === 0 ? 3 : 2,
      lod,
    })
    b.position.set(x, y, z)
    g.add(b)
  }
}

/** Stretch: nội thất tầng 2 gợi ý — sàn, vì, bao lơn. */
function addInterior(
  g: THREE.Group,
  lod: Lod,
  floor1H: number,
  floor2H: number,
  hallW: number,
  hallD: number,
): void {
  const wood = getMaterial('go_lim', lod)
  const son = getMaterial('go_son_son', lod)
  const stone = getMaterial('da_thanh', lod)

  const floor = new THREE.Mesh(
    meterBox(hallW * 0.62, 0.06, hallD * 0.55, 0, floor1H + 0.14, -0.4, 'goLim'),
    wood,
  )
  floor.name = 'interior-floor'
  floor.receiveShadow = true
  g.add(floor)

  const railH = 0.78
  const zS = hallD / 2 - 1.35
  const rail = new THREE.Mesh(
    meterBox(hallW * 0.55, 0.07, 0.08, 0, floor1H + railH, zS, 'daThanh'),
    stone,
  )
  rail.name = 'bao-lon-rail'
  g.add(rail)

  const postGeo = new THREE.BoxGeometry(0.08, railH, 0.08)
  scaleBoxUvToMeters(postGeo, 0.08, railH, 0.08, uvRepeat('daThanh'))
  const n = lod === 0 ? 11 : 7
  const posts = new THREE.InstancedMesh(postGeo, stone, n)
  posts.name = 'bao-lon-posts'
  const dummy = new THREE.Object3D()
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1)
    dummy.position.set(-hallW * 0.26 + t * hallW * 0.52, floor1H + railH / 2, zS)
    dummy.updateMatrix()
    posts.setMatrixAt(i, dummy.matrix)
  }
  posts.instanceMatrix.needsUpdate = true
  g.add(posts)

  if (lod === 0) {
    for (const x of [-6, 0, 6]) {
      const b = buildBracketSet({ width: 2.6, depth: 1.2, height: 1.05, layers: 3, lod: 0 })
      b.position.set(x, floor1H + 0.2, -hallD * 0.18)
      g.add(b)
    }
    const screen = new THREE.Mesh(
      meterBox(0.12, floor2H * 0.62, 4.2, 0, floor1H + floor2H * 0.38, -1.6, 'sonSon'),
      son,
    )
    screen.name = 'interior-screen'
    g.add(screen)
  }
}

function addNineRoofs(g: THREE.Group, lod: Lod, roofY: number): void {
  for (const s of roofSpecs(lod)) {
    const roof = buildRoof({
      width: s.w,
      depth: s.d,
      tiers: s.tiers,
      curvature: s.royal ? 0.94 : 0.8,
      tileMaterial: s.royal ? 'ngoi_hoang_luu_ly' : 'ngoi_thanh_luu_ly',
      ridge: s.ridge,
      coDiem: s.royal && lod < 2,
      lod,
      tileScale: s.royal ? 0.95 : 1.05,
    })
    roof.position.set(s.x, roofY + s.yOff, s.z)
    g.add(roof)
  }
}
