import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'

/**
 * Moss / grass patches on foundation — marks ruin↔reconstructed status.
 * Uses InstancedMesh to stay draw-call friendly.
 */
function addMossPatches(parent: THREE.Group, lod: 0 | 1 | 2, halfW: number, halfD: number): void {
  if (lod === 2) return
  const grass = getMaterial('co_xanh', lod)
  const count = lod === 0 ? 14 : 8
  const geo = new THREE.BoxGeometry(1.4, 0.06, 0.9)
  const mesh = new THREE.InstancedMesh(geo, grass, count)
  mesh.name = 'mossPatches'
  mesh.receiveShadow = true
  const dummy = new THREE.Object3D()
  // Deterministic scatter around platform rim
  const seeds: [number, number][] = [
    [-0.72, 0.78],
    [0.68, 0.82],
    [-0.85, -0.55],
    [0.8, -0.6],
    [-0.35, 0.9],
    [0.4, 0.88],
    [-0.9, 0.15],
    [0.92, -0.1],
    [-0.55, -0.85],
    [0.5, -0.9],
    [-0.15, 0.75],
    [0.2, -0.78],
    [-0.78, 0.45],
    [0.75, 0.5],
  ]
  for (let i = 0; i < count; i++) {
    const [nx, nz] = seeds[i]
    dummy.position.set(nx * halfW, 0.04, nz * halfD)
    dummy.rotation.y = (i * 0.7) % Math.PI
    dummy.scale.set(0.7 + (i % 3) * 0.2, 1, 0.65 + (i % 2) * 0.25)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  parent.add(mesh)
}

/**
 * Phục dựng stylized — nền móng + cột + mái hoàng lưu ly.
 * Default cho MonumentModule.build().
 */
export function buildCanChanhRestored(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'dien-can-chanh'
  root.userData.mode = 'restored'

  const plaster = getMaterial('tuong_voi', lod)
  const wood = getMaterial('go_lim', lod)
  const son = getMaterial('go_son_son', lod)
  const stone = getMaterial('da_thanh', lod)

  const platH = 1.35
  const W = lod === 2 ? 28 : 34
  const D = lod === 2 ? 18 : 22
  const colH = lod === 2 ? 5.2 : 6.2

  const platform = buildPlatform({
    width: W + 4,
    depth: D + 4,
    height: platH,
    steps: lod === 2 ? 2 : lod === 1 ? 4 : 6,
    balustrade: lod === 0,
    lod,
  })
  root.add(platform)

  // Moss on restored foundation — site is historically ruin / under reconstruction
  addMossPatches(root, lod, (W + 4) / 2, (D + 4) / 2)

  const floorY = platH

  // Floor deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(W, 0.2, D), stone)
  deck.position.y = floorY + 0.1
  deck.receiveShadow = true
  root.add(deck)

  if (lod === 2) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(W * 0.92, colH, D * 0.92), plaster)
    mass.position.y = floorY + colH / 2
    root.add(mass)
  } else {
    // Perimeter walls — open south (+Z) toward Đại Cung / triều
    const t = 0.45
    const wallH = colH * 0.92
    for (const x of [-W / 2 + t / 2, W / 2 - t / 2]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(t, wallH, D * 0.88), plaster)
      side.position.set(x, floorY + wallH / 2, 0)
      side.castShadow = true
      side.receiveShadow = true
      root.add(side)
    }
    const rear = new THREE.Mesh(new THREE.BoxGeometry(W * 0.92, wallH, t), plaster)
    rear.position.set(0, floorY + wallH / 2, -D / 2 + t / 2)
    rear.castShadow = true
    root.add(rear)

    // Front breast panels flanking royal axis
    const breastH = wallH * 0.38
    for (const x of [-W * 0.32, W * 0.32]) {
      const breast = new THREE.Mesh(new THREE.BoxGeometry(W * 0.28, breastH, t), plaster)
      breast.position.set(x, floorY + breastH / 2, D / 2 - t / 2)
      root.add(breast)
    }

    // Central door
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.2, wallH * 0.78, 0.3), son)
    frame.position.set(0, floorY + wallH * 0.39, D / 2 - 0.2)
    root.add(frame)
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(2.7, wallH * 0.7, 0.12), wood)
    leaf.position.set(0, floorY + wallH * 0.36, D / 2 - 0.08)
    root.add(leaf)

    // Column grid — nền móng + cột
    const cols = buildColumnGrid({
      rows: lod === 0 ? 5 : 3,
      cols: lod === 0 ? 7 : 5,
      spacing:
        lod === 0
          ? ([4.6, 4.2] as [number, number])
          : ([6.0, 6.5] as [number, number]),
      height: colH,
      radius: 0.3,
      material: 'go_son_son',
      lod,
    })
    cols.position.y = floorY
    root.add(cols)
  }

  const beamY = floorY + colH
  if (lod < 2) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(W + 0.8, 0.28, D + 0.8), wood)
    plate.position.y = beamY
    plate.receiveShadow = true
    root.add(plate)
  }

  if (lod === 0) {
    for (const x of [-W / 2 + 2, 0, W / 2 - 2]) {
      for (const z of [-D / 2 + 1.5, D / 2 - 1.5]) {
        const br = buildBracketSet({ width: 1.6, depth: 1.1, height: 0.8, layers: 3, lod })
        br.position.set(x, beamY - 0.05, z)
        root.add(br)
      }
    }
  }

  const roof = buildRoof({
    width: lod === 2 ? W + 2 : W + 4,
    depth: lod === 2 ? D + 2 : D + 3.5,
    tiers: lod === 0 ? 2 : 1,
    tileMaterial: 'ngoi_hoang_luu_ly',
    ridgeOrnament: lod === 0 ? 'dragon' : 'none',
    curvature: 0.9,
    lod,
  })
  roof.position.y = beamY + (lod === 2 ? 0 : 0.15)
  root.add(roof)

  if (lod === 0) {
    const gold = getMaterial('vang_thep', lod)
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 10), gold)
    finial.position.y = beamY + 4.2
    root.add(finial)
  }

  return root
}

/**
 * Phế tích — nền gạch vồ, gốc cột gãy, rêu phong, không mái.
 * Wave C / orchestrator gọi khi `reconstructionMode === 'ruin'`.
 * Không gắn vào MonumentModule.build — giữ build() pure restored.
 */
export function buildCanChanhRuin(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'dien-can-chanh-ruin'
  root.userData.mode = 'ruin'

  const brick = getMaterial('gach_vo', lod)
  const stone = getMaterial('da_thanh', lod)
  const wood = getMaterial('go_lim', lod)

  const platH = 0.85
  const W = lod === 2 ? 26 : 32
  const D = lod === 2 ? 16 : 20

  // Broken / weathered foundation
  const foundation = new THREE.Mesh(new THREE.BoxGeometry(W + 3, platH, D + 3), brick)
  foundation.position.y = platH / 2
  foundation.receiveShadow = true
  foundation.castShadow = lod < 2
  root.add(foundation)

  // Uneven rubble lip
  if (lod < 2) {
    const rubbleGeo = new THREE.BoxGeometry(2.2, 0.35, 1.4)
    const spots: [number, number][] = [
      [-W * 0.4, D * 0.45],
      [W * 0.38, D * 0.42],
      [-W * 0.35, -D * 0.4],
      [W * 0.42, -D * 0.38],
      [0, D * 0.48],
    ]
    for (const [x, z] of spots) {
      const r = new THREE.Mesh(rubbleGeo, stone)
      r.position.set(x, platH + 0.12, z)
      r.rotation.y = x * 0.1
      root.add(r)
    }
  }

  addMossPatches(root, lod, (W + 3) / 2, (D + 3) / 2)

  // Column stumps — truncated cylinders
  if (lod < 2) {
    const stumpH = lod === 0 ? 1.4 : 1.0
    const radial = lod === 0 ? 8 : 5
    const geo = new THREE.CylinderGeometry(0.28, 0.32, stumpH, radial)
    const rows = lod === 0 ? 4 : 3
    const cols = lod === 0 ? 6 : 4
    const count = rows * cols
    const mesh = new THREE.InstancedMesh(geo, wood, count)
    mesh.name = 'columnStumps'
    mesh.castShadow = true
    const sx = 4.8
    const sz = 4.4
    const ox = -((cols - 1) * sx) / 2
    const oz = -((rows - 1) * sz) / 2
    const dummy = new THREE.Object3D()
    let i = 0
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Skip a few to look incomplete
        if ((r + c) % 5 === 0) {
          dummy.position.set(999, -99, 999) // hide
          dummy.scale.set(0.001, 0.001, 0.001)
        } else {
          const hJitter = 0.7 + ((r * 3 + c) % 4) * 0.12
          dummy.position.set(ox + c * sx, platH + (stumpH * hJitter) / 2, oz + r * sz)
          dummy.scale.set(1, hJitter, 1)
          dummy.rotation.set(0.02 * ((c % 3) - 1), 0, 0.03 * ((r % 3) - 1))
        }
        dummy.updateMatrix()
        mesh.setMatrixAt(i++, dummy.matrix)
        dummy.scale.set(1, 1, 1)
        dummy.rotation.set(0, 0, 0)
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    root.add(mesh)
  } else {
    // LOD2: single ruined mass
    const mass = new THREE.Mesh(new THREE.BoxGeometry(W * 0.7, 1.2, D * 0.65), brick)
    mass.position.y = platH + 0.6
    root.add(mass)
  }

  // Collapsed beam fragment (LOD0)
  if (lod === 0) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(8, 0.35, 0.4), wood)
    beam.position.set(3, platH + 0.55, -2)
    beam.rotation.set(0.15, 0.4, 0.35)
    root.add(beam)
  }

  return root
}

/**
 * Điện Cần Chánh — thường triều; phá 1947; đang phục dựng (Waseda/TTBTDT).
 * `build()` = restored. Ruin: gọi `buildCanChanhRuin(lod)` từ Wave C/orchestrator
 * khi `useAppStore.reconstructionMode === 'ruin'`.
 */
export const dienCanChanh: MonumentModule = {
  id: 'dien-can-chanh',
  displayName: { vi: 'Điện Cần Chánh', en: 'Can Chanh Hall' },
  build: buildCanChanhRestored,
  anchor: [0, 1, -145],
  rotationY: 0,
  boundingRadius: 45,
  poi: {
    vi: 'Điện Cần Chánh — nơi thường triều; phá 1947; đang dự án phục dựng (Waseda/TTBTDT). Bản mesh mặc định = restored + rêu phong. Anchor [ước lượng hợp lý].',
    en: 'Can Chanh Hall — daily court; destroyed 1947; reconstruction project (Waseda). Default mesh = restored + moss. Anchor [estimated].',
    year: '1804',
  },
}
