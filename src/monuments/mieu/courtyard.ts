import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildWall } from '../../core/geometry/kit/buildWall'

export type MieuCourtyardOpts = {
  /** Outer court width (X). */
  width: number
  /** Outer court depth (Z). */
  depth: number
  lod?: 0 | 1 | 2
  /** Small ceremonial gate on +Z (south). */
  nghiMon?: boolean
  wallHeight?: number
}

/**
 * Sân miếu shared — nền đá / gạch, tường bao thấp, nghi môn nhỏ mặt Nam.
 * Budget-aware: LOD1 merges wall path + lean nghi môn.
 */
export function buildMieuCourtyard(opts: MieuCourtyardOpts): THREE.Group {
  const {
    width,
    depth,
    lod = 1,
    nghiMon = true,
    wallHeight = lod === 2 ? 1.8 : 2.7,
  } = opts

  const root = new THREE.Group()
  root.name = 'mieu-courtyard'

  const stone = getMaterial('da_thanh', lod)
  const brick = getMaterial('gach_bat_trang', lod)
  const plaster = getMaterial('tuong_voi', lod)

  // Paving — single draw call
  const pave = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.92, 0.12, depth * 0.92),
    lod === 0 ? brick : stone,
  )
  pave.position.y = 0.06
  pave.receiveShadow = true
  root.add(pave)

  if (lod === 2) {
    // Massing: low U-wall hint as one box ring via 3 walls
    for (const [x, z, w, d] of [
      [0, -depth * 0.45, width * 0.9, 0.45],
      [-width * 0.45, 0, 0.45, depth * 0.85],
      [width * 0.45, 0, 0.45, depth * 0.85],
    ] as const) {
      const wmesh = new THREE.Mesh(new THREE.BoxGeometry(w, wallHeight, d), plaster)
      wmesh.position.set(x, wallHeight / 2, z)
      root.add(wmesh)
    }
    if (nghiMon) {
      const gate = new THREE.Mesh(new THREE.BoxGeometry(4.5, wallHeight * 1.15, 1.2), plaster)
      gate.position.set(0, (wallHeight * 1.15) / 2, depth * 0.42)
      root.add(gate)
    }
    return root
  }

  // Perimeter walls — single merged mesh via kit (U: open south for nghi môn)
  const hw = width * 0.48
  const hd = depth * 0.48
  const wall = buildWall({
    path: [
      new THREE.Vector3(-hw * 0.55, 0, hd),
      new THREE.Vector3(-hw, 0, hd),
      new THREE.Vector3(-hw, 0, -hd),
      new THREE.Vector3(hw, 0, -hd),
      new THREE.Vector3(hw, 0, hd),
      new THREE.Vector3(hw * 0.55, 0, hd),
    ],
    height: wallHeight,
    thickness: lod === 0 ? 0.55 : 0.45,
    crenellation: false,
    lod,
  })
  root.add(wall)

  // Corner accent piers (LOD0 only)
  if (lod === 0) {
    const pierGeo = new THREE.BoxGeometry(0.7, wallHeight + 0.4, 0.7)
    for (const [x, z] of [
      [-hw, -hd],
      [hw, -hd],
      [-hw, hd],
      [hw, hd],
    ] as const) {
      const pier = new THREE.Mesh(pierGeo, stone)
      pier.position.set(x, (wallHeight + 0.4) / 2, z)
      pier.castShadow = true
      root.add(pier)
    }
  }

  if (nghiMon) {
    root.add(buildNghiMon({ lod, wallHeight, z: depth * 0.42 }))
  }

  return root
}

/** Nghi môn nhỏ — stylized single-bay ceremonial gate. */
export function buildNghiMon(opts: {
  lod?: 0 | 1 | 2
  wallHeight?: number
  z?: number
  width?: number
}): THREE.Group {
  const { lod = 1, wallHeight = 2.4, z = 0, width = 5.2 } = opts
  const g = new THREE.Group()
  g.name = 'nghi-mon'
  g.position.z = z

  const plaster = getMaterial('tuong_voi', lod)
  const stone = getMaterial('da_thanh', lod)
  const son = getMaterial('go_son_son', lod)

  const h = wallHeight * 1.25
  const pierW = 0.85

  if (lod === 2) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(width, h, 1.1), plaster)
    mass.position.y = h / 2
    g.add(mass)
    return g
  }

  // Two piers as InstancedMesh (1 draw call) + lintel
  const pierGeo = new THREE.BoxGeometry(pierW, h, 1.15)
  const piers = new THREE.InstancedMesh(pierGeo, plaster, 2)
  piers.castShadow = true
  const dummy = new THREE.Object3D()
  ;[-width * 0.42, width * 0.42].forEach((x, i) => {
    dummy.position.set(x, h / 2, 0)
    dummy.updateMatrix()
    piers.setMatrixAt(i, dummy.matrix)
  })
  piers.instanceMatrix.needsUpdate = true
  g.add(piers)

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(width * 0.95, 0.55, 1.25), stone)
  lintel.position.y = h + 0.15
  lintel.castShadow = true
  g.add(lintel)

  if (lod < 2) {
    // LOD0: timber frame + curved roof
    const beam = new THREE.Mesh(new THREE.BoxGeometry(width * 0.9, 0.22, 0.28), son)
    beam.position.y = h - 0.35
    g.add(beam)

    const roof = buildRoof({
      width: width * 1.25,
      depth: 2.6,
      tiers: 1,
      tileMaterial: 'ngoi_thanh_luu_ly',
      ridge: lod === 0 ? 'bau-phap-lam' : 'none',
      lod,
    })
    roof.position.y = h + 0.45
    g.add(roof)
  }

  return g
}
