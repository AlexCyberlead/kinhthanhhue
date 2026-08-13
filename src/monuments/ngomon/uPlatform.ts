import * as THREE from 'three'
import { extrudeWallGeometry } from '../../core/geometry/kit/buildWall'
import { dragonOrnamentGeo, hoiVanBandGeo } from '../../core/geometry/kit/ornament'
import { copyUvToUv2, scaleBoxUvToMeters, uvRepeat } from '../../core/geometry/kit/uvMeters'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import {
  archDressingGeo,
  buildNgoMonBarGeo,
  mergeOrNull,
  meterBox,
  NGO_MON,
  ngoMonLayout,
  ngoMonOpenings,
  type Lod,
} from './geometry'

/**
 * Nền đài chữ U — mở Nam (+Z), 5 lối xuyên (giữa vua, thành bậc rồng).
 * Gạch vồ + đá thanh + sân Bát Tràng + lan can con tiện.
 */
export function buildUPlatform(lod: Lod): THREE.Group {
  const g = new THREE.Group()
  g.name = 'u-platform'

  const brick = getMaterial('gach_vo', lod)
  const stone = getMaterial('da_thanh', lod)
  const tile = getMaterial('gach_bat_trang', lod)
  const lam = getMaterial('phap_lam', lod)

  const { width: W, depth: D, armThickness: A, bodyHeight: H, deckThickness: deckT } = NGO_MON
  const L = ngoMonLayout()
  const openings = ngoMonOpenings()

  if (lod === 2) {
    addLod2Mass(g, brick, stone, W, A, H, L, openings)
    return g
  }

  const barGeo = buildNgoMonBarGeo(lod)
  if (barGeo) {
    const bar = new THREE.Mesh(barGeo, brick)
    bar.name = 'u-bar'
    bar.position.set(0, 0, L.barZ)
    bar.castShadow = true
    bar.receiveShadow = true
    g.add(bar)
  }

  const armPathE = [
    new THREE.Vector3(L.armX, 0, L.barSouthZ + 0.04),
    new THREE.Vector3(L.armX, 0, D / 2),
  ]
  const armPathW = [
    new THREE.Vector3(-L.armX, 0, L.barSouthZ + 0.04),
    new THREE.Vector3(-L.armX, 0, D / 2),
  ]
  for (const [path, name] of [
    [armPathE, 'u-arm-e'],
    [armPathW, 'u-arm-w'],
  ] as const) {
    const geo = extrudeWallGeometry({
      path,
      height: H,
      thickness: A,
      crenellation: false,
      lod,
      tile: uvRepeat('gachVo'),
    })
    const mesh = new THREE.Mesh(geo, brick)
    mesh.name = name
    mesh.castShadow = true
    mesh.receiveShadow = true
    g.add(mesh)
  }

  const plinthH = 0.52
  const plinth = mergeOrNull([
    meterBox(W + 0.95, plinthH, A + 0.55, 0, plinthH / 2, L.barZ, 'daThanh'),
    meterBox(A + 0.55, plinthH, L.armLen + 0.25, L.armX, plinthH / 2, L.armCenterZ, 'daThanh'),
    meterBox(A + 0.55, plinthH, L.armLen + 0.25, -L.armX, plinthH / 2, L.armCenterZ, 'daThanh'),
  ])
  if (plinth) {
    const m = new THREE.Mesh(plinth, stone)
    m.name = 'u-plinth'
    m.castShadow = true
    m.receiveShadow = true
    g.add(m)
  }

  // Khe 3 cm — tránh z-fight mặt trên đài / sàn (chớp trắng khi orbit).
  const deckY = H + 0.03 + deckT / 2
  const deck = mergeOrNull([
    meterBox(W, deckT, A, 0, deckY, L.barZ, 'gachBatTrang'),
    meterBox(A, deckT, L.armLen, L.armX, deckY, L.armCenterZ, 'gachBatTrang'),
    meterBox(A, deckT, L.armLen, -L.armX, deckY, L.armCenterZ, 'gachBatTrang'),
  ])
  if (deck) {
    const m = new THREE.Mesh(deck, tile)
    m.name = 'u-deck'
    m.receiveShadow = true
    g.add(m)
  }

  const court = meterBox(L.courtW - 0.35, 0.1, L.courtD - 0.25, 0, 0.05, L.armCenterZ, 'gachVo')
  const courtMesh = new THREE.Mesh(court, brick)
  courtMesh.name = 'u-court'
  courtMesh.receiveShadow = true
  g.add(courtMesh)

  const dressing = archDressingGeo(openings, A, lod)
  if (dressing) {
    const m = new THREE.Mesh(dressing, stone)
    m.name = 'u-arch-dressing'
    m.position.set(0, 0, L.barZ)
    g.add(m)
  }

  addThresholds(g, lod, openings, L, A, stone)
  addDragonSteps(g, lod, L, stone)
  addSideThresholds(g, lod, openings, L, stone)
  addDeckStairs(g, lod, L, H, stone)
  addPhapLamOnBar(g, lod, openings, L, lam)
  addBalustrade(g, lod, W, D, A, H + deckT, L)

  return g
}

function addLod2Mass(
  g: THREE.Group,
  brick: THREE.Material,
  stone: THREE.Material,
  W: number,
  A: number,
  H: number,
  L: ReturnType<typeof ngoMonLayout>,
  openings: ReturnType<typeof ngoMonOpenings>,
): void {
  const bar = new THREE.Mesh(meterBox(W, H, A, 0, H / 2, L.barZ, 'gachVo'), brick)
  bar.name = 'u-bar'
  g.add(bar)
  for (const sx of [-1, 1] as const) {
    const arm = new THREE.Mesh(
      meterBox(A, H, L.armLen, sx * L.armX, H / 2, L.armCenterZ, 'gachVo'),
      brick,
    )
    arm.name = sx < 0 ? 'u-arm-w' : 'u-arm-e'
    g.add(arm)
  }
  const holeGeo = new THREE.BoxGeometry(3.2, 4.6, A + 0.4)
  const holes = new THREE.InstancedMesh(holeGeo, stone, 5)
  holes.name = 'u-arch-marks'
  const dummy = new THREE.Object3D()
  openings.forEach((o, i) => {
    dummy.position.set(o.x, o.hh * 0.48, L.barZ)
    dummy.scale.set((o.hw * 2) / 3.2, o.hh / 4.6, 1)
    dummy.updateMatrix()
    holes.setMatrixAt(i, dummy.matrix)
  })
  holes.instanceMatrix.needsUpdate = true
  g.add(holes)
  const tile = getMaterial('gach_bat_trang', 2)
  const deck = mergeOrNull([
    meterBox(W * 0.98, 0.28, A * 0.95, 0, H + 0.14, L.barZ, 'gachBatTrang'),
    meterBox(A * 0.95, 0.28, L.armLen * 0.98, L.armX, H + 0.14, L.armCenterZ, 'gachBatTrang'),
    meterBox(A * 0.95, 0.28, L.armLen * 0.98, -L.armX, H + 0.14, L.armCenterZ, 'gachBatTrang'),
  ])
  if (deck) {
    const m = new THREE.Mesh(deck, tile)
    m.name = 'u-deck'
    g.add(m)
  }
}

function addThresholds(
  g: THREE.Group,
  lod: Lod,
  openings: ReturnType<typeof ngoMonOpenings>,
  L: ReturnType<typeof ngoMonLayout>,
  A: number,
  stone: THREE.Material,
): void {
  const parts = openings.map((o, i) => {
    const w = o.hw * 2 + (i === 2 ? 0.55 : 0.25)
    const h = i === 2 ? 0.22 : 0.14
    return meterBox(w, h, A + 0.55, o.x, h / 2, L.barZ, 'daThanh')
  })
  const geo = mergeOrNull(parts)
  if (!geo) return
  const m = new THREE.Mesh(geo, stone)
  m.name = 'u-thresholds'
  m.receiveShadow = lod < 2
  g.add(m)
}

function addDragonSteps(
  g: THREE.Group,
  lod: Lod,
  L: ReturnType<typeof ngoMonLayout>,
  stone: THREE.Material,
): void {
  const royal = NGO_MON.openingWRoyal + 1.15
  const stepN = lod === 0 ? 6 : 4
  const rise = 1.05
  const tread = 0.48
  const parts: THREE.BufferGeometry[] = []
  for (const toward of [1, -1] as const) {
    const faceZ = toward > 0 ? L.barSouthZ : L.barNorthZ
    for (let s = 0; s < stepN; s++) {
      const h = ((s + 1) / stepN) * rise
      const z = faceZ + toward * (tread * (s + 0.5) + 0.08)
      parts.push(meterBox(royal, h, tread, 0, h / 2, z, 'daThanh'))
    }
    const run = tread * stepN
    const cheekH = rise * 0.62
    const cheekZ = faceZ + toward * (run * 0.5 + 0.08)
    parts.push(meterBox(0.28, cheekH, run + 0.12, -royal / 2 - 0.12, cheekH / 2, cheekZ, 'daThanh'))
    parts.push(meterBox(0.28, cheekH, run + 0.12, royal / 2 + 0.12, cheekH / 2, cheekZ, 'daThanh'))
  }
  const geo = mergeOrNull(parts)
  if (geo) {
    const m = new THREE.Mesh(geo, stone)
    m.name = 'u-royal-steps'
    m.receiveShadow = true
    g.add(m)
  }

  const dgeo = dragonOrnamentGeo(0.48, lod === 0 ? 0 : 1)
  if (!dgeo) return
  const gold = getMaterial('vang_thep', lod)
  const faceZ = L.barSouthZ
  const run = tread * stepN
  const pitch = Math.atan2(rise, run)
  for (const side of [-1, 1] as const) {
    const d = new THREE.Mesh(dgeo, gold)
    d.name = side < 0 ? 'rong-bac-trai' : 'rong-bac-phai'
    d.castShadow = true
    d.position.set(side * (royal * 0.5 + 0.1), rise * 0.28, faceZ + run * 0.4)
    d.rotation.set(-pitch * 0.4, side < 0 ? 0 : Math.PI, side * 0.12)
    g.add(d)
  }
}

function addSideThresholds(
  g: THREE.Group,
  lod: Lod,
  openings: ReturnType<typeof ngoMonOpenings>,
  L: ReturnType<typeof ngoMonLayout>,
  stone: THREE.Material,
): void {
  const stepN = lod === 0 ? 4 : 3
  const rise = 0.62
  const tread = 0.4
  const parts: THREE.BufferGeometry[] = []
  for (let i = 0; i < openings.length; i++) {
    if (i === 2) continue
    const o = openings[i]
    const w = o.hw * 2 + 0.35
    for (const toward of [1, -1] as const) {
      const faceZ = toward > 0 ? L.barSouthZ : L.barNorthZ
      for (let s = 0; s < stepN; s++) {
        const h = ((s + 1) / stepN) * rise
        const z = faceZ + toward * (tread * (s + 0.5))
        parts.push(meterBox(w, h, tread, o.x, h / 2, z, 'daThanh'))
      }
    }
  }
  const geo = mergeOrNull(parts)
  if (!geo) return
  const m = new THREE.Mesh(geo, stone)
  m.name = 'u-side-steps'
  m.receiveShadow = true
  g.add(m)
}

/** Cầu thang đá sát mặt trong hai cánh sân → mặt đài. [ước lượng hợp lý] bậc stylized. */
function addDeckStairs(
  g: THREE.Group,
  lod: Lod,
  L: ReturnType<typeof ngoMonLayout>,
  H: number,
  stone: THREE.Material,
): void {
  const stepN = lod === 0 ? 16 : 12
  const tread = 0.44
  const run = tread * stepN
  const stairW = 2.7
  const parts: THREE.BufferGeometry[] = []
  for (const sx of [-1, 1] as const) {
    const x = sx * (L.courtW / 2 - stairW / 2 - 0.22)
    for (let s = 0; s < stepN; s++) {
      const h = ((s + 1) / stepN) * H
      const z = L.barSouthZ + tread * (s + 0.5)
      parts.push(meterBox(stairW, h, tread, x, h / 2, z, 'daThanh'))
    }
    const cheekH = H * 0.52
    const cheekZ = L.barSouthZ + run / 2
    parts.push(meterBox(0.2, cheekH, run + 0.1, x - sx * (stairW / 2 + 0.1), cheekH / 2, cheekZ, 'daThanh'))
  }
  const geo = mergeOrNull(parts)
  if (!geo) return
  const m = new THREE.Mesh(geo, stone)
  m.name = 'u-deck-stairs'
  m.receiveShadow = true
  m.castShadow = lod === 0
  g.add(m)
}

function addPhapLamOnBar(
  g: THREE.Group,
  lod: Lod,
  openings: ReturnType<typeof ngoMonOpenings>,
  L: ReturnType<typeof ngoMonLayout>,
  lam: THREE.Material,
): void {
  const faceZ = L.barSouthZ + 0.06
  const panelW = 3.05
  const panelH = lod === 0 ? 0.95 : 0.78
  const geo = new THREE.BoxGeometry(panelW, panelH, 0.07)
  scaleBoxUvToMeters(geo, panelW, panelH, 0.07, uvRepeat('phapLam'))
  const inst = new THREE.InstancedMesh(geo, lam, openings.length)
  inst.name = 'u-phap-lam-panels'
  inst.castShadow = lod === 0
  const dummy = new THREE.Object3D()
  openings.forEach((o, i) => {
    dummy.position.set(o.x, o.hh + 1.15, faceZ)
    dummy.updateMatrix()
    inst.setMatrixAt(i, dummy.matrix)
  })
  inst.instanceMatrix.needsUpdate = true
  g.add(inst)

  const strip = new THREE.Mesh(
    meterBox(38, 0.22, 0.06, 0, NGO_MON.bodyHeight - 0.72, faceZ + 0.02, 'phapLam'),
    lam,
  )
  strip.name = 'u-phap-lam-strip'
  g.add(strip)

  if (lod === 0) {
    const band = hoiVanBandGeo(Math.min(22, NGO_MON.width * 0.38), 0.26, 0.04, 0)
    if (band) {
      const gold = getMaterial('vang_thep', lod)
      const m = new THREE.Mesh(band, gold)
      m.name = 'u-hoi-van'
      m.position.set(0, NGO_MON.bodyHeight - 0.7, faceZ + 0.04)
      g.add(m)
    }
  }
}

function conTienGeo(h: number, lod: 0 | 1): THREE.BufferGeometry {
  const s = h / 0.72
  const pts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.06 * s, 0.014 * s),
    new THREE.Vector2(0.048 * s, 0.07 * s),
    new THREE.Vector2(0.086 * s, 0.22 * s),
    new THREE.Vector2(0.046 * s, 0.38 * s),
    new THREE.Vector2(0.066 * s, 0.5 * s),
    new THREE.Vector2(0.04 * s, 0.62 * s),
    new THREE.Vector2(0.056 * s, 0.7 * s),
    new THREE.Vector2(0.001, 0.72 * s),
  ]
  const g = new THREE.LatheGeometry(pts, lod === 0 ? 8 : 6)
  copyUvToUv2(g)
  return g
}

function addBalustrade(
  g: THREE.Group,
  lod: Lod,
  W: number,
  D: number,
  A: number,
  y: number,
  L: ReturnType<typeof ngoMonLayout>,
): void {
  const stone = getMaterial('da_thanh', lod)
  const railH = lod === 0 ? 0.72 : 0.64
  const positions: [number, number, number][] = []
  const dense = lod === 0 ? 1.15 : 1.7

  const pushLine = (x0: number, z0: number, x1: number, z1: number) => {
    const dx = x1 - x0
    const dz = z1 - z0
    const len = Math.hypot(dx, dz)
    const n = Math.max(2, Math.floor(len / dense))
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1)
      positions.push([x0 + dx * t, y, z0 + dz * t])
    }
  }

  const innerX = L.courtW / 2 - 0.18
  const innerZ = L.barSouthZ + 0.22
  const tipZ = D / 2 - 0.28
  const northZ = L.barNorthZ + 0.22
  const outerX = W / 2 - 0.22
  const stairClear = 3.4

  pushLine(-innerX + stairClear, innerZ, innerX - stairClear, innerZ)
  pushLine(innerX, innerZ + 7.2, innerX, tipZ)
  pushLine(-innerX, innerZ + 7.2, -innerX, tipZ)
  pushLine(L.armX - A / 2 + 0.25, tipZ, L.armX + A / 2 - 0.25, tipZ)
  pushLine(-L.armX - A / 2 + 0.25, tipZ, -L.armX + A / 2 - 0.25, tipZ)
  pushLine(-outerX, northZ, outerX, northZ)
  pushLine(outerX, northZ, outerX, tipZ)
  pushLine(-outerX, northZ, -outerX, tipZ)

  if (positions.length === 0) return

  const tien = new THREE.InstancedMesh(conTienGeo(railH, lod === 0 ? 0 : 1), stone, positions.length)
  tien.name = 'u-con-tien'
  const dummy = new THREE.Object3D()
  positions.forEach((p, i) => {
    dummy.position.set(p[0], p[1], p[2])
    dummy.updateMatrix()
    tien.setMatrixAt(i, dummy.matrix)
  })
  tien.instanceMatrix.needsUpdate = true
  g.add(tien)

  const railY = y + railH + 0.03
  const rails = mergeOrNull([
    meterBox(L.courtW - 0.5, 0.08, 0.1, 0, railY, innerZ, 'daThanh'),
    meterBox(0.1, 0.08, L.courtD - 0.4, innerX, railY, L.armCenterZ, 'daThanh'),
    meterBox(0.1, 0.08, L.courtD - 0.4, -innerX, railY, L.armCenterZ, 'daThanh'),
    meterBox(W - 0.5, 0.08, 0.1, 0, railY, northZ, 'daThanh'),
  ])
  if (rails) {
    const m = new THREE.Mesh(rails, stone)
    m.name = 'u-rails'
    g.add(m)
  }
}
