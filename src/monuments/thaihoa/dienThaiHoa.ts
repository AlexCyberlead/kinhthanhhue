import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'
import { buildThaiHoaColumns } from './columns'
import { buildThroneAndCanopy } from './throne'

/** Nền gạch Bát Tràng + bó vỉa đá thanh + bậc cấp. */
function buildThaiHoaPlatform(lod: 0 | 1 | 2): THREE.Group {
  const g = new THREE.Group()
  g.name = 'platform'
  const brick = getMaterial('gach_bat_trang', lod)
  const stone = getMaterial('da_thanh', lod)

  const W = lod === 2 ? 38 : 44
  const D = lod === 2 ? 30 : 36
  const H = 0.9

  const deck = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), brick)
  deck.position.y = H / 2
  deck.receiveShadow = true
  deck.castShadow = true
  g.add(deck)

  // Bó vỉa đá thanh — 4 cạnh (LOD2: bỏ)
  if (lod < 2) {
    const curbH = 0.22
    const curbT = 0.35
    const long = new THREE.Mesh(new THREE.BoxGeometry(W + curbT * 2, curbH, curbT), stone)
    for (const z of [-D / 2 - curbT / 2, D / 2 + curbT / 2]) {
      const c = long.clone()
      c.position.set(0, H + curbH / 2, z)
      g.add(c)
    }
    const short = new THREE.Mesh(new THREE.BoxGeometry(curbT, curbH, D), stone)
    for (const x of [-W / 2 - curbT / 2, W / 2 + curbT / 2]) {
      const c = short.clone()
      c.position.set(x, H + curbH / 2, 0)
      g.add(c)
    }
  }

  // Bậc cấp phía Nam (+Z) — lối lên sân Đại Triều
  const steps = lod === 2 ? 2 : lod === 1 ? 3 : 5
  const stepD = 0.5
  for (let i = 0; i < steps; i++) {
    const h = ((i + 1) / steps) * H
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(W * 0.42, h, stepD),
      stone,
    )
    step.position.set(0, h / 2, D / 2 + stepD * (i + 0.5))
    step.receiveShadow = true
    g.add(step)
  }

  return g
}

/**
 * Điện Thái Hòa — trùng thiềm điệp ốc (tiền điện + chính điện).
 * 80 cột InstancedMesh, ngói hoàng lưu ly, chồng rường (buildBracketSet).
 */
function buildDienThaiHoa(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'dien-thai-hoa'

  const plaster = getMaterial('tuong_voi', lod)
  const wood = getMaterial('go_lim', lod)
  const son = getMaterial('go_son_son', lod)

  const platform = buildThaiHoaPlatform(lod)
  root.add(platform)

  const floorY = 0.9
  const colH = lod === 2 ? 5.2 : 5.8
  const frontZ = 8.5
  const rearZ = -8.5

  // —— LOD2: massing nhanh ——
  if (lod === 2) {
    const front = new THREE.Mesh(new THREE.BoxGeometry(36, colH, 14), plaster)
    front.position.set(0, floorY + colH / 2, frontZ)
    root.add(front)
    const rear = new THREE.Mesh(new THREE.BoxGeometry(30, colH, 14), plaster)
    rear.position.set(0, floorY + colH / 2, rearZ)
    root.add(rear)
    const link = new THREE.Mesh(new THREE.BoxGeometry(28, colH * 0.85, 4), plaster)
    link.position.set(0, floorY + (colH * 0.85) / 2, 0)
    root.add(link)

    for (const [w, d, z] of [
      [38, 16, frontZ],
      [32, 16, rearZ],
    ] as const) {
      const roof = buildRoof({
        width: w,
        depth: d,
        tiers: 1,
        tileMaterial: 'ngoi_hoang_luu_ly',
        lod,
      })
      roof.position.y = floorY + colH
      roof.position.z = z
      root.add(roof)
    }
    return root
  }

  // —— Cột 80 ——
  root.add(
    buildThaiHoaColumns({
      height: colH,
      radius: 0.3,
      floorY,
      frontCenterZ: frontZ,
      rearCenterZ: rearZ,
      lod,
    }),
  )

  // —— Tường hồi E/W + lưng Bắc (mở mặt Nam) ——
  const wallH = colH
  const wallT = 0.4
  const frontW = 38
  const rearW = 32
  const hallD = 13.5

  // Hồi tường tiền điện
  {
    const sideGeo = new THREE.BoxGeometry(wallT, wallH, hallD)
    for (const x of [-frontW / 2 + wallT / 2, frontW / 2 - wallT / 2]) {
      const s = new THREE.Mesh(sideGeo, plaster)
      s.position.set(x, floorY + wallH / 2, frontZ)
      s.castShadow = true
      s.receiveShadow = true
      root.add(s)
    }
  }
  // Hồi tường chính điện
  {
    const sideGeo = new THREE.BoxGeometry(wallT, wallH, hallD)
    for (const x of [-rearW / 2 + wallT / 2, rearW / 2 - wallT / 2]) {
      const s = new THREE.Mesh(sideGeo, plaster)
      s.position.set(x, floorY + wallH / 2, rearZ)
      s.castShadow = true
      root.add(s)
    }
  }
  // Tường lưng Bắc
  const north = new THREE.Mesh(new THREE.BoxGeometry(rearW, wallH, wallT), plaster)
  north.position.set(0, floorY + wallH / 2, rearZ - hallD / 2 + wallT / 2)
  north.castShadow = true
  root.add(north)

  // Breast wall / cửa tiền điện (mở gian giữa)
  if (lod === 0) {
    const breastH = wallH * 0.38
    const breastGeo = new THREE.BoxGeometry(frontW * 0.22, breastH, wallT)
    for (const x of [-frontW * 0.32, frontW * 0.32]) {
      const b = new THREE.Mesh(breastGeo, plaster)
      b.position.set(x, floorY + breastH / 2, frontZ + hallD / 2 - wallT / 2)
      root.add(b)
    }
    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.2, wallH * 0.82, 0.3), son)
    frame.position.set(0, floorY + wallH * 0.41, frontZ + hallD / 2 - 0.18)
    root.add(frame)
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(3.6, wallH * 0.74, 0.12), wood)
    leaf.position.set(0, floorY + wallH * 0.38, frontZ + hallD / 2 - 0.05)
    root.add(leaf)
  } else {
    // LOD1: một breast strip đơn giản
    const breast = new THREE.Mesh(
      new THREE.BoxGeometry(frontW * 0.7, wallH * 0.35, wallT),
      plaster,
    )
    breast.position.set(0, floorY + wallH * 0.175, frontZ + hallD / 2 - wallT / 2)
    root.add(breast)
  }

  // —— Sàn gỗ nội thất (nhẹ) ——
  const frontFloor = new THREE.Mesh(new THREE.BoxGeometry(frontW - 1.2, 0.12, hallD - 0.8), wood)
  frontFloor.position.set(0, floorY + 0.08, frontZ)
  frontFloor.receiveShadow = true
  root.add(frontFloor)
  const rearFloor = new THREE.Mesh(new THREE.BoxGeometry(rearW - 1.2, 0.12, hallD - 0.8), wood)
  rearFloor.position.set(0, floorY + 0.08, rearZ)
  rearFloor.receiveShadow = true
  root.add(rearFloor)

  // —— Máng thừa lưu / vòm mai cua (liên kết hai khối) ——
  const linkY = floorY + colH * 0.72
  const gutter = new THREE.Mesh(new THREE.BoxGeometry(28, 0.35, 3.2), getMaterial('ngoi_hoang_luu_ly', lod))
  gutter.position.set(0, floorY + colH + 0.4, 0)
  root.add(gutter)

  if (lod === 0) {
    // Trần vỏ cua stylized — nửa trụ nằm ngang
    const vault = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.4, 26, 10, 1, true, 0, Math.PI),
      wood,
    )
    vault.rotation.z = Math.PI / 2
    vault.rotation.y = Math.PI / 2
    vault.position.set(0, linkY, 0)
    root.add(vault)
  } else {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(26, 0.2, 3.5), wood)
    plate.position.set(0, linkY, 0)
    root.add(plate)
  }

  // —— Entablature / dầm ——
  const beamY = floorY + colH
  if (lod === 0) {
    const frontBeam = new THREE.Mesh(new THREE.BoxGeometry(frontW - 0.5, 0.32, 0.4), wood)
    for (const z of [frontZ - hallD / 2 + 0.3, frontZ + hallD / 2 - 0.3]) {
      const b = frontBeam.clone()
      b.position.set(0, beamY, z)
      root.add(b)
    }
    const rearBeam = new THREE.Mesh(new THREE.BoxGeometry(rearW - 0.5, 0.32, 0.4), wood)
    for (const z of [rearZ - hallD / 2 + 0.3, rearZ + hallD / 2 - 0.3]) {
      const b = rearBeam.clone()
      b.position.set(0, beamY, z)
      root.add(b)
    }
  } else {
    // LOD1: 2 plate dầm (giữ draw calls)
    const fb = new THREE.Mesh(new THREE.BoxGeometry(frontW - 0.4, 0.28, hallD * 0.9), wood)
    fb.position.set(0, beamY, frontZ)
    root.add(fb)
    const rb = new THREE.Mesh(new THREE.BoxGeometry(rearW - 0.4, 0.28, hallD * 0.9), wood)
    rb.position.set(0, beamY, rearZ)
    root.add(rb)
  }

  // —— Chồng rường (buildBracketSet) — góc tiền + chính, LOD0 only ——
  if (lod === 0) {
    const brPositions: [number, number][] = [
      [-frontW * 0.38, frontZ - 4],
      [frontW * 0.38, frontZ - 4],
      [-frontW * 0.38, frontZ + 4],
      [frontW * 0.38, frontZ + 4],
      [-rearW * 0.32, rearZ - 4],
      [rearW * 0.32, rearZ - 4],
      [-rearW * 0.32, rearZ + 4],
      [rearW * 0.32, rearZ + 4],
    ]
    for (const [x, z] of brPositions) {
      const br = buildBracketSet({
        width: 1.8,
        depth: 1.2,
        height: 0.95,
        layers: 3,
        lod,
      })
      br.position.set(x, beamY - 0.1, z)
      root.add(br)
    }
  }

  // —— Hai mái trùng thiềm (hoàng lưu ly) ——
  const frontRoof = buildRoof({
    width: lod === 0 ? 40 : 38,
    depth: lod === 0 ? 16 : 15,
    tiers: lod === 0 ? 2 : 1,
    tileMaterial: 'ngoi_hoang_luu_ly',
    ridgeOrnament: lod === 0 ? 'dragon' : 'none',
    curvature: 0.88,
    lod,
  })
  frontRoof.position.set(0, beamY + 0.1, frontZ)
  root.add(frontRoof)

  const rearRoof = buildRoof({
    width: lod === 0 ? 34 : 32,
    depth: lod === 0 ? 16 : 15,
    tiers: lod === 0 ? 2 : 1,
    tileMaterial: 'ngoi_hoang_luu_ly',
    ridgeOrnament: lod === 0 ? 'dragon' : 'none',
    curvature: 0.88,
    lod,
  })
  rearRoof.position.set(0, beamY + 0.1, rearZ)
  root.add(rearRoof)

  // Cổ diêm stylized giữa tầng mái (LOD0) — strip pháp lam
  if (lod === 0) {
    const lam = getMaterial('phap_lam', lod)
    for (const [w, z] of [
      [36, frontZ],
      [30, rearZ],
    ] as const) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(w, 0.45, 0.25), lam)
      band.position.set(0, beamY + 1.7, z)
      root.add(band)
    }
  }

  // —— Ngai + bửu tán (chính điện, LOD0) ——
  const throne = buildThroneAndCanopy(lod)
  throne.position.set(0, floorY + 0.12, rearZ)
  root.add(throne)

  return root
}

export const thaiHoaModule: MonumentModule = {
  id: 'dien-thai-hoa',
  displayName: { vi: 'Điện Thái Hòa', en: 'Hall of Supreme Harmony' },
  build: buildDienThaiHoa,
  anchor: [0, 1, -48],
  rotationY: 0,
  boundingRadius: 55,
  poi: {
    vi: 'Điện Thái Hòa — nơi đại triều nhà Nguyễn; kiến trúc trùng thiềm điệp ốc, 80 cột lim sơn son thếp vàng, mái ngói hoàng lưu ly. Xây 1805, dời/làm lại 1833.',
    en: 'Hall of Supreme Harmony — imperial audience hall of the Nguyễn dynasty; double-roof “trùng thiềm điệp ốc” form, 80 lacquered lim columns, yellow glazed-tile roofs. Built 1805; relocated/rebuilt 1833.',
    year: '1805',
  },
}

export { buildDienThaiHoa }
