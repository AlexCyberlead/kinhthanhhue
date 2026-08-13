import * as THREE from 'three'
import { buildBracketSet } from '../../core/geometry/kit/buildBracketSet'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { mergeKit, meshOf } from '../../core/geometry/kit/roof/merge'
import { scaleBoxUvToMeters, uvRepeat } from '../../core/geometry/kit/uvMeters'
import { getMaterial } from '../../core/materials/MaterialLibrary'

export type DinhHallOpts = {
  width: number
  depth: number
  tiers: 1 | 2
  tile: 'ngoi_hoang_luu_ly' | 'ngoi_thanh_luu_ly'
  columnsX: number
  columnsZ: number
  variant: 'royal' | 'office' | 'residence' | 'service'
  status?: 'restored' | 'ruin'
  lod: 0 | 1 | 2
  name?: string
}

function boxUv(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  factory: 'tuongVoi' | 'goLim' | 'sonSon' | 'gachVo' | 'daThanh',
): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d)
  scaleBoxUvToMeters(g, w, h, d, uvRepeat(factory))
  g.translate(x, y, z)
  return g
}

function platHFor(variant: DinhHallOpts['variant']): number {
  if (variant === 'royal') return 1.25
  if (variant === 'service') return 0.7
  return 0.95
}

function wallHFor(variant: DinhHallOpts['variant'], lod: 0 | 1 | 2): number {
  const base = variant === 'royal' ? 6.4 : variant === 'service' ? 3.6 : 4.4
  return lod === 2 ? base * 0.82 : base
}

function ridgeFor(
  variant: DinhHallOpts['variant'],
  lod: 0 | 1 | 2,
): 'long-chau-nhat' | 'phuong' | 'bau-phap-lam' | 'none' {
  if (lod === 2) return 'none'
  if (variant === 'royal') return 'long-chau-nhat'
  if (variant === 'residence') return 'phuong'
  if (variant === 'office') return 'bau-phap-lam'
  return 'none'
}

/**
 * Factory điện / viện Tử Cấm — kit v2, LOD 0/1/2.
 * `status: 'ruin'` = nền + cột gãy + tường thấp. Không đọc store.
 */
export function buildDinhHall(opts: DinhHallOpts): THREE.Group {
  const {
    width,
    depth,
    tiers,
    tile,
    columnsX,
    columnsZ,
    variant,
    status = 'restored',
    lod,
    name = 'dinh-hall',
  } = opts

  if (status === 'ruin') return buildDinhHallRuin(opts)

  const root = new THREE.Group()
  root.name = name
  root.userData.mode = 'restored'

  const plaster = getMaterial('tuong_voi', lod)
  const wood = getMaterial('go_lim', lod)
  const son = getMaterial('go_son_son', lod)

  const platH = platHFor(variant)
  const wallH = wallHFor(variant, lod)
  const W = lod === 2 ? width * 0.88 : width
  const D = lod === 2 ? depth * 0.88 : depth

  root.add(
    buildPlatform({
      width: W + (variant === 'royal' ? 4.5 : 2.2),
      depth: D + (variant === 'royal' ? 4.5 : 2.2),
      height: platH,
      steps: lod === 2 ? 2 : variant === 'royal' ? 5 : 3,
      balustrade: lod === 0 && variant !== 'service',
      lod,
      centerDragon: lod < 2 && variant === 'royal',
      stepFace: 'south',
    }),
  )

  const floorY = platH

  if (lod === 2) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(W * 0.92, wallH, D * 0.92), plaster)
    mass.position.y = floorY + wallH / 2
    root.add(mass)
    const roof = buildRoof({
      width: W + 1.6,
      depth: D + 1.4,
      tiers: 1,
      tileMaterial: tile,
      lod,
    })
    roof.position.y = floorY + wallH
    root.add(roof)
    return root
  }

  const t = variant === 'service' ? 0.32 : 0.4
  const voiParts: THREE.BufferGeometry[] = []
  const woodParts: THREE.BufferGeometry[] = []

  for (const x of [-W / 2 + t / 2, W / 2 - t / 2]) {
    voiParts.push(boxUv(t, wallH, D * 0.9, x, floorY + wallH / 2, 0, 'tuongVoi'))
  }
  voiParts.push(boxUv(W * 0.92, wallH, t, 0, floorY + wallH / 2, -D / 2 + t / 2, 'tuongVoi'))

  const breastH = wallH * (variant === 'service' ? 0.55 : 0.38)
  for (const x of [-W * 0.3, W * 0.3]) {
    voiParts.push(boxUv(W * 0.26, breastH, t, x, floorY + breastH / 2, D / 2 - t / 2, 'tuongVoi'))
  }

  woodParts.push(boxUv(W - 1.0, 0.12, D - 0.8, 0, floorY + 0.08, 0, 'goLim'))

  const voiMesh = meshOf(mergeKit(voiParts), plaster, `${name}-walls`)
  const woodMesh = meshOf(mergeKit(woodParts), wood, `${name}-floor`)
  if (voiMesh) {
    voiMesh.castShadow = true
    voiMesh.receiveShadow = true
    root.add(voiMesh)
  }
  if (woodMesh) {
    woodMesh.receiveShadow = true
    root.add(woodMesh)
  }

  const doorW = variant === 'royal' ? 3.2 : 2.4
  const frame = new THREE.Mesh(new THREE.BoxGeometry(doorW, wallH * 0.74, 0.26), son)
  frame.position.set(0, floorY + wallH * 0.37, D / 2 - 0.16)
  frame.castShadow = true
  root.add(frame)
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(doorW * 0.84, wallH * 0.66, 0.1), wood)
  leaf.position.set(0, floorY + wallH * 0.34, D / 2 - 0.04)
  root.add(leaf)

  const cols = buildColumnGrid({
    rows: Math.max(2, columnsZ),
    cols: Math.max(2, columnsX),
    spacing: [W / Math.max(1, columnsX + 0.4), D / Math.max(1, columnsZ + 0.4)],
    height: wallH - 0.12,
    radius: variant === 'royal' ? 0.28 : 0.2,
    material: variant === 'service' ? 'go_lim' : 'go_son_son',
    lod,
  })
  cols.position.y = floorY
  root.add(cols)

  const beamY = floorY + wallH
  const plate = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.22, D + 0.6), wood)
  plate.position.y = beamY
  plate.receiveShadow = true
  root.add(plate)

  if (lod === 0 && variant !== 'service') {
    for (const x of [-W / 2 + 1.4, W / 2 - 1.4]) {
      for (const z of [-D / 2 + 1.1, D / 2 - 1.1]) {
        const br = buildBracketSet({
          width: variant === 'royal' ? 1.5 : 1.15,
          depth: 0.95,
          height: 0.7,
          layers: variant === 'royal' ? 3 : 2,
          lod,
        })
        br.position.set(x, beamY - 0.04, z)
        root.add(br)
      }
    }
  }

  const roof = buildRoof({
    width: W + (variant === 'royal' ? 4.2 : 2.4),
    depth: D + (variant === 'royal' ? 3.4 : 2.0),
    tiers: lod === 0 ? tiers : 1,
    tileMaterial: tile,
    ridge: ridgeFor(variant, lod),
    coDiem: tiers > 1,
    lod,
  })
  roof.position.y = beamY + 0.1
  root.add(roof)

  return root
}

/** Ruin: nền + cột gãy + tường thấp. Pure — không đọc zustand. */
export function buildDinhHallRuin(opts: DinhHallOpts): THREE.Group {
  const { width, depth, columnsX, columnsZ, lod, name = 'dinh-hall-ruin', variant } = opts
  const root = new THREE.Group()
  root.name = `${name}-ruin`
  root.userData.mode = 'ruin'

  const brick = getMaterial('gach_vo', lod)
  const stone = getMaterial('da_thanh', lod)
  const wood = getMaterial('go_lim', lod)

  const platH = 0.75
  const W = lod === 2 ? width * 0.85 : width
  const D = lod === 2 ? depth * 0.85 : depth

  const foundation = new THREE.Mesh(new THREE.BoxGeometry(W + 2.4, platH, D + 2.4), brick)
  scaleBoxUvToMeters(foundation.geometry, W + 2.4, platH, D + 2.4, uvRepeat('gachVo'))
  foundation.position.y = platH / 2
  foundation.receiveShadow = true
  foundation.castShadow = lod < 2
  root.add(foundation)

  if (lod === 2) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(W * 0.6, 1.1, D * 0.55), brick)
    mass.position.y = platH + 0.55
    root.add(mass)
    return root
  }

  // Tường thấp gãy
  const stubH = lod === 0 ? 1.35 : 0.95
  const wall = new THREE.Mesh(new THREE.BoxGeometry(W * 0.7, stubH, 0.38), getMaterial('tuong_voi', lod))
  wall.position.set(0, platH + stubH / 2, -D * 0.35)
  wall.castShadow = true
  root.add(wall)

  const stumpH = lod === 0 ? 1.25 : 0.9
  const rows = Math.max(2, lod === 0 ? columnsZ : Math.max(2, columnsZ - 1))
  const cols = Math.max(2, lod === 0 ? columnsX : Math.max(2, columnsX - 1))
  const geo = new THREE.CylinderGeometry(0.22, 0.26, stumpH, lod === 0 ? 8 : 5)
  const mesh = new THREE.InstancedMesh(geo, wood, rows * cols)
  mesh.name = 'ruin-stumps'
  mesh.castShadow = true
  const sx = W / (cols + 0.6)
  const sz = D / (rows + 0.6)
  const ox = -((cols - 1) * sx) / 2
  const oz = -((rows - 1) * sz) / 2
  const dummy = new THREE.Object3D()
  let i = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 5 === 0) {
        dummy.position.set(0, -40, 0)
        dummy.scale.set(0.001, 0.001, 0.001)
      } else {
        const hJ = 0.65 + ((r * 3 + c) % 4) * 0.12
        dummy.position.set(ox + c * sx, platH + (stumpH * hJ) / 2, oz + r * sz)
        dummy.scale.set(1, hJ, 1)
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

  if (lod === 0) {
    const rubbleGeo = new THREE.BoxGeometry(1.8, 0.32, 1.2)
    const spots: [number, number][] = [
      [-W * 0.38, D * 0.4],
      [W * 0.34, D * 0.36],
      [-W * 0.28, -D * 0.32],
      [W * 0.4, -D * 0.3],
    ]
    const rubble = new THREE.InstancedMesh(rubbleGeo, stone, spots.length)
    spots.forEach(([x, z], idx) => {
      dummy.position.set(x, platH + 0.14, z)
      dummy.rotation.y = x * 0.08
      dummy.updateMatrix()
      rubble.setMatrixAt(idx, dummy.matrix)
    })
    rubble.instanceMatrix.needsUpdate = true
    root.add(rubble)

    if (variant === 'royal') {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.3, 0.35), wood)
      beam.position.set(2.2, platH + 0.5, -1.2)
      beam.rotation.set(0.12, 0.45, 0.32)
      root.add(beam)
    }
  }

  return root
}
