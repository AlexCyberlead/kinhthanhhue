import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'

/**
 * Hiển Lâm Các — 3 tầng gỗ, cao ~17 m, cao nhất Đại Nội.
 * ~24 cột (4 cột chính xuyên tầng); mái thanh lưu ly; nền gạch Bát Tràng / bó gạch vồ.
 * Ngân sách: LOD0 ≤ 30k tris.
 * Anchor: buildings.json hien-lam-cac [-95, 1, -130].
 */
function buildHienLamCac(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'hien-lam-cac'

  const plaster = getMaterial('tuong_voi', lod)
  const wood = getMaterial('go_lim', lod)
  const stone = getMaterial('da_thanh', lod)
  const brick = getMaterial('gach_bat_trang', lod)
  const gachVo = getMaterial('gach_vo', lod)
  const gold = getMaterial('vang_thep', lod)
  const phap = getMaterial('phap_lam', lod)

  // Platform — bó gạch vồ + lát Bát Tràng
  const platformH = 1.2
  const platform = buildPlatform({
    width: lod === 2 ? 14 : 16,
    depth: lod === 2 ? 12 : 14,
    height: platformH,
    steps: lod === 2 ? 2 : 4,
    balustrade: lod === 0,
    lod,
  })
  root.add(platform)

  // Override deck tint with gạch vồ skirt (visual mass)
  if (lod < 2) {
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(16.4, 0.35, 14.4), gachVo)
    skirt.position.y = 0.18
    skirt.receiveShadow = true
    root.add(skirt)
  }

  const floorY = platformH

  // Tier footprints (thu dần) — tổng chiều cao ~17 m
  // floor1 wall 4.6 + roof ~1.6 + floor2 3.4 + roof ~1.5 + floor3 2.8 + roof ~2.0 ≈ 17
  const tiers = [
    { w: lod === 2 ? 11 : 12.5, d: lod === 2 ? 9 : 10.5, h: lod === 2 ? 4.2 : 4.6 },
    { w: lod === 2 ? 8.5 : 9.5, d: lod === 2 ? 7 : 8, h: lod === 2 ? 3.0 : 3.4 },
    { w: lod === 2 ? 6 : 6.8, d: lod === 2 ? 5 : 5.6, h: lod === 2 ? 2.4 : 2.8 },
  ]

  let yCursor = floorY

  // 4 through-columns (~13 m) — InstancedMesh, 1 draw call
  if (lod < 2) {
    const throughH = 13.0
    const through = buildColumnGrid({
      rows: 2,
      cols: 2,
      spacing: [4.8, 4.2] as [number, number],
      height: throughH,
      radius: 0.32,
      material: 'go_son_son',
      lod,
    })
    through.position.y = floorY
    through.name = 'throughColumns'
    root.add(through)
  }

  for (let t = 0; t < 3; t++) {
    const { w, d, h } = tiers[t]
    const slabY = yCursor

    // Floor slab
    const slabMat = t === 0 ? brick : wood
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.5, 0.22, d + 0.5),
      slabMat,
    )
    slab.position.y = slabY + 0.11
    slab.receiveShadow = true
    root.add(slab)

    if (lod === 2) {
      // Box mass silhouette
      const mass = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), plaster)
      mass.position.y = slabY + h / 2
      mass.castShadow = true
      root.add(mass)
    } else {
      // Open timber storey — thin walls / breast walls only
      const wallT = 0.28
      const breastH = t === 0 ? h * 0.42 : h * 0.55

      // E/W breast
      for (const x of [-w / 2 + wallT / 2, w / 2 - wallT / 2]) {
        const side = new THREE.Mesh(new THREE.BoxGeometry(wallT, breastH, d * 0.92), plaster)
        side.position.set(x, slabY + breastH / 2, 0)
        side.castShadow = true
        root.add(side)
      }
      // N/S breast (partial openings)
      for (const z of [-d / 2 + wallT / 2, d / 2 - wallT / 2]) {
        const face = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.35, breastH, wallT),
          plaster,
        )
        for (const x of [-w * 0.28, w * 0.28]) {
          const f = face.clone()
          f.position.set(x, slabY + breastH / 2, z)
          root.add(f)
        }
      }

      // Perimeter columns per floor (Instanced) — total across floors ≤ ~20 extra
      if (lod === 0 || t === 0) {
        const peri = buildColumnGrid({
          rows: 3,
          cols: t === 0 ? 4 : 3,
          spacing:
            t === 0
              ? ([3.4, 3.8] as [number, number])
              : ([2.8, 2.6] as [number, number]),
          height: h - 0.15,
          radius: t === 0 ? 0.22 : 0.18,
          material: 'go_son_son',
          lod,
        })
        peri.position.y = slabY
        peri.name = `tier${t}Columns`
        root.add(peri)
      }

      // Beam plate
      const beam = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.22, d + 0.6), wood)
      beam.position.y = slabY + h
      root.add(beam)

      // Corner brackets — LOD0 corners only (4 × 3 floors = 12 sets; keep layers low)
      if (lod === 0) {
        for (const x of [-w * 0.4, w * 0.4]) {
          for (const z of [-d * 0.38, d * 0.38]) {
            const br = buildBracketSet({
              width: 1.3,
              depth: 0.9,
              height: 0.7,
              layers: 2,
              lod,
            })
            br.position.set(x, slabY + h - 0.05, z)
            root.add(br)
          }
        }
      }
    }

    // Roof per tier — thanh lưu ly; LOD0 adds a shallow wrap = ~2 roofs/tier → ~6 + top
    const roofY = slabY + h + 0.1
    const roof = buildRoof({
      width: w * 1.18,
      depth: d * 1.2,
      tiers: lod === 0 && t === 2 ? 2 : 1,
      tileMaterial: 'ngoi_thanh_luu_ly',
      ridgeOrnament: lod === 0 && t === 2 ? 'dragon' : 'none',
      curvature: 0.88,
      lod,
    })
    roof.position.y = roofY
    root.add(roof)

    if (lod === 0 && t < 2) {
      // Extra wrap roof → approach ~12 mái silhouette without exploding tris
      const wrap = buildRoof({
        width: w * 1.32,
        depth: d * 1.35,
        tiers: 1,
        tileMaterial: 'ngoi_thanh_luu_ly',
        ridgeOrnament: 'none',
        curvature: 0.75,
        lod,
      })
      wrap.position.y = roofY - 0.15
      root.add(wrap)
    }

    // Advance to next floor (roof rise allowance)
    const roofRise = lod === 2 ? 1.1 : t === 2 ? 2.2 : 1.55
    yCursor = roofY + roofRise
  }

  // Bầu rượu pháp lam on apex — LOD0
  if (lod === 0) {
    const apexY = yCursor + 0.2
    const bottle = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.55, 4, 8), phap)
    bottle.position.y = apexY
    root.add(bottle)
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), gold)
    cap.position.y = apexY + 0.55
    root.add(cap)
  }

  // Stone stair rail accents — LOD0
  if (lod === 0) {
    for (const x of [-2.8, 2.8]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.7, 3.2), stone)
      rail.position.set(x, platformH * 0.55, 7.2)
      root.add(rail)
    }
  }

  return root
}

export const hienLamCac: MonumentModule = {
  id: 'hien-lam-cac',
  displayName: { vi: 'Hiển Lâm Các', en: 'Hien Lam Pavilion' },
  build: buildHienLamCac,
  anchor: [-95, 1, -130],
  rotationY: 0,
  boundingRadius: 30,
  poi: {
    vi: 'Hiển Lâm Các — lầu gỗ 3 tầng cao ~17 m, công trình gỗ cao nhất Hoàng thành; liên quan Thế Miếu / Cửu Đỉnh (1821).',
    en: 'Hien Lam Pavilion — three-storey timber tower ~17 m, tallest wooden structure in the Imperial City; near The Mieu / Nine Urns (1821).',
    year: '1821',
  },
}
