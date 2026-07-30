import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'

/**
 * Thái Bình Lâu — lầu đọc sách Khải Định (1919–21), Đông Bắc Tử Cấm.
 * Hai tầng stylized + pháp lam accents; ngói thanh lưu ly.
 *
 * LOD1 budget: platform(4) + L1 mass(1) + L2 mass(1) + cols(1) + plate(1)
 * + door(2) + phap_lam strip(1) + roof(3) ≈ 14 DC.
 */
function buildThaiBinhLau(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'thai-binh-lau'
  root.userData.mode = 'restored'

  const plaster = getMaterial('tuong_voi', lod)
  const wood = getMaterial('go_lim', lod)
  const son = getMaterial('go_son_son', lod)
  const phapLam = getMaterial('phap_lam', lod)
  const stone = getMaterial('da_thanh', lod)

  const platH = 1.15
  const W = lod === 2 ? 12 : 15
  const D = lod === 2 ? 10 : 12
  const L1 = lod === 2 ? 3.2 : 3.8
  const L2 = lod === 2 ? 2.6 : 3.1

  const platform = buildPlatform({
    width: W + 2.5,
    depth: D + 2.5,
    height: platH,
    steps: lod === 2 ? 2 : lod === 1 ? 3 : 5,
    balustrade: lod === 0,
    lod,
  })
  root.add(platform)

  const floorY = platH

  if (lod === 2) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(W, L1 + L2 * 0.85, D), plaster)
    mass.position.y = floorY + (L1 + L2 * 0.85) / 2
    root.add(mass)
    const roof = buildRoof({
      width: W + 1.5,
      depth: D + 1.5,
      tiers: 1,
      tileMaterial: 'ngoi_thanh_luu_ly',
      lod,
    })
    roof.position.y = floorY + L1 + L2 * 0.85
    root.add(roof)
    return root
  }

  // Level 1 — enclosed reading hall mass
  const body1 = new THREE.Mesh(new THREE.BoxGeometry(W * 0.92, L1, D * 0.88), plaster)
  body1.position.y = floorY + L1 / 2
  body1.castShadow = true
  body1.receiveShadow = true
  root.add(body1)

  // South door
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, L1 * 0.72, 0.28), son)
  frame.position.set(0, floorY + L1 * 0.36, D * 0.44 - 0.05)
  root.add(frame)
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.85, L1 * 0.64, 0.1), wood)
  leaf.position.set(0, floorY + L1 * 0.33, D * 0.44 + 0.08)
  root.add(leaf)

  // Pháp lam belt (Khải Định ceramic mosaic cue)
  const belt = new THREE.Mesh(new THREE.BoxGeometry(W * 0.88, 0.35, D * 0.9), phapLam)
  belt.position.y = floorY + L1 * 0.55
  root.add(belt)

  // Peristyle columns around L1 (gallery feel)
  const cols = buildColumnGrid({
    rows: lod === 0 ? 3 : 2,
    cols: lod === 0 ? 4 : 3,
    spacing:
      lod === 0
        ? ([3.6, 3.8] as [number, number])
        : ([5.0, 4.5] as [number, number]),
    height: L1 - 0.1,
    radius: 0.18,
    material: 'go_son_son',
    lod,
  })
  cols.position.y = floorY
  root.add(cols)

  // Mezzanine deck between levels
  const deckY = floorY + L1
  const deck = new THREE.Mesh(new THREE.BoxGeometry(W * 0.78, 0.18, D * 0.72), wood)
  deck.position.y = deckY + 0.09
  deck.receiveShadow = true
  root.add(deck)

  // Level 2 — smaller upper pavilion
  const body2 = new THREE.Mesh(new THREE.BoxGeometry(W * 0.62, L2, D * 0.58), plaster)
  body2.position.y = deckY + 0.18 + L2 / 2
  body2.castShadow = true
  root.add(body2)

  if (lod === 0) {
    // Upper balcony rails (InstancedMesh)
    const railMat = stone
    const postGeo = new THREE.BoxGeometry(0.12, 0.7, 0.12)
    const posts = new THREE.InstancedMesh(postGeo, railMat, 12)
    const dummy = new THREE.Object3D()
    const halfW = W * 0.36
    const halfD = D * 0.34
    const pts: [number, number][] = []
    for (let i = 0; i < 4; i++) {
      const t = i / 3
      pts.push([-halfW + t * halfW * 2, halfD], [-halfW + t * halfW * 2, -halfD], [halfW, -halfD + t * halfD * 2])
    }
    for (let i = 0; i < 12; i++) {
      const [x, z] = pts[i]
      dummy.position.set(x, deckY + 0.18 + 0.35, z)
      dummy.updateMatrix()
      posts.setMatrixAt(i, dummy.matrix)
    }
    posts.instanceMatrix.needsUpdate = true
    root.add(posts)

    // Corner brackets under upper roof
    for (const x of [-W * 0.28, W * 0.28]) {
      for (const z of [-D * 0.24, D * 0.24]) {
        const br = buildBracketSet({ width: 1.0, depth: 0.75, height: 0.55, layers: 2, lod })
        br.position.set(x, deckY + 0.18 + L2 - 0.05, z)
        root.add(br)
      }
    }

    // Window openings L1 (east/west)
    for (const x of [-W * 0.42, W * 0.42]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.4, 1.6), wood)
      win.position.set(x, floorY + L1 * 0.48, 0)
      root.add(win)
    }
  }

  const beamY = deckY + 0.18 + L2
  if (lod === 1) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(W * 0.7, 0.2, D * 0.65), wood)
    plate.position.y = beamY
    root.add(plate)
  }

  const roof = buildRoof({
    width: lod === 0 ? W * 0.85 : W * 0.78,
    depth: lod === 0 ? D * 0.8 : D * 0.72,
    tiers: lod === 0 ? 2 : 1,
    tileMaterial: 'ngoi_thanh_luu_ly',
    ridgeOrnament: lod === 0 ? 'phoenix' : 'none',
    curvature: 0.9,
    lod,
  })
  roof.position.y = beamY + 0.08
  root.add(roof)

  if (lod === 0) {
    const gold = getMaterial('vang_thep', lod)
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), gold)
    finial.position.y = beamY + 3.4
    root.add(finial)
  }

  return root
}

export const thaiBinhLau: MonumentModule = {
  id: 'thai-binh-lau',
  displayName: { vi: 'Thái Bình Lâu', en: 'Thai Binh Pavilion' },
  build: buildThaiBinhLau,
  anchor: [70, 1, -260],
  rotationY: 0,
  boundingRadius: 25,
  poi: {
    vi: 'Thái Bình Lâu — lầu đọc sách vua Khải Định (1919–21); pháp lam + hai tầng stylized. Còn tồn tại. Anchor [ước lượng hợp lý].',
    en: 'Thai Binh Pavilion — Khai Dinh reading pavilion (1919–21); pháp lam accents, two-storey stylized. Extant. Anchor [estimated].',
    year: '1921',
  },
}
