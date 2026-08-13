import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { mergeKit, meshOf } from '../../core/geometry/kit/roof/merge'
import { scaleBoxUvToMeters, uvRepeat } from '../../core/geometry/kit/uvMeters'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildThaiHoaColumns } from './columns'
import { buildThroneAndCanopy } from './throne'

function boxUv(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  factory: 'tuongVoi' | 'goLim' | 'sonSon' | 'gachBatTrang' | 'ngoiMenVang',
): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d)
  scaleBoxUvToMeters(g, w, h, d, uvRepeat(factory))
  g.translate(x, y, z)
  return g
}

/**
 * Cửa bức bàn — khung son + nan gỗ dọc, hàng gian mặt Nam tiền điện.
 * [ước lượng hợp lý] 7 khoang; không plane thủng.
 */
function buildBucBanDoors(
  lod: 0 | 1 | 2,
  wallH: number,
  floorY: number,
  z: number,
  bayXs: number[],
): THREE.Group {
  const g = new THREE.Group()
  g.name = 'buc-ban'
  const son = getMaterial('go_son_son', lod)
  const wood = getMaterial('go_lim', lod)
  const gold = getMaterial('vang_thep', lod)

  const frameH = wallH * 0.82
  const frameW = 3.55
  const leafH = frameH * 0.9
  const leafW = 3.15
  const dummy = new THREE.Object3D()

  const frame = new THREE.InstancedMesh(
    boxUv(frameW, frameH, 0.22, 0, 0, 0, 'sonSon'),
    son,
    bayXs.length,
  )
  frame.name = 'buc-ban-frames'
  frame.castShadow = lod < 2

  const leaf = new THREE.InstancedMesh(
    boxUv(leafW, leafH, 0.08, 0, 0, 0, 'goLim'),
    wood,
    bayXs.length,
  )
  leaf.name = 'buc-ban-leaves'
  leaf.castShadow = lod < 2

  bayXs.forEach((x, i) => {
    dummy.position.set(x, floorY + frameH / 2, z)
    dummy.updateMatrix()
    frame.setMatrixAt(i, dummy.matrix)
    dummy.position.set(x, floorY + leafH / 2 + 0.08, z + 0.08)
    dummy.updateMatrix()
    leaf.setMatrixAt(i, dummy.matrix)
  })
  frame.instanceMatrix.needsUpdate = true
  leaf.instanceMatrix.needsUpdate = true
  g.add(frame)
  g.add(leaf)

  if (lod === 0) {
    const slatGeo = new THREE.BoxGeometry(0.06, leafH * 0.78, 0.03)
    const perBay = 7
    const slats = new THREE.InstancedMesh(slatGeo, gold, bayXs.length * perBay)
    slats.name = 'buc-ban-slats'
    let idx = 0
    for (const x of bayXs) {
      for (let s = 0; s < perBay; s++) {
        const u = (s + 0.5) / perBay - 0.5
        dummy.position.set(x + u * leafW * 0.82, floorY + leafH * 0.48, z + 0.13)
        dummy.updateMatrix()
        slats.setMatrixAt(idx++, dummy.matrix)
      }
    }
    slats.instanceMatrix.needsUpdate = true
    g.add(slats)
  }

  return g
}

/**
 * Điện Thái Hòa — trùng thiềm điệp ốc (tiền + chính, máng thừa lưu).
 * 80 cột kit, ngói hoàng lưu ly, tường hồi vôi, cửa bức bàn, ngai + bửu tán.
 */
function buildDienThaiHoa(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'dien-thai-hoa'

  const plaster = getMaterial('tuong_voi', lod)
  const wood = getMaterial('go_lim', lod)
  const tile = getMaterial('ngoi_hoang_luu_ly', lod)

  const platH = 0.9
  const platW = lod === 2 ? 40 : 46
  const platD = lod === 2 ? 32 : 38

  root.add(
    buildPlatform({
      width: platW,
      depth: platD,
      height: platH,
      steps: lod === 2 ? 2 : lod === 1 ? 4 : 6,
      balustrade: lod < 2,
      lod,
      centerDragon: lod < 2,
      stepFace: 'south',
    }),
  )

  const floorY = platH
  const colH = lod === 2 ? 5.2 : 6.2
  const frontZ = 8.4
  const rearZ = -8.4
  const frontW = 38
  const rearW = 32
  const hallD = 13.6
  const wallT = 0.42
  const beamY = floorY + colH

  if (lod === 2) {
    const front = new THREE.Mesh(new THREE.BoxGeometry(36, colH, 14), plaster)
    front.position.set(0, floorY + colH / 2, frontZ)
    root.add(front)
    const rear = new THREE.Mesh(new THREE.BoxGeometry(30, colH, 14), plaster)
    rear.position.set(0, floorY + colH / 2, rearZ)
    root.add(rear)
    const link = new THREE.Mesh(new THREE.BoxGeometry(28, colH * 0.72, 3.4), plaster)
    link.position.set(0, floorY + (colH * 0.72) / 2, 0)
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
      roof.position.set(0, beamY, z)
      root.add(roof)
    }
    return root
  }

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

  const voiParts: THREE.BufferGeometry[] = []
  const woodParts: THREE.BufferGeometry[] = []

  // Tường hồi E/W tiền + chính + lưng Bắc
  for (const x of [-frontW / 2 + wallT / 2, frontW / 2 - wallT / 2]) {
    voiParts.push(boxUv(wallT, colH, hallD, x, floorY + colH / 2, frontZ, 'tuongVoi'))
  }
  for (const x of [-rearW / 2 + wallT / 2, rearW / 2 - wallT / 2]) {
    voiParts.push(boxUv(wallT, colH, hallD, x, floorY + colH / 2, rearZ, 'tuongVoi'))
  }
  voiParts.push(
    boxUv(rearW, colH, wallT, 0, floorY + colH / 2, rearZ - hallD / 2 + wallT / 2, 'tuongVoi'),
  )

  // Breast tường mặt Nam — chừa 7 gian cửa
  const breastH = colH * 0.36
  for (const x of [-frontW * 0.38, frontW * 0.38]) {
    voiParts.push(
      boxUv(frontW * 0.18, breastH, wallT, x, floorY + breastH / 2, frontZ + hallD / 2 - wallT / 2, 'tuongVoi'),
    )
  }

  // Sàn gỗ hai nhà
  woodParts.push(boxUv(frontW - 1.4, 0.12, hallD - 0.9, 0, floorY + 0.08, frontZ, 'goLim'))
  woodParts.push(boxUv(rearW - 1.4, 0.12, hallD - 0.9, 0, floorY + 0.08, rearZ, 'goLim'))

  // Dầm / plate
  woodParts.push(boxUv(frontW - 0.4, 0.28, hallD * 0.88, 0, beamY, frontZ, 'goLim'))
  woodParts.push(boxUv(rearW - 0.4, 0.28, hallD * 0.88, 0, beamY, rearZ, 'goLim'))

  const voiMesh = meshOf(mergeKit(voiParts), plaster, 'thai-hoa-walls')
  const woodMesh = meshOf(mergeKit(woodParts), wood, 'thai-hoa-wood')
  if (voiMesh) {
    voiMesh.castShadow = true
    voiMesh.receiveShadow = true
    root.add(voiMesh)
  }
  if (woodMesh) {
    woodMesh.receiveShadow = true
    root.add(woodMesh)
  }

  // Cửa bức bàn — 7 gian mặt Nam tiền điện
  const doorZ = frontZ + hallD / 2 - 0.12
  const bayXs = [-12.3, -8.2, -4.1, 0, 4.1, 8.2, 12.3]
  root.add(buildBucBanDoors(lod, colH, floorY, doorZ, bayXs))

  // Máng thừa lưu — nối tiền + chính (trùng thiềm điệp ốc)
  const gutter = new THREE.Mesh(
    boxUv(28, 0.28, 3.6, 0, 0, 0, 'ngoiMenVang'),
    tile,
  )
  gutter.name = 'mang-thua-luu'
  gutter.position.set(0, beamY + 0.22, 0)
  root.add(gutter)

  if (lod === 0) {
    const vault = new THREE.Mesh(
      new THREE.CylinderGeometry(2.35, 2.35, 26, 12, 1, true, 0, Math.PI),
      wood,
    )
    vault.name = 'tran-vo-cua'
    vault.rotation.z = Math.PI / 2
    vault.rotation.y = Math.PI / 2
    vault.position.set(0, floorY + colH * 0.7, 0)
    root.add(vault)
  } else {
    const plate = new THREE.Mesh(boxUv(26, 0.16, 3.4, 0, 0, 0, 'goLim'), wood)
    plate.position.set(0, floorY + colH * 0.7, 0)
    root.add(plate)
  }

  // Chồng rường — góc hai nhà, lod 0–1 (WorldScene = 1)
  const brPositions: [number, number][] = [
    [-frontW * 0.36, frontZ - 4.2],
    [frontW * 0.36, frontZ - 4.2],
    [-frontW * 0.36, frontZ + 4.2],
    [frontW * 0.36, frontZ + 4.2],
    [-rearW * 0.3, rearZ - 4.2],
    [rearW * 0.3, rearZ - 4.2],
    [-rearW * 0.3, rearZ + 4.2],
    [rearW * 0.3, rearZ + 4.2],
  ]
  const brLod: 0 | 1 | 2 = lod === 0 ? 0 : 1
  for (const [x, z] of brPositions) {
    const br = buildBracketSet({
      width: lod === 0 ? 1.85 : 1.45,
      depth: lod === 0 ? 1.2 : 0.95,
      height: lod === 0 ? 0.95 : 0.72,
      layers: lod === 0 ? 3 : 2,
      lod: brLod,
    })
    br.position.set(x, beamY - 0.08, z)
    root.add(br)
  }

  // Hai mái trùng thiềm — ridge lod 0–1; máng thừa lưu trên mái chính (mặt +Z)
  const frontRoof = buildRoof({
    width: 40,
    depth: 16.2,
    tiers: 2,
    tileMaterial: 'ngoi_hoang_luu_ly',
    ridge: 'long-chau-nhat',
    coDiem: true,
    curvature: 0.9,
    lod,
  })
  frontRoof.position.set(0, beamY + 0.08, frontZ)
  root.add(frontRoof)

  const rearRoof = buildRoof({
    width: 34,
    depth: 16.2,
    tiers: 2,
    tileMaterial: 'ngoi_hoang_luu_ly',
    ridge: 'long-chau-nhat',
    coDiem: true,
    linkedValley: true,
    curvature: 0.9,
    lod,
  })
  rearRoof.position.set(0, beamY + 0.08, rearZ)
  root.add(rearRoof)

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
