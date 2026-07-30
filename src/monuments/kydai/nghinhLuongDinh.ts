import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'

/**
 * Nghinh Lương Đình — open riverside pavilion near Kỳ Đài / Phu Văn Lâu axis.
 * Cool-breeze resting hall; open sides, light timber, thanh lưu ly roof.
 * Anchor: estimated near river south of Phu Văn Lâu (not in buildings.json).
 */
function buildNghinhLuongDinh(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'nghinh-luong-dinh'

  const plaster = getMaterial('tuong_voi', lod)
  const stone = getMaterial('da_thanh', lod)
  const wood = getMaterial('go_lim', lod)

  const platform = buildPlatform({
    width: lod === 2 ? 12 : 14,
    depth: lod === 2 ? 10 : 12,
    height: 1.1,
    steps: lod === 2 ? 2 : 4,
    balustrade: lod === 0,
    lod,
  })
  root.add(platform)

  const floorY = 1.1
  const colH = lod === 2 ? 3.6 : 4.4

  if (lod === 2) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(10, colH, 8), plaster)
    mass.position.y = floorY + colH / 2
    root.add(mass)
    const roof = buildRoof({
      width: 12,
      depth: 10,
      tiers: 1,
      tileMaterial: 'ngoi_thanh_luu_ly',
      lod,
    })
    roof.position.y = floorY + colH
    root.add(roof)
    return root
  }

  // Open peristyle — 3×4 columns
  const cols = buildColumnGrid({
    rows: 3,
    cols: lod === 0 ? 4 : 3,
    spacing: lod === 0 ? ([3.4, 3.8] as [number, number]) : ([4.2, 4.0] as [number, number]),
    height: colH,
    radius: 0.22,
    material: 'go_son_son',
    lod,
  })
  cols.position.y = floorY
  root.add(cols)

  // Raised timber floor deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.18, 9.5), wood)
  deck.position.y = floorY + 0.12
  deck.receiveShadow = true
  root.add(deck)

  // Low breast walls on E/W only (keep N/S open to breeze / river)
  if (lod === 0) {
    const breastH = 1.15
    for (const x of [-5.6, 5.6]) {
      const breast = new THREE.Mesh(new THREE.BoxGeometry(0.35, breastH, 8.5), plaster)
      breast.position.set(x, floorY + breastH / 2, 0)
      root.add(breast)
    }
    // Stone seat benches along sides
    for (const x of [-4.2, 4.2]) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 7.5), stone)
      bench.position.set(x, floorY + 0.35, 0)
      root.add(bench)
    }
  }

  // Entablature beam ring
  const beamY = floorY + colH
  const beamMat = wood
  if (lod === 0) {
    const longBeam = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.28, 0.35), beamMat)
    for (const z of [-4.6, 4.6]) {
      const b = longBeam.clone()
      b.position.set(0, beamY, z)
      root.add(b)
    }
    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 10), beamMat)
    for (const x of [-5.5, -1.8, 1.8, 5.5]) {
      const b = crossBeam.clone()
      b.position.set(x, beamY, 0)
      root.add(b)
    }

    // Corner brackets
    for (const x of [-5.2, 5.2]) {
      for (const z of [-4.2, 4.2]) {
        const br = buildBracketSet({ width: 1.4, depth: 1.0, height: 0.75, layers: 2, lod })
        br.position.set(x, beamY - 0.05, z)
        root.add(br)
      }
    }
  } else {
    // LOD1: single plate + simplified beams (≤20 draw calls total)
    const plate = new THREE.Mesh(new THREE.BoxGeometry(12, 0.25, 9.8), beamMat)
    plate.position.y = beamY
    root.add(plate)
  }

  const roof = buildRoof({
    width: lod === 0 ? 13.5 : 12.5,
    depth: lod === 0 ? 11.5 : 10.5,
    tiers: lod === 0 ? 2 : 1,
    tileMaterial: 'ngoi_thanh_luu_ly',
    ridgeOrnament: lod === 0 ? 'phoenix' : 'none',
    curvature: 0.88,
    lod,
  })
  roof.position.y = beamY + 0.15
  root.add(roof)

  // Ridge finial accent
  if (lod === 0) {
    const gold = getMaterial('vang_thep', lod)
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), gold)
    bulb.position.y = beamY + 3.6
    root.add(bulb)
  }

  return root
}

export const nghinhLuongDinh: MonumentModule = {
  id: 'nghinh-luong-dinh',
  displayName: { vi: 'Nghinh Lương Đình', en: 'Nghinh Luong Pavilion' },
  build: buildNghinhLuongDinh,
  anchor: [0, 1, 1680],
  rotationY: 0,
  boundingRadius: 18,
  poi: {
    vi: 'Nghinh Lương Đình — đình mở gần sông Hương, khu vực Kỳ Đài / Phu Văn Lâu; nơi vua nghỉ mát đón gió sông.',
    en: 'Nghinh Luong Pavilion — open riverside hall near Kỳ Đài / Phu Văn Lâu; a cool-breeze resting place by the Hương River.',
    year: '1824',
  },
}
