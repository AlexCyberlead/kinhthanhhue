import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'
import { buildInterior } from './interior'

/**
 * Duyệt Thị Đường — nhà hát cung đình Tử Cấm Thành.
 * Mái ngói thanh lưu ly, cột lim sơn son ~12 m (2 tầng visual), pháp lam accents.
 * Nội thất LOD0: sân khấu giữa, hậu trường, đài ngự tọa 2 bậc, ghế quan.
 * Ngân sách: LOD0 ≤ 40k tris; LOD1 ≤ 25 DC; nội thất chỉ LOD0.
 * Anchor: buildings.json duyet-thi-duong [110, 1, -180], rotationY π/2.
 */
function buildDuyetThiDuong(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'duyet-thi-duong'

  const plaster = getMaterial('tuong_voi', lod)
  const wood = getMaterial('go_lim', lod)
  const son = getMaterial('go_son_son', lod)
  const stone = getMaterial('da_thanh', lod)
  const brick = getMaterial('gach_bat_trang', lod)
  const lam = getMaterial('phap_lam', lod)
  const gold = getMaterial('vang_thep', lod)

  // Footprint — 4 gian + 2 chái stylized; hall ~28×20
  const hallW = lod === 2 ? 22 : 28
  const hallD = lod === 2 ? 16 : 20
  const platformH = lod === 2 ? 0.8 : 1.05
  const colH = lod === 2 ? 8.5 : 11.2
  const floorY = platformH

  // —— Nền ——
  const deck = new THREE.Mesh(new THREE.BoxGeometry(hallW + 3, platformH, hallD + 3), stone)
  deck.position.y = platformH / 2
  deck.receiveShadow = true
  deck.castShadow = true
  root.add(deck)

  if (lod < 2) {
    const pave = new THREE.Mesh(
      new THREE.BoxGeometry(hallW + 1.5, 0.08, hallD + 1.5),
      brick,
    )
    pave.position.y = platformH + 0.02
    pave.receiveShadow = true
    root.add(pave)
  }

  // Bậc cấp mặt tiền (+Z local; world quay π/2 → hướng đông)
  const stepCount = lod === 2 ? 2 : lod === 1 ? 3 : 4
  const stepD = 0.5
  for (let i = 0; i < stepCount; i++) {
    const h = ((i + 1) / stepCount) * platformH
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(hallW * 0.38, h, stepD),
      brick,
    )
    step.position.set(0, h / 2, hallD / 2 + 1.5 + stepD * (i + 0.5))
    step.receiveShadow = true
    root.add(step)
  }

  // —— LOD2: massing nhanh ——
  if (lod === 2) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(hallW, colH, hallD), plaster)
    mass.position.y = floorY + colH / 2
    mass.castShadow = true
    root.add(mass)

    const roof = buildRoof({
      width: hallW + 2,
      depth: hallD + 2,
      tiers: 1,
      tileMaterial: 'ngoi_thanh_luu_ly',
      lod,
    })
    roof.position.y = floorY + colH
    root.add(roof)
    return root
  }

  // —— Cột ngoại vi (Instanced) ——
  // Hai hàng chính xuyên tầng + chu vi nhẹ
  const perimeter = buildColumnGrid({
    rows: 3,
    cols: lod === 0 ? 7 : 5,
    spacing: lod === 0 ? ([4.2, 7.5] as [number, number]) : ([5.5, 7.5] as [number, number]),
    height: colH,
    radius: 0.3,
    material: 'go_son_son',
    lod,
  })
  perimeter.position.y = floorY
  perimeter.name = 'perimeterColumns'
  root.add(perimeter)

  // —— Tường hồi + lưng (mở gian giữa mặt tiền) ——
  const wallT = 0.38
  const wallH = colH * 0.92

  // Hồi E/W
  for (const x of [-hallW / 2 + wallT / 2, hallW / 2 - wallT / 2]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, hallD * 0.95), plaster)
    side.position.set(x, floorY + wallH / 2, 0)
    side.castShadow = true
    side.receiveShadow = true
    root.add(side)
  }

  // Tường Bắc (-Z)
  const north = new THREE.Mesh(new THREE.BoxGeometry(hallW - 0.5, wallH, wallT), plaster)
  north.position.set(0, floorY + wallH / 2, -hallD / 2 + wallT / 2)
  north.castShadow = true
  root.add(north)

  // Mặt tiền (+Z): breast hai bên + khung cửa giữa
  if (lod === 0) {
    const breastH = wallH * 0.4
    const breastGeo = new THREE.BoxGeometry(hallW * 0.28, breastH, wallT)
    for (const x of [-hallW * 0.32, hallW * 0.32]) {
      const b = new THREE.Mesh(breastGeo, plaster)
      b.position.set(x, floorY + breastH / 2, hallD / 2 - wallT / 2)
      root.add(b)
    }
    // Tầng 2 breast (visual 2 storeys)
    const upperBreast = new THREE.Mesh(
      new THREE.BoxGeometry(hallW * 0.85, wallH * 0.28, wallT * 0.9),
      plaster,
    )
    upperBreast.position.set(0, floorY + wallH * 0.72, hallD / 2 - wallT / 2)
    root.add(upperBreast)

    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.2, wallH * 0.55, 0.32), son)
    frame.position.set(0, floorY + wallH * 0.28, hallD / 2 - 0.2)
    root.add(frame)

    const leaf = new THREE.Mesh(new THREE.BoxGeometry(4.4, wallH * 0.48, 0.12), wood)
    leaf.position.set(0, floorY + wallH * 0.26, hallD / 2 - 0.05)
    root.add(leaf)
  } else {
    // LOD1: 1 breast strip + 1 frame — giữ DC
    const breast = new THREE.Mesh(
      new THREE.BoxGeometry(hallW * 0.72, wallH * 0.38, wallT),
      plaster,
    )
    breast.position.set(0, floorY + wallH * 0.19, hallD / 2 - wallT / 2)
    root.add(breast)

    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.8, wallH * 0.5, 0.28), son)
    frame.position.set(0, floorY + wallH * 0.26, hallD / 2 - 0.18)
    root.add(frame)
  }

  // —— Dầm / entablature ——
  const beamY = floorY + colH
  if (lod === 0) {
    const longBeam = new THREE.Mesh(new THREE.BoxGeometry(hallW - 0.6, 0.3, 0.38), wood)
    for (const z of [-hallD / 2 + 0.4, hallD / 2 - 0.4]) {
      const b = longBeam.clone()
      b.position.set(0, beamY, z)
      root.add(b)
    }
    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, hallD - 0.8), wood)
    for (const x of [-hallW * 0.28, 0, hallW * 0.28]) {
      const b = crossBeam.clone()
      b.position.set(x, beamY - 0.05, 0)
      root.add(b)
    }
  } else {
    // LOD1: 1 plate dầm
    const plate = new THREE.Mesh(new THREE.BoxGeometry(hallW - 0.4, 0.26, hallD - 0.6), wood)
    plate.position.set(0, beamY, 0)
    root.add(plate)
  }

  // Mid-storey floor band (visual 2 tầng)
  if (lod === 0) {
    const mid = new THREE.Mesh(new THREE.BoxGeometry(hallW - 0.8, 0.2, hallD - 0.8), wood)
    mid.position.set(0, floorY + colH * 0.48, 0)
    root.add(mid)
  }

  // —— Pháp lam accents ——
  if (lod === 0) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(hallW * 0.9, 0.4, 0.22), lam)
    band.position.set(0, beamY + 1.55, 0)
    root.add(band)

    // Ô hộc pháp lam mặt tiền
    const panelGeo = new THREE.BoxGeometry(1.6, 0.9, 0.08)
    for (const x of [-8, -4, 4, 8]) {
      const p = new THREE.Mesh(panelGeo, lam)
      p.position.set(x, floorY + wallH * 0.72, hallD / 2 - wallT / 2 + 0.08)
      root.add(p)
    }

    // Chóp vàng nhỏ trên bờ nóc sẽ nằm trong roof ornament
    const finialBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.5), gold)
    finialBase.position.set(0, beamY + 0.15, 0)
    root.add(finialBase)
  } else {
    // LOD1: 1 strip pháp lam
    const band = new THREE.Mesh(new THREE.BoxGeometry(hallW * 0.85, 0.35, 0.2), lam)
    band.position.set(0, beamY + 1.4, hallD * 0.05)
    root.add(band)
  }

  // —— Chồng rường góc — LOD0 only ——
  if (lod === 0) {
    for (const x of [-hallW * 0.38, hallW * 0.38]) {
      for (const z of [-hallD * 0.35, hallD * 0.35]) {
        const br = buildBracketSet({
          width: 1.5,
          depth: 1.0,
          height: 0.85,
          layers: 2,
          lod,
        })
        br.position.set(x, beamY - 0.1, z)
        root.add(br)
      }
    }
  }

  // —— Mái thanh lưu ly ——
  const roof = buildRoof({
    width: hallW + (lod === 0 ? 3.5 : 2.5),
    depth: hallD + (lod === 0 ? 3.5 : 2.5),
    tiers: lod === 0 ? 2 : 1,
    tileMaterial: 'ngoi_thanh_luu_ly',
    ridgeOrnament: lod === 0 ? 'dragon' : 'none',
    curvature: 0.9,
    lod,
  })
  roof.position.y = beamY + 0.08
  root.add(roof)

  // —— Nội thất LOD0 ——
  if (lod === 0) {
    root.add(
      buildInterior({
        hallW,
        hallD,
        floorY,
        colH,
      }),
    )
  }

  return root
}

export const duyetThiDuongModule: MonumentModule = {
  id: 'duyet-thi-duong',
  displayName: { vi: 'Duyệt Thị Đường', en: 'Duyet Thi Duong Theatre' },
  build: buildDuyetThiDuong,
  anchor: [110, 1, -180],
  rotationY: 1.5708,
  boundingRadius: 35,
  poi: {
    vi: 'Duyệt Thị Đường — nhà hát cung đình trong Tử Cấm Thành; cột lim sơn son ~12 m, mái ngói thanh lưu ly, sân khấu giữa theo nghi thức triều Nguyễn. Xây 1826, phục hồi ~2004.',
    en: 'Duyet Thi Duong — royal theatre in the Forbidden Purple City; ~12 m lacquered lim columns, green glazed-tile roof, central stage with court seating hierarchy. Built 1826; restored ~2004.',
    year: '1826',
  },
}

export { buildDuyetThiDuong }
