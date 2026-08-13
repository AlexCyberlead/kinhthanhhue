import * as THREE from 'three'
import { getMaterial } from '../../materials/MaterialLibrary'
import { dragonOrnamentGeo, hoiVanBandGeo } from './ornament'
import { mergeKit, meshOf } from './roof/merge'
import { copyUvToUv2, scaleBoxUvToMeters, uvRepeat } from './uvMeters'

export type PlatformOpts = {
  width: number
  depth: number
  steps?: number
  balustrade?: boolean
  height?: number
  lod?: 0 | 1 | 2
  /** Rồng thành bậc lối giữa. Mặc định tắt — chỉ hero / cửa lớn bật. */
  centerDragon?: boolean
  /** Mặt bậc. Mặc định +Z (Nam). */
  stepFace?: 'south' | 'north' | 'both' | 'none'
}

function boxAt(w: number, h: number, d: number, x: number, y: number, z: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d)
  g.translate(x, y, z)
  return g
}

function boxUv(w: number, h: number, d: number, x: number, y: number, z: number, factory: 'daThanh' | 'gachBatTrang'): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d)
  scaleBoxUvToMeters(g, w, h, d, uvRepeat(factory))
  g.translate(x, y, z)
  return g
}

/** Con tiện — dáng bình, lathe. [ước lượng hợp lý] cao ~0.72 m. */
function conTienGeo(h: number, lod: 0 | 1): THREE.BufferGeometry {
  const s = h / 0.72
  const pts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.065 * s, 0.015 * s),
    new THREE.Vector2(0.05 * s, 0.07 * s),
    new THREE.Vector2(0.088 * s, 0.22 * s),
    new THREE.Vector2(0.048 * s, 0.38 * s),
    new THREE.Vector2(0.068 * s, 0.5 * s),
    new THREE.Vector2(0.042 * s, 0.62 * s),
    new THREE.Vector2(0.058 * s, 0.7 * s),
    new THREE.Vector2(0.001, 0.72 * s),
  ]
  const g = new THREE.LatheGeometry(pts, lod === 0 ? 8 : 6)
  copyUvToUv2(g)
  return g
}

function addSteps(
  stone: THREE.BufferGeometry[],
  width: number,
  depth: number,
  height: number,
  steps: number,
  toward: 1 | -1,
): { stepW: number; run: number } {
  const stepCount = Math.max(1, steps)
  const stepD = 0.52
  const stepW = width * 0.45
  for (let i = 0; i < stepCount; i++) {
    const h = ((i + 1) / stepCount) * height
    const z = toward * (depth / 2 + stepD * (i + 0.5))
    stone.push(boxUv(stepW, h, stepD, 0, h / 2, z, 'daThanh'))
  }
  // thành bậc hai bên
  const run = stepD * stepCount
  const cheekH = height * 0.55
  const cheekZ = toward * (depth / 2 + run * 0.5)
  stone.push(boxUv(0.22, cheekH, run + 0.1, -stepW * 0.5 - 0.08, cheekH / 2, cheekZ, 'daThanh'))
  stone.push(boxUv(0.22, cheekH, run + 0.1, stepW * 0.5 + 0.08, cheekH / 2, cheekZ, 'daThanh'))
  return { stepW, run }
}

/**
 * Nền điện: sàn gạch Bát Tràng, bó vỉa đá thanh, bậc, lan can con tiện.
 */
export function buildPlatform(opts: PlatformOpts): THREE.Group {
  const {
    width,
    depth,
    steps = 3,
    balustrade = true,
    height = 1.2,
    lod = 0,
    centerDragon = false,
    stepFace = 'south',
  } = opts
  const group = new THREE.Group()
  group.name = 'platform'
  const stone = getMaterial('da_thanh', lod)
  const brick = getMaterial('gach_bat_trang', lod)

  // Khối lõi đá + sàn gạch inset
  const core = new THREE.Mesh(boxUv(width, height * 0.92, depth, 0, height * 0.46, 0, 'daThanh'), stone)
  core.name = 'platform-core'
  core.castShadow = true
  core.receiveShadow = true
  group.add(core)

  const inset = lod === 2 ? 0.12 : 0.28
  const floor = new THREE.Mesh(
    boxUv(width - inset * 2, 0.07, depth - inset * 2, 0, height + 0.02, 0, 'gachBatTrang'),
    brick,
  )
  floor.name = 'platform-floor'
  floor.receiveShadow = true
  group.add(floor)

  const stoneParts: THREE.BufferGeometry[] = []

  if (lod < 2) {
    const curbH = 0.16
    const curbT = 0.22
    const y = height + curbH / 2
    stoneParts.push(boxUv(width + curbT * 2, curbH, curbT, 0, y, -depth / 2 - curbT / 2, 'daThanh'))
    stoneParts.push(boxUv(width + curbT * 2, curbH, curbT, 0, y, depth / 2 + curbT / 2, 'daThanh'))
    stoneParts.push(boxUv(curbT, curbH, depth, -width / 2 - curbT / 2, y, 0, 'daThanh'))
    stoneParts.push(boxUv(curbT, curbH, depth, width / 2 + curbT / 2, y, 0, 'daThanh'))
  }

  const stepCount = lod === 2 ? Math.min(2, steps) : steps
  const faces: Array<1 | -1> = []
  if (stepFace === 'south' || stepFace === 'both') faces.push(1)
  if (stepFace === 'north' || stepFace === 'both') faces.push(-1)

  let southRun = 0
  let southW = width * 0.45
  for (const toward of faces) {
    const info = addSteps(stoneParts, width, depth, height, stepCount, toward)
    if (toward === 1) {
      southRun = info.run
      southW = info.stepW
    }
  }

  const curbMesh = meshOf(mergeKit(stoneParts), stone, 'platform-stone')
  if (curbMesh) {
    curbMesh.receiveShadow = true
    group.add(curbMesh)
  }

  if (centerDragon && lod < 2 && faces.includes(1) && southRun > 0.4) {
    const L: 0 | 1 = lod === 0 ? 0 : 1
    const geo = dragonOrnamentGeo(0.42, L)
    if (geo) {
      const gold = getMaterial('vang_thep', lod)
      const pitch = Math.atan2(height, southRun)
      for (const side of [-1, 1]) {
        const d = new THREE.Mesh(geo, gold)
        d.name = side < 0 ? 'rong-bac-trai' : 'rong-bac-phai'
        d.castShadow = true
        d.position.set(side * (southW * 0.5 + 0.12), height * 0.22, depth / 2 + southRun * 0.35)
        d.rotation.set(-pitch * 0.35, side < 0 ? 0 : Math.PI, side * 0.15)
        group.add(d)
      }
    }
  }

  if (balustrade && lod < 2) {
    const railH = 0.72
    const postY = height + 0.04
    const count = Math.max(4, Math.floor(width / 1.35))
    const zN = -depth / 2 + 0.18
    const zS = depth / 2 - 0.18
    const stairGap = faces.includes(1) ? southW * 0.55 : 0

    const tien = new THREE.InstancedMesh(conTienGeo(railH, lod === 0 ? 0 : 1), stone, count * 2)
    tien.name = 'con-tien'
    tien.castShadow = true
    const dummy = new THREE.Object3D()
    let idx = 0
    for (const z of [zN, zS]) {
      for (let i = 0; i < count; i++) {
        const x = -width / 2 + 0.28 + (i / Math.max(1, count - 1)) * (width - 0.56)
        if (z === zS && Math.abs(x) < stairGap) {
          dummy.position.set(0, -40, 0)
        } else {
          dummy.position.set(x, postY, z)
        }
        dummy.updateMatrix()
        tien.setMatrixAt(idx++, dummy.matrix)
      }
    }
    tien.instanceMatrix.needsUpdate = true
    group.add(tien)

    const railParts: THREE.BufferGeometry[] = [
      boxAt(width - 0.35, 0.08, 0.1, 0, height + railH + 0.04, zN),
    ]
    if (stairGap > 0) {
      const wing = (width - stairGap * 2) * 0.5
      if (wing > 0.6) {
        railParts.push(boxAt(wing, 0.08, 0.1, -width / 2 + wing / 2 + 0.15, height + railH + 0.04, zS))
        railParts.push(boxAt(wing, 0.08, 0.1, width / 2 - wing / 2 - 0.15, height + railH + 0.04, zS))
      }
    } else {
      railParts.push(boxAt(width - 0.35, 0.08, 0.1, 0, height + railH + 0.04, zS))
    }
    const rails = meshOf(mergeKit(railParts), stone, 'platform-rails')
    if (rails) group.add(rails)

    if (lod === 0) {
      const band = hoiVanBandGeo(Math.min(2.4, width * 0.28), 0.22, 0.03, 0)
      if (band) {
        const gold = getMaterial('vang_thep', lod)
        for (const x of [-width / 2 + 0.4, width / 2 - 0.4]) {
          const m = new THREE.Mesh(band, gold)
          m.position.set(x, height + 0.35, zN - 0.06)
          group.add(m)
        }
      }
    }
  }

  return group
}
