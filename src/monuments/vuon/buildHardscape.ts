import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { createRng, mergeGeometries, potGeo, randRange, rockGeo } from './geometry'

export type GardenStyle = 'co-ha' | 'thieu-phuong'

export type GardenHardscapeOpts = {
  lod: 0 | 1 | 2
  style: GardenStyle
  /** Garden half-width (X) / half-depth (Z) in metres. */
  halfW: number
  halfD: number
  seed: number
}

/**
 * Hardscape-only garden architecture — no trees (VegetationSystem owns foliage).
 *
 * Draw-call budget (measured):
 *  lod0: 10+9=19 · lod1: 9+8=17 · lod2: 6+6=12  (package ≤ 20)
 *
 * Mesh list per garden:
 *  1 path InstancedMesh · 1 pond water · 1 pond rim · 1 rocks InstancedMesh
 *  1 pots InstancedMesh · 1–3 screen (bình phong) · (+1 bridge on co-ha, lod 0/1)
 */
export function buildGardenHardscape(opts: GardenHardscapeOpts): THREE.Group {
  const { lod, style, halfW, halfD, seed } = opts
  const root = new THREE.Group()
  root.name = `garden-hardscape-${style}`

  const stone = getMaterial('da_thanh', lod)
  const plaster = getMaterial('tuong_voi', lod)
  const tile = getMaterial('gach_bat_trang', lod)
  const enamel = getMaterial('phap_lam', lod)
  const water = getMaterial('nuoc', lod)
  const wood = getMaterial('go_lim', lod)
  const brick = getMaterial('gach_vo', lod)
  const tileRoof = getMaterial('ngoi_thanh_luu_ly', lod)

  const rng = createRng(seed)
  const dummy = new THREE.Object3D()

  // --- 1. Lối đi đá ---
  const pathCount = lod === 2 ? 8 : lod === 1 ? 18 : 28
  const pathGeo = new THREE.BoxGeometry(lod === 2 ? 1.2 : 1.05, 0.1, lod === 2 ? 0.9 : 0.75)
  const paths = new THREE.InstancedMesh(pathGeo, stone, pathCount)
  for (let i = 0; i < pathCount; i++) {
    const along = i / Math.max(1, pathCount - 1)
    let x: number
    let z: number
    let rot = 0
    if (i < pathCount * 0.45) {
      x = randRange(rng, -0.4, 0.4)
      z = -halfD * 0.85 + along * halfD * 1.9
      rot = randRange(rng, -0.08, 0.08)
    } else if (i < pathCount * 0.75) {
      const t = (i - pathCount * 0.45) / Math.max(1, pathCount * 0.3)
      x = -halfW * 0.55 + t * halfW * 1.1
      z = randRange(rng, -1.2, 1.2)
      rot = Math.PI / 2 + randRange(rng, -0.1, 0.1)
    } else {
      const t = (i - pathCount * 0.75) / Math.max(1, pathCount * 0.25)
      x = Math.cos(t * Math.PI * 2) * halfW * 0.72
      z = Math.sin(t * Math.PI * 2) * halfD * 0.65
      rot = t * Math.PI * 2 + Math.PI / 2
    }
    dummy.position.set(x, 0.05, z)
    dummy.rotation.set(0, rot, 0)
    const s = randRange(rng, 0.85, 1.15)
    dummy.scale.set(s, 1, s * randRange(rng, 0.9, 1.1))
    dummy.updateMatrix()
    paths.setMatrixAt(i, dummy.matrix)
  }
  paths.instanceMatrix.needsUpdate = true
  paths.castShadow = lod === 0
  paths.receiveShadow = true
  paths.name = 'stone-path'
  root.add(paths)

  // --- 2–3. Hồ nhỏ ---
  const pondRx = style === 'thieu-phuong' ? Math.min(9, halfW * 0.28) : Math.min(7.5, halfW * 0.24)
  const pondRz = style === 'thieu-phuong' ? Math.min(6.5, halfD * 0.22) : Math.min(5.5, halfD * 0.2)
  const pondX = style === 'thieu-phuong' ? halfW * 0.12 : -halfW * 0.08
  const pondZ = style === 'thieu-phuong' ? -halfD * 0.05 : halfD * 0.08
  const pondSeg = lod === 2 ? 8 : 16

  const waterMesh = new THREE.Mesh(new THREE.CircleGeometry(1, pondSeg), water)
  waterMesh.scale.set(pondRx, pondRz, 1)
  waterMesh.rotation.x = -Math.PI / 2
  waterMesh.position.set(pondX, 0.02, pondZ)
  waterMesh.receiveShadow = true
  waterMesh.name = 'pond-water'
  root.add(waterMesh)

  const rim = new THREE.Mesh(new THREE.TorusGeometry(1, lod === 2 ? 0.12 : 0.1, 4, pondSeg), brick)
  rim.scale.set(pondRx, pondRz, 1)
  rim.rotation.x = -Math.PI / 2
  rim.position.set(pondX, 0.08, pondZ)
  rim.name = 'pond-rim'
  root.add(rim)

  // --- 4. Non bộ ---
  const rockCount = lod === 2 ? 5 : lod === 1 ? 12 : 18
  const rocks = new THREE.InstancedMesh(rockGeo(lod === 0 ? 1 : 0), stone, rockCount)
  for (let i = 0; i < rockCount; i++) {
    const a = randRange(rng, -Math.PI * 0.55, Math.PI * 0.55)
    const r = randRange(rng, pondRx * 0.7, pondRx * 1.35)
    const sx = randRange(rng, 0.45, lod === 2 ? 1.1 : 1.6)
    const sy = randRange(rng, 0.5, lod === 2 ? 1.4 : 2.2)
    const sz = randRange(rng, 0.4, 1.3)
    dummy.position.set(
      pondX + Math.cos(a) * r * 0.55,
      sy * 0.35,
      pondZ - pondRz * 0.85 - Math.abs(Math.sin(a)) * r * 0.35,
    )
    dummy.rotation.set(randRange(rng, -0.3, 0.3), randRange(rng, 0, Math.PI * 2), randRange(rng, -0.2, 0.2))
    dummy.scale.set(sx, sy, sz)
    dummy.updateMatrix()
    rocks.setMatrixAt(i, dummy.matrix)
  }
  rocks.instanceMatrix.needsUpdate = true
  rocks.castShadow = lod < 2
  rocks.receiveShadow = true
  rocks.name = 'non-bo'
  root.add(rocks)

  // --- 5. Chậu cảnh ---
  const potCount = lod === 2 ? 4 : lod === 1 ? 10 : 16
  const pots = new THREE.InstancedMesh(potGeo(), tile, potCount)
  for (let i = 0; i < potCount; i++) {
    const side = i % 4
    let x = 0
    let z = 0
    if (side === 0) {
      x = -halfW * 0.78
      z = -halfD * 0.6 + (i / potCount) * halfD * 1.2
    } else if (side === 1) {
      x = halfW * 0.78
      z = -halfD * 0.55 + (i / potCount) * halfD * 1.15
    } else if (side === 2) {
      x = -halfW * 0.5 + (i / potCount) * halfW
      z = halfD * 0.78
    } else {
      x = -halfW * 0.45 + (i / potCount) * halfW * 0.9
      z = -halfD * 0.8
    }
    if (Math.hypot(x - pondX, z - pondZ) < Math.max(pondRx, pondRz) + 1.5) {
      x += pondRx * 1.2
    }
    const s = randRange(rng, 0.85, 1.25)
    dummy.position.set(x, 0.28 * s, z)
    dummy.rotation.set(0, randRange(rng, 0, Math.PI * 2), 0)
    dummy.scale.set(s, s, s)
    dummy.updateMatrix()
    pots.setMatrixAt(i, dummy.matrix)
  }
  pots.instanceMatrix.needsUpdate = true
  pots.castShadow = lod === 0
  pots.name = 'chau-canh'
  root.add(pots)

  // --- Bình phong long mã ---
  root.add(buildBinhPhong({ lod, style, halfW, halfD, plaster, stone, enamel, wood, tileRoof }))

  // --- Cầu gỗ nhỏ (Cơ Hạ / Kim Nghê cue) ---
  if (style === 'co-ha' && lod < 2) {
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(pondRx * 1.6, 0.12, 1.1), wood)
    bridge.position.set(pondX, 0.18, pondZ)
    bridge.rotation.y = 0.4
    bridge.castShadow = lod === 0
    bridge.name = 'cau-kim-nghe-stub'
    root.add(bridge)
  }

  dummy.scale.set(1, 1, 1)
  dummy.rotation.set(0, 0, 0)

  return root
}

function buildBinhPhong(args: {
  lod: 0 | 1 | 2
  style: GardenStyle
  halfW: number
  halfD: number
  plaster: THREE.Material
  stone: THREE.Material
  enamel: THREE.Material
  wood: THREE.Material
  tileRoof: THREE.Material
}): THREE.Group {
  const { lod, style, halfW, halfD, plaster, stone, enamel, wood, tileRoof } = args
  const screenW = lod === 2 ? Math.min(10, halfW * 0.55) : Math.min(14, halfW * 0.7)
  const screenH = lod === 2 ? 2.4 : 3.2
  const screen = new THREE.Group()
  screen.name = 'binh-phong-long-ma'
  screen.position.set(style === 'co-ha' ? halfW * 0.55 : -halfW * 0.5, 0, -halfD * 0.55)
  screen.rotation.y = style === 'co-ha' ? -0.35 : 0.4

  if (lod === 2) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(screenW, screenH + 0.35, 0.45), plaster)
    mass.position.y = (screenH + 0.35) / 2
    screen.add(mass)
    return screen
  }

  // Merged plinth + wall → 1 DC (stone body; enamel medal carries colour accent).
  const plinthGeo = new THREE.BoxGeometry(screenW + 0.6, 0.35, 0.7)
  plinthGeo.translate(0, 0.175, 0)
  const wallGeo = new THREE.BoxGeometry(screenW, screenH, 0.28)
  wallGeo.translate(0, 0.35 + screenH / 2, 0)
  const bodyGeo = mergeGeometries([plinthGeo, wallGeo])
  plinthGeo.dispose()
  wallGeo.dispose()
  const body = new THREE.Mesh(bodyGeo, stone)
  body.castShadow = lod === 0
  screen.add(body)

  const cap = new THREE.Mesh(new THREE.BoxGeometry(screenW + 0.5, 0.22, 0.55), tileRoof)
  cap.position.y = 0.35 + screenH + 0.12
  screen.add(cap)

  // Long mã medallion (pháp lam) — stylized enamel disc (+ stroke InstancedMesh on lod0)
  const medR = Math.min(0.85, screenH * 0.22)
  const medal = new THREE.Mesh(new THREE.CircleGeometry(medR, lod === 0 ? 16 : 10), enamel)
  medal.position.set(0, 0.35 + screenH * 0.55, 0.16)
  screen.add(medal)

  if (lod === 0) {
    const strokeGeo = new THREE.BoxGeometry(1, 0.12, 0.06)
    const strokes = new THREE.InstancedMesh(strokeGeo, wood, 3)
    const d2 = new THREE.Object3D()
    const defs: Array<{ p: [number, number, number]; s: [number, number, number]; r: number }> = [
      { p: [0, 0.35 + screenH * 0.38, 0.17], s: [medR * 1.6, 1, 1], r: -0.25 },
      { p: [-medR * 0.35, 0.35 + screenH * 0.48, 0.17], s: [medR * 0.9, 1, 1], r: 0.6 },
      { p: [medR * 0.4, 0.35 + screenH * 0.62, 0.17], s: [medR * 1.1, 1, 1], r: -0.9 },
    ]
    defs.forEach((def, i) => {
      d2.position.set(...def.p)
      d2.rotation.set(0, 0, def.r)
      d2.scale.set(...def.s)
      d2.updateMatrix()
      strokes.setMatrixAt(i, d2.matrix)
    })
    strokes.instanceMatrix.needsUpdate = true
    screen.add(strokes)
  }

  return screen
}
