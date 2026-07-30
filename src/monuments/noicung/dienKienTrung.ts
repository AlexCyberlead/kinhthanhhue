import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'

/**
 * Moss patches — ruin↔reconstructed cue (InstancedMesh).
 */
function addMossPatches(parent: THREE.Group, lod: 0 | 1 | 2, halfW: number, halfD: number): void {
  if (lod === 2) return
  const grass = getMaterial('co_xanh', lod)
  const count = lod === 0 ? 12 : 6
  const geo = new THREE.BoxGeometry(1.3, 0.05, 0.85)
  const mesh = new THREE.InstancedMesh(geo, grass, count)
  mesh.name = 'mossPatches'
  mesh.receiveShadow = true
  const dummy = new THREE.Object3D()
  const seeds: [number, number][] = [
    [-0.7, 0.8],
    [0.65, 0.78],
    [-0.82, -0.5],
    [0.78, -0.55],
    [-0.4, 0.88],
    [0.35, 0.9],
    [-0.88, 0.1],
    [0.9, -0.15],
    [-0.5, -0.82],
    [0.48, -0.85],
    [-0.2, 0.72],
    [0.22, -0.75],
  ]
  for (let i = 0; i < count; i++) {
    const [nx, nz] = seeds[i]
    dummy.position.set(nx * halfW, 0.04, nz * halfD)
    dummy.rotation.y = (i * 0.65) % Math.PI
    dummy.scale.set(0.7 + (i % 3) * 0.18, 1, 0.65 + (i % 2) * 0.2)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  parent.add(mesh)
}

/**
 * Western-style classical columns with simple capital — Đông–Tây mix (Khải Định).
 * Single InstancedMesh for shafts + optional capital ring as second IM (LOD0 only).
 */
function addWesternColumns(
  parent: THREE.Group,
  lod: 0 | 1 | 2,
  opts: { rows: number; cols: number; sx: number; sz: number; height: number; y: number },
): void {
  const { rows, cols, sx, sz, height, y } = opts
  const stone = getMaterial('da_thanh', lod)
  const plaster = getMaterial('tuong_voi', lod)
  const radial = lod === 0 ? 10 : 6
  const shaftGeo = new THREE.CylinderGeometry(0.26, 0.3, height, radial)
  const count = rows * cols
  const shafts = new THREE.InstancedMesh(shaftGeo, plaster, count)
  shafts.name = 'westernColumns'
  shafts.castShadow = lod < 2
  const dummy = new THREE.Object3D()
  const ox = -((cols - 1) * sx) / 2
  const oz = -((rows - 1) * sz) / 2
  let i = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dummy.position.set(ox + c * sx, y + height / 2, oz + r * sz)
      dummy.updateMatrix()
      shafts.setMatrixAt(i++, dummy.matrix)
    }
  }
  shafts.instanceMatrix.needsUpdate = true
  parent.add(shafts)

  if (lod === 0) {
    const capGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.28, 8)
    const caps = new THREE.InstancedMesh(capGeo, stone, count)
    caps.name = 'westernCapitals'
    i = 0
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dummy.position.set(ox + c * sx, y + height + 0.14, oz + r * sz)
        dummy.updateMatrix()
        caps.setMatrixAt(i++, dummy.matrix)
      }
    }
    caps.instanceMatrix.needsUpdate = true
    parent.add(caps)

    const baseGeo = new THREE.CylinderGeometry(0.34, 0.36, 0.22, 8)
    const bases = new THREE.InstancedMesh(baseGeo, stone, count)
    bases.name = 'westernBases'
    i = 0
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dummy.position.set(ox + c * sx, y + 0.11, oz + r * sz)
        dummy.updateMatrix()
        bases.setMatrixAt(i++, dummy.matrix)
      }
    }
    bases.instanceMatrix.needsUpdate = true
    parent.add(bases)
  }
}

/**
 * Điện Kiến Trung — phục dựng stylized Đông–Tây (Khải Định 1921–23 / TTBTDT 2018+).
 * Cột cổ điển Tây + mái hoàng lưu ly Đông; pháp lam facade accents.
 *
 * LOD1 budget: platform(4) + facade(1) + rear(1) + sides(2) + arch(1)
 * + west cols(1) + plate(1) + phap_lam(1) + door(2) + roof(3) + moss(1) ≈ 18 DC.
 */
export function buildKienTrungRestored(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'dien-kien-trung'
  root.userData.mode = 'restored'

  const plaster = getMaterial('tuong_voi', lod)
  const wood = getMaterial('go_lim', lod)
  const son = getMaterial('go_son_son', lod)
  const stone = getMaterial('da_thanh', lod)
  const phapLam = getMaterial('phap_lam', lod)

  const platH = 1.4
  const W = lod === 2 ? 26 : 32
  const D = lod === 2 ? 16 : 20
  const wallH = lod === 2 ? 5.5 : 6.8

  const platform = buildPlatform({
    width: W + 5,
    depth: D + 5,
    height: platH,
    steps: lod === 2 ? 2 : lod === 1 ? 3 : 6,
    balustrade: lod === 0,
    lod,
  })
  root.add(platform)

  addMossPatches(root, lod, (W + 5) / 2, (D + 5) / 2)

  const floorY = platH

  // Floor deck — western polished stone cue
  const deck = new THREE.Mesh(new THREE.BoxGeometry(W, 0.18, D), stone)
  deck.position.y = floorY + 0.09
  deck.receiveShadow = true
  root.add(deck)

  if (lod === 2) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(W * 0.9, wallH, D * 0.9), plaster)
    mass.position.y = floorY + wallH / 2
    root.add(mass)
  } else {
    const t = 0.5
    // Side + rear walls
    for (const x of [-W / 2 + t / 2, W / 2 - t / 2]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(t, wallH, D * 0.9), plaster)
      side.position.set(x, floorY + wallH / 2, 0)
      side.castShadow = true
      side.receiveShadow = true
      root.add(side)
    }
    const rear = new THREE.Mesh(new THREE.BoxGeometry(W * 0.92, wallH, t), plaster)
    rear.position.set(0, floorY + wallH / 2, -D / 2 + t / 2)
    rear.castShadow = true
    root.add(rear)

    // Front facade — western pediment-ish breast with central arch void
    const breastH = wallH * 0.55
    for (const x of [-W * 0.3, W * 0.3]) {
      const breast = new THREE.Mesh(new THREE.BoxGeometry(W * 0.28, breastH, t), plaster)
      breast.position.set(x, floorY + breastH / 2, D / 2 - t / 2)
      root.add(breast)
    }
    // Arch header (stylized western)
    const arch = new THREE.Mesh(new THREE.BoxGeometry(W * 0.28, wallH * 0.28, t * 0.9), plaster)
    arch.position.set(0, floorY + wallH * 0.72, D / 2 - t / 2)
    root.add(arch)

    // Pháp lam facade frieze
    const frieze = new THREE.Mesh(new THREE.BoxGeometry(W * 0.85, 0.4, 0.2), phapLam)
    frieze.position.set(0, floorY + wallH * 0.62, D / 2 + 0.05)
    root.add(frieze)

    // Central door (son + wood)
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.4, wallH * 0.55, 0.28), son)
    frame.position.set(0, floorY + wallH * 0.28, D / 2 - 0.15)
    root.add(frame)
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(2.9, wallH * 0.48, 0.12), wood)
    leaf.position.set(0, floorY + wallH * 0.25, D / 2 - 0.02)
    root.add(leaf)

    // Western peristyle — classical shafts (Đông–Tây)
    addWesternColumns(root, lod, {
      rows: lod === 0 ? 3 : 2,
      cols: lod === 0 ? 6 : 4,
      sx: lod === 0 ? 4.8 : 7.0,
      sz: lod === 0 ? 5.5 : 7.5,
      height: wallH - 0.4,
      y: floorY,
    })

    // Inner timber grid (Eastern structural cue) — LOD0 only
    if (lod === 0) {
      const inner = buildColumnGrid({
        rows: 2,
        cols: 3,
        spacing: [6.5, 6.0] as [number, number],
        height: wallH - 0.6,
        radius: 0.22,
        material: 'go_son_son',
        lod,
      })
      inner.position.y = floorY
      inner.name = 'innerTimberCols'
      root.add(inner)
    }
  }

  const beamY = floorY + wallH
  if (lod < 2) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(W + 1.0, 0.3, D + 1.0), wood)
    plate.position.y = beamY
    plate.receiveShadow = true
    root.add(plate)
  }

  if (lod === 0) {
    for (const x of [-W / 2 + 2.5, 0, W / 2 - 2.5]) {
      for (const z of [-D / 2 + 1.8, D / 2 - 1.8]) {
        const br = buildBracketSet({ width: 1.5, depth: 1.1, height: 0.75, layers: 3, lod })
        br.position.set(x, beamY - 0.05, z)
        root.add(br)
      }
    }
  }

  // Traditional Vietnamese roof on western body — Đông–Tây signature
  const roof = buildRoof({
    width: lod === 2 ? W + 2 : W + 4.5,
    depth: lod === 2 ? D + 2 : D + 3.5,
    tiers: lod === 0 ? 2 : 1,
    tileMaterial: 'ngoi_hoang_luu_ly',
    ridgeOrnament: lod === 0 ? 'dragon' : 'none',
    curvature: 0.88,
    lod,
  })
  roof.position.y = beamY + (lod === 2 ? 0 : 0.12)
  root.add(roof)

  if (lod === 0) {
    const gold = getMaterial('vang_thep', lod)
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 10), gold)
    finial.position.y = beamY + 4.5
    root.add(finial)
  }

  return root
}

/**
 * Phế tích Kiến Trung — nền gạch, gốc cột Tây gãy, không mái.
 * Orchestrator gọi khi `reconstructionMode === 'ruin'`.
 */
export function buildKienTrungRuin(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'dien-kien-trung-ruin'
  root.userData.mode = 'ruin'

  const brick = getMaterial('gach_vo', lod)
  const stone = getMaterial('da_thanh', lod)
  const plaster = getMaterial('tuong_voi', lod)

  const platH = 0.9
  const W = lod === 2 ? 24 : 30
  const D = lod === 2 ? 14 : 18

  const foundation = new THREE.Mesh(new THREE.BoxGeometry(W + 4, platH, D + 4), brick)
  foundation.position.y = platH / 2
  foundation.receiveShadow = true
  foundation.castShadow = lod < 2
  root.add(foundation)

  addMossPatches(root, lod, (W + 4) / 2, (D + 4) / 2)

  if (lod < 2) {
    // Rubble lip
    const rubbleGeo = new THREE.BoxGeometry(2.0, 0.4, 1.3)
    const spots: [number, number][] = [
      [-W * 0.38, D * 0.42],
      [W * 0.36, D * 0.4],
      [-W * 0.32, -D * 0.38],
      [W * 0.4, -D * 0.35],
      [0, D * 0.46],
    ]
    if (lod === 1) {
      // Merge rubble into one InstancedMesh for DC budget
      const rubble = new THREE.InstancedMesh(rubbleGeo, stone, spots.length)
      const dummy = new THREE.Object3D()
      spots.forEach(([x, z], i) => {
        dummy.position.set(x, platH + 0.15, z)
        dummy.rotation.y = x * 0.08
        dummy.updateMatrix()
        rubble.setMatrixAt(i, dummy.matrix)
      })
      rubble.instanceMatrix.needsUpdate = true
      root.add(rubble)
    } else {
      for (const [x, z] of spots) {
        const r = new THREE.Mesh(rubbleGeo, stone)
        r.position.set(x, platH + 0.15, z)
        r.rotation.y = x * 0.08
        root.add(r)
      }
    }

    // Broken western column stumps
    const stumpH = lod === 0 ? 1.6 : 1.1
    const geo = new THREE.CylinderGeometry(0.28, 0.34, stumpH, lod === 0 ? 8 : 5)
    const rows = lod === 0 ? 3 : 2
    const cols = lod === 0 ? 5 : 4
    const count = rows * cols
    const mesh = new THREE.InstancedMesh(geo, plaster, count)
    mesh.name = 'westernStumps'
    mesh.castShadow = true
    const sx = 5.2
    const sz = 5.0
    const ox = -((cols - 1) * sx) / 2
    const oz = -((rows - 1) * sz) / 2
    const dummy = new THREE.Object3D()
    let i = 0
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r + c) % 4 === 0) {
          dummy.position.set(999, -99, 999)
          dummy.scale.set(0.001, 0.001, 0.001)
        } else {
          const hJitter = 0.65 + ((r * 2 + c) % 4) * 0.14
          dummy.position.set(ox + c * sx, platH + (stumpH * hJitter) / 2, oz + r * sz)
          dummy.scale.set(1, hJitter, 1)
          dummy.rotation.set(0.03 * ((c % 3) - 1), 0, 0.04 * ((r % 3) - 1))
        }
        dummy.updateMatrix()
        mesh.setMatrixAt(i++, dummy.matrix)
        dummy.scale.set(1, 1, 1)
        dummy.rotation.set(0, 0, 0)
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    root.add(mesh)

    // Collapsed facade fragment
    if (lod === 0) {
      const frag = new THREE.Mesh(new THREE.BoxGeometry(6, 1.8, 0.45), plaster)
      frag.position.set(-4, platH + 0.9, D * 0.35)
      frag.rotation.set(0.2, 0.35, 0.15)
      root.add(frag)
      const beam = new THREE.Mesh(new THREE.BoxGeometry(7, 0.3, 0.35), getMaterial('go_lim', lod))
      beam.position.set(3, platH + 0.5, -1.5)
      beam.rotation.set(0.1, 0.5, 0.4)
      root.add(beam)
    }
  } else {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(W * 0.65, 1.3, D * 0.6), brick)
    mass.position.y = platH + 0.65
    root.add(mass)
  }

  return root
}

/**
 * Điện Kiến Trung — cực Bắc nội đình; phá 1947; phục dựng từ 2018.
 * `build()` = restored Đông–Tây. Ruin: `buildKienTrungRuin(lod)` khi
 * `reconstructionMode === 'ruin'`.
 */
export const dienKienTrung: MonumentModule = {
  id: 'dien-kien-trung',
  displayName: { vi: 'Điện Kiến Trung', en: 'Kien Trung Palace' },
  build: buildKienTrungRestored,
  anchor: [0, 1, -275],
  rotationY: 0,
  boundingRadius: 40,
  poi: {
    vi: 'Điện Kiến Trung — phong cách Đông–Tây Khải Định (1921–23); phá 1947; phục dựng từ 2018. Default = restored. Anchor [ước lượng hợp lý].',
    en: 'Kien Trung Palace — East–West fusion (Khai Dinh 1921–23); destroyed 1947; rebuilt from 2018. Default = restored. Anchor [estimated].',
    year: '1923',
  },
}
