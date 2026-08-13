import * as THREE from 'three'
import { buildGate, buildWall } from '../../core/geometry/kit'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { UV_REPEAT_METERS } from '../../core/materials/textures'
import { FORBIDDEN_CITY } from '../terrain/terrainConfig'
import { INNER_COURTS, type Lod, NOI_KIM_THUY, ROAD_Y } from './constants'
import { mergeOrNull, meshFrom, paveBox, pavePlane } from './geoUtils'

const BRICK_UV = UV_REPEAT_METERS.gachBatTrang
const STONE_UV = UV_REPEAT_METERS.daThanh

/**
 * Tường hoa / tường ngăn khu trong Hoàng thành.
 * Ôm Tử Cấm + tách miếu Tây / miếu Đông / cung Tây / phủ Đông.
 * Thấp hơn thành (~2.35 m), có cổng nhỏ. [ước lượng hợp lý]
 */
export function buildPartitionWalls(lod: Lod, root: THREE.Group): void {
  const h = lod === 2 ? 1.8 : 2.35
  const t = lod === 2 ? 0.36 : 0.42

  const segments: THREE.Vector3[][] = [
    // Khung ngoài Tử Cấm — Đông / Tây (chừa Hưng Khánh / Gia Tường z≈−200)
    [new THREE.Vector3(174, 0, -368), new THREE.Vector3(174, 0, -212)],
    [new THREE.Vector3(174, 0, -188), new THREE.Vector3(174, 0, -102)],
    [new THREE.Vector3(-174, 0, -368), new THREE.Vector3(-174, 0, -212)],
    [new THREE.Vector3(-174, 0, -188), new THREE.Vector3(-174, 0, -102)],
    // Bắc — hai lỗ Tường Loan / Nghi Phụng x=±40
    [new THREE.Vector3(-162, 0, -392), new THREE.Vector3(-50, 0, -392)],
    [new THREE.Vector3(-30, 0, -392), new THREE.Vector3(30, 0, -392)],
    [new THREE.Vector3(50, 0, -392), new THREE.Vector3(162, 0, -392)],
    // Nam — lỗ Đại Cung
    [new THREE.Vector3(-162, 0, -78), new THREE.Vector3(-12, 0, -78)],
    [new THREE.Vector3(12, 0, -78), new THREE.Vector3(162, 0, -78)],

    // Miếu Tây (Thế / Hưng / Hiển Lâm)
    [new THREE.Vector3(-165, 0, -22), new THREE.Vector3(-48, 0, -22)],
    [new THREE.Vector3(-165, 0, -22), new THREE.Vector3(-165, 0, -155)],
    [new THREE.Vector3(-165, 0, -155), new THREE.Vector3(-48, 0, -155)],
    [new THREE.Vector3(-48, 0, -155), new THREE.Vector3(-48, 0, -92)],
    [new THREE.Vector3(-48, 0, -64), new THREE.Vector3(-48, 0, -22)],

    // Miếu Đông (Thái / Triệu)
    [new THREE.Vector3(48, 0, -22), new THREE.Vector3(165, 0, -22)],
    [new THREE.Vector3(165, 0, -22), new THREE.Vector3(165, 0, -145)],
    [new THREE.Vector3(165, 0, -145), new THREE.Vector3(48, 0, -145)],
    [new THREE.Vector3(48, 0, -145), new THREE.Vector3(48, 0, -92)],
    [new THREE.Vector3(48, 0, -64), new THREE.Vector3(48, 0, -22)],

    // Cung Tây — Diên Thọ / Trường Sanh
    [new THREE.Vector3(-278, 0, -180), new THREE.Vector3(-176, 0, -180)],
    [new THREE.Vector3(-278, 0, -180), new THREE.Vector3(-278, 0, -355)],
    [new THREE.Vector3(-278, 0, -355), new THREE.Vector3(-176, 0, -355)],
    [new THREE.Vector3(-176, 0, -355), new THREE.Vector3(-176, 0, -268)],
    [new THREE.Vector3(-176, 0, -232), new THREE.Vector3(-176, 0, -180)],
    // Tách Diên Thọ / Trường Sanh
    [new THREE.Vector3(-278, 0, -272), new THREE.Vector3(-188, 0, -272)],

    // Phủ Đông — Phủ Nội Vụ
    [new THREE.Vector3(176, 0, -160), new THREE.Vector3(278, 0, -160)],
    [new THREE.Vector3(278, 0, -160), new THREE.Vector3(278, 0, -285)],
    [new THREE.Vector3(278, 0, -285), new THREE.Vector3(176, 0, -285)],
    [new THREE.Vector3(176, 0, -285), new THREE.Vector3(176, 0, -232)],
    [new THREE.Vector3(176, 0, -208), new THREE.Vector3(176, 0, -160)],
  ]

  for (const path of segments) {
    root.add(
      buildWall({
        path,
        height: h,
        thickness: t,
        crenellation: false,
        lod,
        finish: 'layered',
      }),
    )
  }

  if (lod === 2) return

  const gates: Array<{ x: number; z: number; ry: number }> = [
    { x: 0, z: -78, ry: 0 },
    { x: 174, z: -200, ry: Math.PI / 2 },
    { x: -174, z: -200, ry: -Math.PI / 2 },
    { x: -100, z: -22, ry: 0 },
    { x: 100, z: -22, ry: 0 },
    { x: 176, z: -220, ry: Math.PI / 2 },
    { x: -176, z: -250, ry: Math.PI / 2 },
  ]

  for (const g of gates) {
    const gate = buildGate({ type: 'vom', lod, width: 7.2, height: 4.1 })
    gate.position.set(g.x, 0, g.z)
    gate.rotation.y = g.ry
    gate.name = 'hoa-tuong-gate'
    root.add(gate)
  }
}

/** Sân gạch giữa điện — hết cỏ golf giữa hai nhà. */
export function buildInnerCourts(lod: Lod): THREE.Mesh | null {
  const brick = getMaterial('gach_bat_trang', lod)
  const geos: THREE.BufferGeometry[] = []
  for (const c of INNER_COURTS) {
    geos.push(pavePlane(c.w, c.d, c.x, ROAD_Y + 0.01, c.z, 0, BRICK_UV))
  }
  return meshFrom(mergeOrNull(geos), brick, 'inner-courts')
}

/**
 * Kè đá Hồ Nội Kim Thủy — 3 mặt, chừa cầu cửa Tử Cấm.
 * [ước lượng hợp lý]
 */
export function buildNoiKimThuyBanks(lod: Lod): THREE.Mesh | null {
  const stone = getMaterial('da_thanh', lod)
  const geos: THREE.BufferGeometry[] = []
  const { centerX, centerZ, innerHalfX, innerHalfZ, width, copeW, copeH, gateGap } =
    NOI_KIM_THUY
  const y = copeH / 2 + 0.02
  const innerE = centerX + innerHalfX
  const innerW = centerX - innerHalfX
  const innerN = centerZ - innerHalfZ
  const innerS = centerZ + innerHalfZ
  const outerE = innerE + width
  const outerW = innerW - width
  const outerN = innerN - width

  const pushX = (x0: number, x1: number, z: number, skipX: number | null) => {
    const w = x1 - x0
    const mid = (x0 + x1) / 2
    if (skipX === null) {
      geos.push(paveBox(w, copeH, copeW, mid, y, z, 0, STONE_UV))
      return
    }
    const leftW = skipX - gateGap - x0
    const rightW = x1 - (skipX + gateGap)
    if (leftW > 1.2) {
      geos.push(paveBox(leftW, copeH, copeW, x0 + leftW / 2, y, z, 0, STONE_UV))
    }
    if (rightW > 1.2) {
      geos.push(paveBox(rightW, copeH, copeW, x1 - rightW / 2, y, z, 0, STONE_UV))
    }
  }

  const pushZ = (z0: number, z1: number, x: number, skipZ: number | null) => {
    const d = z1 - z0
    const mid = (z0 + z1) / 2
    if (skipZ === null) {
      geos.push(paveBox(copeW, copeH, d, x, y, mid, 0, STONE_UV))
      return
    }
    const southD = skipZ - gateGap - z0
    const northD = z1 - (skipZ + gateGap)
    if (southD > 1.2) {
      geos.push(paveBox(copeW, copeH, southD, x, y, z0 + southD / 2, 0, STONE_UV))
    }
    if (northD > 1.2) {
      geos.push(paveBox(copeW, copeH, northD, x, y, z1 - northD / 2, 0, STONE_UV))
    }
  }

  // North lips — chừa Tường Loan (x≈−40) + Nghi Phụng (x≈40)
  for (const z of [innerN, outerN]) {
    pushX(outerW, -47, z, null)
    pushX(-33, 33, z, null)
    pushX(47, outerE, z, null)
  }
  // East / west lips (skip Hưng Khánh / Gia Tường z≈−200)
  pushZ(innerN, innerS, innerE, FORBIDDEN_CITY.centerZ + 35)
  pushZ(innerN, innerS, outerE, FORBIDDEN_CITY.centerZ + 35)
  pushZ(innerN, innerS, innerW, FORBIDDEN_CITY.centerZ + 35)
  pushZ(innerN, innerS, outerW, FORBIDDEN_CITY.centerZ + 35)

  const mesh = meshFrom(mergeOrNull(geos), stone, 'noi-kim-thuy-ke')
  if (mesh) mesh.castShadow = lod === 0
  return mesh
}
