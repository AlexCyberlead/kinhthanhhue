import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { mergeOrNull, boxAt } from './geoUtils'
import { COURT_Y } from './courtyard'

/**
 * Tứ tượng — 4 linh vật góc sân/hồ (stylized low-poly).
 * Đông Thanh Long · Tây Bạch Hổ · Nam Chu Tước · Bắc Huyền Vũ.
 * Đặt gần góc sân phía hồ Thái Dịch / mép sân.
 */
export type TuTuongId = 'thanh-long' | 'bach-ho' | 'chu-tuoc' | 'huyen-vu'

const PLACEMENTS: ReadonlyArray<{
  id: TuTuongId
  x: number
  z: number
  rotY: number
}> = [
  { id: 'thanh-long', x: 34, z: 22, rotY: -Math.PI / 2 }, // Đông, nhìn vào sân
  { id: 'bach-ho', x: -34, z: 22, rotY: Math.PI / 2 },
  { id: 'chu-tuoc', x: 0, z: 28, rotY: Math.PI }, // Nam (+Z)
  { id: 'huyen-vu', x: 0, z: -28, rotY: 0 }, // Bắc (−Z)
]

function beastMat(id: TuTuongId, lod: 0 | 1 | 2): THREE.MeshStandardMaterial {
  switch (id) {
    case 'thanh-long':
      return getMaterial('ngoi_thanh_luu_ly', lod)
    case 'bach-ho':
      return getMaterial('tuong_voi', lod)
    case 'chu-tuoc':
      return getMaterial('go_son_son', lod)
    case 'huyen-vu':
      return getMaterial('da_thanh', lod)
  }
}

function buildPedestal(lod: 0 | 1 | 2): THREE.BufferGeometry {
  const h = lod === 2 ? 0.45 : 0.65
  return boxAt(1.6, h, 1.6, 0, h / 2, 0)
}

function buildThanhLong(lod: 0 | 1 | 2): THREE.BufferGeometry {
  const segs = lod === 0 ? 8 : 5
  const parts: THREE.BufferGeometry[] = []
  // coiled body
  const body = new THREE.CylinderGeometry(0.22, 0.28, 2.4, segs)
  body.rotateZ(Math.PI / 2)
  body.translate(0, 1.1, 0)
  parts.push(body)
  // head
  const head = new THREE.SphereGeometry(0.32, segs, segs)
  head.translate(1.35, 1.35, 0)
  parts.push(head)
  // horns
  if (lod < 2) {
    for (const s of [-1, 1] as const) {
      const horn = new THREE.ConeGeometry(0.06, 0.35, 4)
      horn.translate(1.45, 1.7, s * 0.12)
      parts.push(horn)
    }
  }
  // legs
  if (lod === 0) {
    for (const [lx, lz] of [
      [-0.6, 0.25],
      [-0.6, -0.25],
      [0.4, 0.25],
      [0.4, -0.25],
    ] as const) {
      const leg = new THREE.CylinderGeometry(0.07, 0.09, 0.55, 4)
      leg.translate(lx, 0.55, lz)
      parts.push(leg)
    }
  }
  return mergeOrNull(parts)!
}

function buildBachHo(lod: 0 | 1 | 2): THREE.BufferGeometry {
  const segs = lod === 0 ? 8 : 5
  const parts: THREE.BufferGeometry[] = []
  const torso = new THREE.BoxGeometry(1.5, 0.7, 0.7)
  torso.translate(0, 1.05, 0)
  parts.push(torso)
  const head = new THREE.SphereGeometry(0.28, segs, segs)
  head.scale(1.15, 0.9, 0.85)
  head.translate(0.95, 1.25, 0)
  parts.push(head)
  if (lod < 2) {
    const snout = new THREE.BoxGeometry(0.35, 0.2, 0.25)
    snout.translate(1.25, 1.1, 0)
    parts.push(snout)
    // ears
    for (const s of [-1, 1] as const) {
      const ear = new THREE.ConeGeometry(0.08, 0.22, 4)
      ear.translate(0.85, 1.55, s * 0.18)
      parts.push(ear)
    }
    // tail
    const tail = new THREE.CylinderGeometry(0.06, 0.1, 1.1, 4)
    tail.rotateZ(-Math.PI / 3)
    tail.translate(-1.1, 1.2, 0)
    parts.push(tail)
  }
  if (lod === 0) {
    for (const [lx, lz] of [
      [0.45, 0.28],
      [0.45, -0.28],
      [-0.45, 0.28],
      [-0.45, -0.28],
    ] as const) {
      const leg = new THREE.CylinderGeometry(0.09, 0.11, 0.7, 4)
      leg.translate(lx, 0.5, lz)
      parts.push(leg)
    }
  }
  return mergeOrNull(parts)!
}

function buildChuTuoc(lod: 0 | 1 | 2): THREE.BufferGeometry {
  const segs = lod === 0 ? 8 : 5
  const parts: THREE.BufferGeometry[] = []
  const body = new THREE.SphereGeometry(0.45, segs, segs)
  body.scale(1, 0.85, 1.2)
  body.translate(0, 1.2, 0)
  parts.push(body)
  const head = new THREE.SphereGeometry(0.22, segs, segs)
  head.translate(0, 1.55, 0.45)
  parts.push(head)
  // beak
  const beak = new THREE.ConeGeometry(0.08, 0.28, 4)
  beak.rotateX(Math.PI / 2)
  beak.translate(0, 1.45, 0.7)
  parts.push(beak)
  // wings
  if (lod < 2) {
    for (const s of [-1, 1] as const) {
      const wing = new THREE.BoxGeometry(1.4, 0.08, 0.55)
      wing.translate(s * 0.85, 1.25, -0.05)
      wing.rotateZ(s * 0.35)
      parts.push(wing)
    }
  }
  // tail feathers
  if (lod === 0) {
    for (let i = 0; i < 3; i++) {
      const f = new THREE.BoxGeometry(0.12, 0.05, 0.9)
      f.translate((i - 1) * 0.18, 1.1, -0.85)
      parts.push(f)
    }
  }
  return mergeOrNull(parts)!
}

function buildHuyenVu(lod: 0 | 1 | 2): THREE.BufferGeometry {
  const segs = lod === 0 ? 8 : 5
  const parts: THREE.BufferGeometry[] = []
  // tortoise shell
  const shell = new THREE.SphereGeometry(0.7, segs, segs, 0, Math.PI * 2, 0, Math.PI / 2)
  shell.scale(1.15, 0.7, 1.25)
  shell.translate(0, 0.85, 0)
  parts.push(shell)
  // underbelly
  const belly = new THREE.CylinderGeometry(0.55, 0.55, 0.25, segs)
  belly.translate(0, 0.55, 0)
  parts.push(belly)
  // head
  const head = new THREE.SphereGeometry(0.2, segs, segs)
  head.translate(0, 0.75, 0.85)
  parts.push(head)
  // snake coiled on shell (Huyền Vũ = tortoise + snake)
  if (lod < 2) {
    const snake = new THREE.TorusGeometry(0.45, 0.07, 4, lod === 0 ? 12 : 8)
    snake.rotateX(Math.PI / 2)
    snake.translate(0, 1.25, 0)
    parts.push(snake)
    const snakeHead = new THREE.SphereGeometry(0.1, 5, 5)
    snakeHead.translate(0.45, 1.35, 0.1)
    parts.push(snakeHead)
  }
  return mergeOrNull(parts)!
}

function buildBeastGeo(id: TuTuongId, lod: 0 | 1 | 2): THREE.BufferGeometry {
  switch (id) {
    case 'thanh-long':
      return buildThanhLong(lod)
    case 'bach-ho':
      return buildBachHo(lod)
    case 'chu-tuoc':
      return buildChuTuoc(lod)
    case 'huyen-vu':
      return buildHuyenVu(lod)
  }
}

export function buildTuTuong(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'tu-tuong'

  const stone = getMaterial('da_thanh', lod)
  const gold = getMaterial('vang_thep', lod)

  // Shared pedestals — 1 InstancedMesh
  const pedGeo = buildPedestal(lod)
  const pedestals = new THREE.InstancedMesh(pedGeo, stone, PLACEMENTS.length)
  pedestals.name = 'tu-tuong-pedestals'
  pedestals.castShadow = lod === 0
  pedestals.receiveShadow = true
  const dummy = new THREE.Object3D()

  PLACEMENTS.forEach((p, i) => {
    dummy.position.set(p.x, COURT_Y, p.z)
    dummy.rotation.set(0, p.rotY, 0)
    dummy.scale.set(1, 1, 1)
    dummy.updateMatrix()
    pedestals.setMatrixAt(i, dummy.matrix)
  })
  pedestals.instanceMatrix.needsUpdate = true
  root.add(pedestals)

  const pedH = lod === 2 ? 0.45 : 0.65

  for (const p of PLACEMENTS) {
    const geo = buildBeastGeo(p.id, lod)
    const mesh = new THREE.Mesh(geo, beastMat(p.id, lod))
    mesh.name = p.id
    mesh.position.set(p.x, COURT_Y + pedH, p.z)
    mesh.rotation.y = p.rotY
    mesh.castShadow = lod < 2
    mesh.receiveShadow = true
    root.add(mesh)

    // Small gilt accent plaque on pedestal (LOD0 only) — merged later? keep 1 shared instanced
  }

  if (lod === 0) {
    const accentGeo = new THREE.BoxGeometry(0.5, 0.08, 0.12)
    const accents = new THREE.InstancedMesh(accentGeo, gold, PLACEMENTS.length)
    accents.name = 'tu-tuong-accents'
    PLACEMENTS.forEach((p, i) => {
      dummy.position.set(p.x, COURT_Y + pedH - 0.05, p.z)
      dummy.rotation.set(0, p.rotY, 0)
      dummy.updateMatrix()
      accents.setMatrixAt(i, dummy.matrix)
    })
    accents.instanceMatrix.needsUpdate = true
    accents.castShadow = true
    root.add(accents)
  }

  return root
}

/** Lake-bank alternate placements (optional helper for orchestrator). */
export const TU_TUONG_LAKE_CORNERS: ReadonlyArray<{ id: TuTuongId; x: number; z: number }> = [
  { id: 'thanh-long', x: 52, z: 40 },
  { id: 'bach-ho', x: -52, z: 40 },
  { id: 'chu-tuoc', x: 0, z: 72 },
  { id: 'huyen-vu', x: 0, z: 36 },
]
