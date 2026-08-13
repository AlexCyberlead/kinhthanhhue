import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildPlatform, buildWall } from '../../core/geometry/kit'
import { UV_REPEAT_METERS } from '../../core/materials/textures'
import {
  IMPERIAL_CITY,
  IMPERIAL_MOAT,
  THAI_DICH,
} from '../terrain/terrainConfig'
import { imperialMoatSouthZ } from '../terrain/heightfield'
import {
  BRIDGE_DECK_LEN,
  BRIDGE_DECK_W,
  BRIDGE_DECK_Y,
  DAI_TRIEU_PLAZA,
  DAI_TRIEU_Z,
  HO_THAI_DICH_Z,
  IMPERIAL_LOOP,
  LAKE_SPAN_Z,
  type Lod,
  NGO_MON_Z,
  ROAD_WIDTH,
  ROAD_Y,
  SMALL_BRIDGES,
  THAN_DAO_NORTH_Z,
  TRUNG_DAO_Z,
} from './constants'
import {
  buildInnerCourts,
  buildNoiKimThuyBanks,
  buildPartitionWalls,
} from './buildImperialFabric'
import {
  boxAt,
  createArchSpanGeo,
  mergeOrNull,
  meshFrom,
  paveBox,
  pavePlane,
  transformGeo,
} from './geoUtils'

const BRICK_UV = UV_REPEAT_METERS.gachBatTrang
const STONE_UV = UV_REPEAT_METERS.daThanh
const DIRT_UV = UV_REPEAT_METERS.dat
const BRICK_VO_UV = UV_REPEAT_METERS.gachVo

function flushBuckets(
  group: THREE.Group,
  buckets: Map<string, THREE.BufferGeometry[]>,
  matByName: Map<string, THREE.Material>,
  prefix: string,
): void {
  let i = 0
  for (const [key, geos] of buckets) {
    const mat = matByName.get(key)
    if (!mat) {
      for (const g of geos) g.dispose()
      continue
    }
    const merged = mergeOrNull(geos)
    const mesh = meshFrom(merged, mat, `${prefix}-${i++}`)
    if (mesh) group.add(mesh)
  }
  buckets.clear()
}

/** Merged brick pavement: Ngọ Môn → Đại Triều → Đại Cung (+ bridge / small decks). */
function buildThanDaoPavement(lod: Lod): THREE.Mesh | null {
  const brick = getMaterial('gach_bat_trang', lod)
  const geos: THREE.BufferGeometry[] = []
  const w = ROAD_WIDTH

  const southZ0 = HO_THAI_DICH_Z + LAKE_SPAN_Z / 2
  const southZ1 = NGO_MON_Z + 28
  const southLen = southZ1 - southZ0
  if (southLen > 1) {
    geos.push(pavePlane(w, southLen, 0, ROAD_Y, southZ0 + southLen / 2, 0, BRICK_UV))
  }

  const northZ1 = HO_THAI_DICH_Z - LAKE_SPAN_Z / 2
  const northLen = northZ1 - THAN_DAO_NORTH_Z
  if (northLen > 1) {
    geos.push(pavePlane(w, northLen, 0, ROAD_Y, northZ1 - northLen / 2, 0, BRICK_UV))
  }

  geos.push(
    pavePlane(
      DAI_TRIEU_PLAZA.width,
      DAI_TRIEU_PLAZA.depth,
      0,
      ROAD_Y + 0.012,
      DAI_TRIEU_Z,
      0,
      BRICK_UV,
    ),
  )

  if (lod < 2) {
    geos.push(pavePlane(3.4, 30, 16, ROAD_Y + 0.014, DAI_TRIEU_Z, 0, BRICK_UV))
    geos.push(pavePlane(3.4, 30, -16, ROAD_Y + 0.014, DAI_TRIEU_Z, 0, BRICK_UV))
  }

  geos.push(
    pavePlane(BRIDGE_DECK_W - 0.6, BRIDGE_DECK_LEN, 0, BRIDGE_DECK_Y + 0.08, TRUNG_DAO_Z, 0, BRICK_UV),
  )

  for (const b of SMALL_BRIDGES) {
    geos.push(pavePlane(b.width - 0.4, b.length, b.x, 1.05, b.z, b.rotY, BRICK_UV))
  }

  return meshFrom(mergeOrNull(geos), brick, 'than-dao-pavement')
}

function buildCurbs(lod: Lod): THREE.Mesh | null {
  const stone = getMaterial('da_thanh', lod)
  const geos: THREE.BufferGeometry[] = []
  const half = ROAD_WIDTH / 2 + 0.25
  const curbW = 0.45
  const curbH = 0.28

  const segments: Array<[number, number]> = [
    [HO_THAI_DICH_Z + LAKE_SPAN_Z / 2, NGO_MON_Z + 28],
    [THAN_DAO_NORTH_Z, HO_THAI_DICH_Z - LAKE_SPAN_Z / 2],
  ]
  for (const [z0, z1] of segments) {
    const len = Math.abs(z1 - z0)
    const mid = (z0 + z1) / 2
    geos.push(boxAt(curbW, curbH, len, half, curbH / 2, mid))
    geos.push(boxAt(curbW, curbH, len, -half, curbH / 2, mid))
  }

  return meshFrom(mergeOrNull(geos), stone, 'than-dao-curbs')
}

/** Cầu Trung Đạo — multi-span stone arches over hồ Thái Dịch. */
function buildTrungDaoBridge(lod: Lod, root: THREE.Group): void {
  const stone = getMaterial('da_thanh', lod)
  const brick = getMaterial('gach_vo', lod)
  const gold = getMaterial('vang_thep', lod)

  const geosStone: THREE.BufferGeometry[] = []
  const geosBrick: THREE.BufferGeometry[] = []

  const pierW = 1.6
  const pierD = BRIDGE_DECK_W + 1.2
  const pierH = BRIDGE_DECK_Y
  const archCount = lod === 2 ? 2 : 3
  const spanEach = (BRIDGE_DECK_LEN - pierW * (archCount + 1)) / archCount

  geosStone.push(
    boxAt(BRIDGE_DECK_W + 2.5, pierH + 0.4, 3.2, 0, (pierH + 0.4) / 2, TRUNG_DAO_Z + BRIDGE_DECK_LEN / 2 + 0.4),
  )
  geosStone.push(
    boxAt(BRIDGE_DECK_W + 2.5, pierH + 0.4, 3.2, 0, (pierH + 0.4) / 2, TRUNG_DAO_Z - BRIDGE_DECK_LEN / 2 - 0.4),
  )

  const zStart = TRUNG_DAO_Z - BRIDGE_DECK_LEN / 2 + pierW / 2
  const archSegs = lod === 0 ? 12 : lod === 1 ? 8 : 6
  const archTemplate = createArchSpanGeo(spanEach * 0.92, pierH * 0.72, 0.55, pierD * 0.92, archSegs)

  for (let i = 0; i <= archCount; i++) {
    const z = zStart + i * (spanEach + pierW)
    geosStone.push(boxAt(pierW, pierH, pierD, 0, pierH / 2, z))
  }

  for (let i = 0; i < archCount; i++) {
    const z = zStart + pierW + spanEach / 2 + i * (spanEach + pierW)
    geosBrick.push(transformGeo(archTemplate, 0, 0.02, z, Math.PI / 2))
  }
  archTemplate.dispose()

  geosStone.push(boxAt(BRIDGE_DECK_W, 0.35, BRIDGE_DECK_LEN, 0, BRIDGE_DECK_Y - 0.1, TRUNG_DAO_Z))

  if (lod < 2) {
    const railZ = BRIDGE_DECK_LEN - 1.2
    const railH = 0.78
    geosStone.push(
      boxAt(0.12, 0.1, railZ, BRIDGE_DECK_W / 2 - 0.22, BRIDGE_DECK_Y + railH + 0.08, TRUNG_DAO_Z),
    )
    geosStone.push(
      boxAt(0.12, 0.1, railZ, -(BRIDGE_DECK_W / 2 - 0.22), BRIDGE_DECK_Y + railH + 0.08, TRUNG_DAO_Z),
    )
    // Thanh giữa — lan can đọc được, không tấm ván bay
    geosStone.push(
      boxAt(0.08, 0.06, railZ, BRIDGE_DECK_W / 2 - 0.22, BRIDGE_DECK_Y + railH * 0.48, TRUNG_DAO_Z),
    )
    geosStone.push(
      boxAt(0.08, 0.06, railZ, -(BRIDGE_DECK_W / 2 - 0.22), BRIDGE_DECK_Y + railH * 0.48, TRUNG_DAO_Z),
    )
  }

  const stoneMesh = meshFrom(mergeOrNull(geosStone), stone, 'trung-dao-stone')
  const brickMesh = meshFrom(mergeOrNull(geosBrick), brick, 'trung-dao-arches')
  if (stoneMesh) root.add(stoneMesh)
  if (brickMesh) root.add(brickMesh)

  if (lod < 2) {
    const spacing = lod === 0 ? 1.2 : 1.55
    const countPerSide = Math.max(6, Math.floor((BRIDGE_DECK_LEN - 2) / spacing))
    const railH = 0.78
    // Con tiện lathe — cùng DNA sân / lan can kit
    const pts = [
      new THREE.Vector2(0.001, 0),
      new THREE.Vector2(0.07, 0.02),
      new THREE.Vector2(0.048, 0.08),
      new THREE.Vector2(0.09, 0.24),
      new THREE.Vector2(0.045, 0.4),
      new THREE.Vector2(0.07, 0.54),
      new THREE.Vector2(0.04, 0.68),
      new THREE.Vector2(0.055, 0.76),
      new THREE.Vector2(0.001, 0.78),
    ]
    const postGeo = new THREE.LatheGeometry(pts, lod === 0 ? 8 : 6)
    const posts = new THREE.InstancedMesh(postGeo, stone, countPerSide * 2)
    posts.name = 'trung-dao-posts'
    posts.castShadow = true

    const finialGeo = new THREE.SphereGeometry(0.09, lod === 0 ? 8 : 5, 5)
    const finials = new THREE.InstancedMesh(finialGeo, gold, countPerSide * 2)
    finials.name = 'trung-dao-finials'
    finials.castShadow = true

    const dummy = new THREE.Object3D()
    let idx = 0
    for (const side of [-1, 1]) {
      const x = side * (BRIDGE_DECK_W / 2 - 0.22)
      for (let i = 0; i < countPerSide; i++) {
        const t = countPerSide === 1 ? 0.5 : i / (countPerSide - 1)
        const z = TRUNG_DAO_Z - BRIDGE_DECK_LEN / 2 + 1 + t * (BRIDGE_DECK_LEN - 2)
        dummy.position.set(x, BRIDGE_DECK_Y + 0.12, z)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.set(1, 1, 1)
        dummy.updateMatrix()
        posts.setMatrixAt(idx, dummy.matrix)

        dummy.position.set(x, BRIDGE_DECK_Y + 0.12 + railH + 0.06, z)
        dummy.updateMatrix()
        finials.setMatrixAt(idx, dummy.matrix)
        idx++
      }
    }
    posts.instanceMatrix.needsUpdate = true
    finials.instanceMatrix.needsUpdate = true
    root.add(posts)
    root.add(finials)
  }
}

function buildSmallBridges(lod: Lod, root: THREE.Group): void {
  const stone = getMaterial('da_thanh', lod)
  const brick = getMaterial('gach_vo', lod)
  const geosStone: THREE.BufferGeometry[] = []
  const geosArch: THREE.BufferGeometry[] = []

  const archSegs = lod === 0 ? 10 : 6
  let totalPosts = 0
  for (const b of SMALL_BRIDGES) {
    totalPosts += lod < 2 ? Math.max(4, Math.floor(b.length / 1.6)) * 2 : 0
  }

  const postGeo = new THREE.BoxGeometry(0.18, 0.7, 0.18)
  const posts = totalPosts > 0 ? new THREE.InstancedMesh(postGeo, stone, totalPosts) : null
  if (posts) {
    posts.name = 'small-bridge-posts'
    posts.castShadow = true
  }
  const dummy = new THREE.Object3D()
  let postIdx = 0

  for (const b of SMALL_BRIDGES) {
    const deckY = 0.95

    const abut = boxAt(b.width + 1.2, deckY + 0.15, 1.8, 0, (deckY + 0.15) / 2, b.length / 2 + 0.2)
    geosStone.push(transformGeo(abut, b.x, 0, b.z, b.rotY))
    abut.dispose()
    const abut2 = boxAt(b.width + 1.2, deckY + 0.15, 1.8, 0, (deckY + 0.15) / 2, -(b.length / 2 + 0.2))
    geosStone.push(transformGeo(abut2, b.x, 0, b.z, b.rotY))
    abut2.dispose()

    const pier = boxAt(1.1, deckY, b.width + 0.8, 0, deckY / 2, 0)
    geosStone.push(transformGeo(pier, b.x, 0, b.z, b.rotY))
    pier.dispose()

    const span = (b.length - 2.2) / 2
    const arch = createArchSpanGeo(span * 0.9, deckY * 0.65, 0.4, b.width + 0.4, archSegs)
    for (const sign of [-1, 1] as const) {
      const local = transformGeo(arch, 0, 0.02, sign * (span / 2 + 0.55), Math.PI / 2)
      geosArch.push(transformGeo(local, b.x, 0, b.z, b.rotY))
      local.dispose()
    }
    arch.dispose()

    const slab = boxAt(b.width, 0.28, b.length, 0, deckY - 0.05, 0)
    geosStone.push(transformGeo(slab, b.x, 0, b.z, b.rotY))
    slab.dispose()

    if (posts && lod < 2) {
      const n = Math.max(4, Math.floor(b.length / 1.6))
      for (const side of [-1, 1]) {
        for (let i = 0; i < n; i++) {
          const t = n === 1 ? 0.5 : i / (n - 1)
          const lz = -b.length / 2 + 0.6 + t * (b.length - 1.2)
          const lx = side * (b.width / 2 - 0.2)
          const cos = Math.cos(b.rotY)
          const sin = Math.sin(b.rotY)
          dummy.position.set(b.x + lx * cos - lz * sin, deckY + 0.4, b.z + lx * sin + lz * cos)
          dummy.rotation.set(0, b.rotY, 0)
          dummy.updateMatrix()
          posts.setMatrixAt(postIdx++, dummy.matrix)
        }
      }
    }
  }

  const stoneMesh = meshFrom(mergeOrNull(geosStone), stone, 'small-bridges-stone')
  const archMesh = meshFrom(mergeOrNull(geosArch), brick, 'small-bridges-arches')
  if (stoneMesh) root.add(stoneMesh)
  if (archMesh) root.add(archMesh)
  if (posts) {
    posts.count = postIdx
    posts.instanceMatrix.needsUpdate = true
    root.add(posts)
  }
}

/** Bậc đá thanh — kit buildPlatform baked + abutment/Đại Cung steps merged. */
function buildMainSteps(lod: Lod, root: THREE.Group): void {
  const stone = getMaterial('da_thanh', lod)
  const brick = getMaterial('gach_bat_trang', lod)
  const buckets = new Map<string, THREE.BufferGeometry[]>()
  const matByName = new Map<string, THREE.Material>([
    [stone.name, stone],
    [brick.name, brick],
  ])

  const placements: Array<{
    width: number
    depth: number
    steps: number
    height: number
    x: number
    z: number
    ry: number
  }> = [
    {
      width: ROAD_WIDTH * 0.85,
      depth: 6,
      steps: lod === 2 ? 2 : 5,
      height: 1.15,
      x: 0,
      z: -22,
      ry: Math.PI,
    },
    {
      width: ROAD_WIDTH * 1.1,
      depth: 7,
      steps: lod === 2 ? 2 : 4,
      height: 1.4,
      x: 0,
      z: NGO_MON_Z + 18,
      ry: 0,
    },
  ]

  const local = new THREE.Matrix4()
  const dummy = new THREE.Object3D()

  for (const p of placements) {
    const plat = buildPlatform({
      width: p.width,
      depth: p.depth,
      steps: p.steps,
      balustrade: lod === 0,
      height: p.height,
      lod,
    })
    plat.position.set(p.x, 0, p.z)
    plat.rotation.y = p.ry
    plat.updateMatrixWorld(true)

    plat.traverse((obj) => {
      const inst = obj as THREE.InstancedMesh
      if (inst.isInstancedMesh) {
        const count = inst.count
        const baked = new THREE.InstancedMesh(inst.geometry.clone(), inst.material, count)
        baked.name = 'platform-balustrade-posts'
        baked.castShadow = true
        for (let i = 0; i < count; i++) {
          inst.getMatrixAt(i, local)
          dummy.matrix.copy(inst.matrixWorld).multiply(local)
          dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
          dummy.updateMatrix()
          baked.setMatrixAt(i, dummy.matrix)
        }
        baked.instanceMatrix.needsUpdate = true
        root.add(baked)
        return
      }
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      const mat = mesh.material as THREE.Material
      const key = mat.name || mat.uuid
      if (!matByName.has(key)) matByName.set(key, mat)
      const g = mesh.geometry.clone()
      g.applyMatrix4(mesh.matrixWorld)
      const list = buckets.get(key)
      if (list) list.push(g)
      else buckets.set(key, [g])
    })

    plat.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.isMesh) mesh.geometry.dispose()
    })
  }

  const stepN = lod === 2 ? 2 : 4
  const zSouth = TRUNG_DAO_Z + BRIDGE_DECK_LEN / 2 + 2.2
  const zNorth = TRUNG_DAO_Z - BRIDGE_DECK_LEN / 2 - 2.2
  const extra: THREE.BufferGeometry[] = []
  for (const zBase of [zSouth, zNorth]) {
    for (let i = 0; i < stepN; i++) {
      const h = 0.22 * (i + 1)
      const d = 0.5
      const sign = zBase > TRUNG_DAO_Z ? 1 : -1
      extra.push(boxAt(BRIDGE_DECK_W * 0.7, h, d, 0, h / 2, zBase + sign * (d * (i + 0.5))))
    }
  }
  for (let i = 0; i < stepN; i++) {
    const h = 0.2 * (i + 1)
    extra.push(boxAt(ROAD_WIDTH * 0.7, h, 0.48, 0, h / 2, -88 - 0.5 * (i + 0.5)))
  }
  const stoneKey = stone.name
  const stoneList = buckets.get(stoneKey) ?? []
  stoneList.push(...extra)
  buckets.set(stoneKey, stoneList)

  flushBuckets(root, buckets, matByName, 'steps')
}

function buildFlowerWalls(lod: Lod, root: THREE.Group): void {
  const paths: THREE.Vector3[][] = [
    [new THREE.Vector3(11, 0, 95), new THREE.Vector3(11, 0, 130)],
    [new THREE.Vector3(-11, 0, 95), new THREE.Vector3(-11, 0, 130)],
    [new THREE.Vector3(11, 0, 8), new THREE.Vector3(11, 0, 32)],
    [new THREE.Vector3(-11, 0, 8), new THREE.Vector3(-11, 0, 32)],
  ]

  for (const path of paths) {
    const wall = buildWall({
      path,
      height: lod === 2 ? 1.4 : 1.75,
      thickness: 0.38,
      crenellation: false,
      lod,
    })
    root.add(wall)
  }

  if (lod === 2) return

  const voi = getMaterial('tuong_voi', lod)
  const phap = getMaterial('phap_lam', lod)
  const panelH = 1.15
  const panelW = 1.1
  const spacing = lod === 0 ? 1.35 : 1.7

  type Slot = { x: number; z: number; ry: number }
  const slots: Slot[] = []
  const runs: Array<{ x: number; z0: number; z1: number }> = [
    { x: 11.25, z0: 96, z1: 129 },
    { x: -11.25, z0: 96, z1: 129 },
    { x: 11.25, z0: 9, z1: 31 },
    { x: -11.25, z0: 9, z1: 31 },
  ]
  for (const run of runs) {
    const len = run.z1 - run.z0
    const n = Math.max(2, Math.floor(len / spacing))
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1)
      slots.push({
        x: run.x,
        z: run.z0 + t * len,
        ry: run.x > 0 ? -Math.PI / 2 : Math.PI / 2,
      })
    }
  }

  const plasterGeo = new THREE.BoxGeometry(panelW, panelH, 0.12)
  const plaster = new THREE.InstancedMesh(plasterGeo, voi, slots.length)
  plaster.name = 'flower-wall-plaster'
  plaster.castShadow = true
  plaster.receiveShadow = true

  const enamelGeo = new THREE.BoxGeometry(panelW * 0.72, panelH * 0.55, 0.06)
  const enamel = new THREE.InstancedMesh(enamelGeo, phap, slots.length)
  enamel.name = 'flower-wall-phap-lam'
  enamel.castShadow = true

  const dummy = new THREE.Object3D()
  slots.forEach((s, i) => {
    const out = s.x > 0 ? 0.14 : -0.14

    dummy.position.set(s.x, 0.95, s.z)
    dummy.rotation.set(0, s.ry, 0)
    dummy.scale.set(1, 1, 1)
    dummy.updateMatrix()
    plaster.setMatrixAt(i, dummy.matrix)

    dummy.position.set(s.x + out, 1.05, s.z)
    dummy.rotation.set(0, s.ry, 0)
    dummy.updateMatrix()
    enamel.setMatrixAt(i, dummy.matrix)
  })
  plaster.instanceMatrix.needsUpdate = true
  enamel.instanceMatrix.needsUpdate = true
  root.add(plaster)
  root.add(enamel)

  if (lod === 0) {
    const medGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10)
    const medallions = new THREE.InstancedMesh(medGeo, phap, slots.length)
    medallions.name = 'flower-wall-medallions'
    medallions.castShadow = true
    slots.forEach((s, i) => {
      const out = s.x > 0 ? 0.19 : -0.19
      dummy.position.set(s.x + out, 1.05, s.z)
      dummy.rotation.set(Math.PI / 2, 0, 0)
      dummy.updateMatrix()
      medallions.setMatrixAt(i, dummy.matrix)
    })
    medallions.instanceMatrix.needsUpdate = true
    root.add(medallions)
  }
}

/** Đường đất chữ nhật ôm Tử Cấm — 1 vòng trong Hoàng thành. */
function buildImperialLoop(lod: Lod): THREE.Mesh | null {
  const dirt = getMaterial('dat_nen', lod)
  const geos: THREE.BufferGeometry[] = []
  const { centerX, centerZ, halfX, halfZ, width, y } = IMPERIAL_LOOP
  const innerHalfZ = halfZ - width / 2

  geos.push(pavePlane(halfX * 2, width, centerX, y, centerZ - halfZ, 0, DIRT_UV))
  geos.push(pavePlane(halfX * 2, width, centerX, y, centerZ + halfZ, 0, DIRT_UV))
  geos.push(pavePlane(width, innerHalfZ * 2, centerX - halfX, y, centerZ, 0, DIRT_UV))
  geos.push(pavePlane(width, innerHalfZ * 2, centerX + halfX, y, centerZ, 0, DIRT_UV))

  return meshFrom(mergeOrNull(geos), dirt, 'imperial-loop-road')
}

/** Kè đá + bậc xuống nước quanh Hồ Thái Dịch. */
function buildThaiDichBanks(lod: Lod, root: THREE.Group): void {
  const stone = getMaterial('da_thanh', lod)
  const brick = getMaterial('gach_vo', lod)
  const silt = getMaterial('dat_nen', lod)
  const geosStone: THREE.BufferGeometry[] = []
  const geosBrick: THREE.BufferGeometry[] = []

  const hx = THAI_DICH.halfX + 2.2
  const hz = THAI_DICH.halfZ + 2.2
  const cx = THAI_DICH.cx
  const cz = THAI_DICH.cz
  const copeW = 0.85
  const copeH = 0.42

  const bed = meshFrom(
    pavePlane(THAI_DICH.halfX * 2 + 2, THAI_DICH.halfZ * 2 + 2, cx, -0.08, cz, 0, DIRT_UV),
    silt,
    'thai-dich-bed',
  )
  if (bed) {
    bed.receiveShadow = true
    root.add(bed)
  }

  geosStone.push(paveBox(hx * 2 + copeW, copeH, copeW, cx, copeH / 2, cz + hz, 0, STONE_UV))
  geosStone.push(paveBox(hx * 2 + copeW, copeH, copeW, cx, copeH / 2, cz - hz, 0, STONE_UV))
  geosStone.push(paveBox(copeW, copeH, hz * 2, cx + hx, copeH / 2, cz, 0, STONE_UV))
  geosStone.push(paveBox(copeW, copeH, hz * 2, cx - hx, copeH / 2, cz, 0, STONE_UV))

  // Inner revetment dropping toward water
  if (lod < 2) {
    const faceH = 0.7
    geosBrick.push(paveBox(hx * 2 - 1.2, faceH, 0.28, cx, -0.12, cz + hz - 0.7, 0, BRICK_VO_UV))
    geosBrick.push(paveBox(hx * 2 - 1.2, faceH, 0.28, cx, -0.12, cz - hz + 0.7, 0, BRICK_VO_UV))
  }

  const stepN = lod === 2 ? 2 : 5
  for (const sign of [-1, 1] as const) {
    const zEdge = cz + sign * (hz - 0.2)
    for (let i = 0; i < stepN; i++) {
      const h = 0.14 * (i + 1)
      const d = 0.48
      geosStone.push(
        paveBox(14, h, d, 0, -0.05 + h / 2, zEdge + sign * (0.35 + d * (i + 0.4)), 0, STONE_UV),
      )
    }
  }

  const stoneMesh = meshFrom(mergeOrNull(geosStone), stone, 'thai-dich-ke')
  const brickMesh = meshFrom(mergeOrNull(geosBrick), brick, 'thai-dich-revetment')
  if (stoneMesh) {
    stoneMesh.castShadow = lod === 0
    root.add(stoneMesh)
  }
  if (brickMesh) {
    brickMesh.castShadow = false
    root.add(brickMesh)
  }
}

/**
 * Bờ Ngoại Kim Thủy — kè đá hai mép, chừa cầu đất 4 cửa.
 * [ước lượng hợp lý — inset/width từ terrainConfig.IMPERIAL_MOAT]
 */
function buildNgoaiKimThuyBanks(lod: Lod): THREE.Mesh | null {
  const stone = getMaterial('da_thanh', lod)
  const geos: THREE.BufferGeometry[] = []

  const southZ = imperialMoatSouthZ()
  const northZ = IMPERIAL_CITY.centerZ - IMPERIAL_CITY.halfZ
  const eastX = IMPERIAL_CITY.centerX + IMPERIAL_CITY.halfX
  const westX = IMPERIAL_CITY.centerX - IMPERIAL_CITY.halfX
  const inner = IMPERIAL_MOAT.inset
  const outer = IMPERIAL_MOAT.inset + IMPERIAL_MOAT.width
  const copeW = 0.7
  const copeH = 0.32
  const y = copeH / 2 + 0.02

  const southGap = IMPERIAL_MOAT.gateGapSouth
  const sideGap = IMPERIAL_MOAT.gateGap

  const pushStrip = (
    w: number,
    d: number,
    x: number,
    z: number,
    skip: { alongX: boolean; gap: number; at: number } | null,
  ) => {
    if (!skip) {
      geos.push(paveBox(w, copeH, d, x, y, z, 0, STONE_UV))
      return
    }
    if (skip.alongX) {
      const leftW = skip.at - skip.gap - (x - w / 2)
      const rightW = x + w / 2 - (skip.at + skip.gap)
      if (leftW > 1.2) {
        geos.push(paveBox(leftW, copeH, d, x - w / 2 + leftW / 2, y, z, 0, STONE_UV))
      }
      if (rightW > 1.2) {
        geos.push(paveBox(rightW, copeH, d, x + w / 2 - rightW / 2, y, z, 0, STONE_UV))
      }
    } else {
      const southD = skip.at - skip.gap - (z - d / 2)
      const northD = z + d / 2 - (skip.at + skip.gap)
      if (southD > 1.2) {
        geos.push(paveBox(w, copeH, southD, x, y, z - d / 2 + southD / 2, 0, STONE_UV))
      }
      if (northD > 1.2) {
        geos.push(paveBox(w, copeH, northD, x, y, z + d / 2 - northD / 2, 0, STONE_UV))
      }
    }
  }

  const spanX = eastX - westX + outer * 2
  const midX = (eastX + westX) / 2
  const spanZ = southZ - northZ + outer * 2
  const midZ = (southZ + northZ) / 2

  // South inner + outer lips
  pushStrip(spanX, copeW, midX, southZ + inner, { alongX: true, gap: southGap, at: 0 })
  pushStrip(spanX, copeW, midX, southZ + outer, { alongX: true, gap: southGap, at: 0 })
  // North
  pushStrip(spanX, copeW, midX, northZ - inner, { alongX: true, gap: sideGap, at: 0 })
  pushStrip(spanX, copeW, midX, northZ - outer, { alongX: true, gap: sideGap, at: 0 })
  // East / west — skip gate at Hoàng thành tâm z
  const sideLen = spanZ - 2
  pushStrip(copeW, sideLen, eastX + inner, midZ, {
    alongX: false,
    gap: sideGap,
    at: IMPERIAL_CITY.centerZ,
  })
  pushStrip(copeW, sideLen, eastX + outer, midZ, {
    alongX: false,
    gap: sideGap,
    at: IMPERIAL_CITY.centerZ,
  })
  pushStrip(copeW, sideLen, westX - inner, midZ, {
    alongX: false,
    gap: sideGap,
    at: IMPERIAL_CITY.centerZ,
  })
  pushStrip(copeW, sideLen, westX - outer, midZ, {
    alongX: false,
    gap: sideGap,
    at: IMPERIAL_CITY.centerZ,
  })

  const mesh = meshFrom(mergeOrNull(geos), stone, 'ngoai-kim-thuy-ke')
  if (mesh) mesh.castShadow = lod === 0
  return mesh
}

/**
 * Assemble full groundwork group.
 * Typical draw calls (lod1): ~16–20 (merged roads/stone/arches + instanced rails/walls).
 */
export function buildGroundwork(lod: Lod = 1): THREE.Group {
  const root = new THREE.Group()
  root.name = 'GroundworkSystem'

  const pavement = buildThanDaoPavement(lod)
  if (pavement) root.add(pavement)

  const curbs = buildCurbs(lod)
  if (curbs) root.add(curbs)

  const loop = buildImperialLoop(lod)
  if (loop) {
    loop.castShadow = false
    root.add(loop)
  }

  buildThaiDichBanks(lod, root)

  const moatBanks = buildNgoaiKimThuyBanks(lod)
  if (moatBanks) root.add(moatBanks)

  buildTrungDaoBridge(lod, root)
  buildSmallBridges(lod, root)
  buildMainSteps(lod, root)
  buildFlowerWalls(lod, root)

  const courts = buildInnerCourts(lod)
  if (courts) {
    courts.castShadow = false
    root.add(courts)
  }

  const noiKe = buildNoiKimThuyBanks(lod)
  if (noiKe) root.add(noiKe)

  buildPartitionWalls(lod, root)

  return root
}
