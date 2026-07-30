import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { NGO_MON } from './geometry'

/**
 * Nền đài chữ U — mở về Nam (+Z), 5 lối đi (giữa dành vua).
 * Gạch vồ + đá thanh + bậc + lan can.
 * LOD1 giữ draw-call thấp: InstancedMesh cho openings / posts.
 */
export function buildUPlatform(lod: 0 | 1 | 2): THREE.Group {
  const g = new THREE.Group()
  g.name = 'u-platform'

  const brick = getMaterial('gach_vo', lod)
  const stone = getMaterial('da_thanh', lod)
  const tile = getMaterial('gach_bat_trang', lod)
  const wood = getMaterial('go_lim', lod)

  const { width: W, depth: D, armThickness: A, bodyHeight: H } = NGO_MON
  const courtW = W - 2 * A
  const courtD = D - A
  const barZ = -D / 2 + A / 2
  const armCenterZ = -D / 2 + A + courtD / 2

  // --- Mass: north bar + east/west arms ---
  const bar = new THREE.Mesh(new THREE.BoxGeometry(W, H, A), brick)
  bar.position.set(0, H / 2, barZ)
  bar.castShadow = true
  bar.receiveShadow = true
  g.add(bar)

  const armGeo = new THREE.BoxGeometry(A, H, courtD)
  for (const sx of [-1, 1] as const) {
    const arm = new THREE.Mesh(armGeo, brick)
    arm.position.set(sx * (W / 2 - A / 2), H / 2, armCenterZ)
    arm.castShadow = true
    arm.receiveShadow = true
    g.add(arm)
  }

  // Stone plinth
  if (lod < 2) {
    const plinthH = 0.55
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(W + 0.8, plinthH, D + 0.8), stone)
    plinth.position.y = plinthH / 2
    plinth.receiveShadow = true
    g.add(plinth)

    if (lod === 0) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(W + 0.15, 0.28, A + 0.15), stone)
      band.position.set(0, H * 0.55, barZ)
      g.add(band)
    }
  }

  // Deck
  const deckY = H
  const deckT = NGO_MON.deckThickness
  const deckN = new THREE.Mesh(new THREE.BoxGeometry(W, deckT, A), tile)
  deckN.position.set(0, deckY + deckT / 2, barZ)
  deckN.receiveShadow = true
  g.add(deckN)

  if (lod < 2) {
    const deckArmGeo = new THREE.BoxGeometry(A, deckT, courtD)
    for (const sx of [-1, 1] as const) {
      const d = new THREE.Mesh(deckArmGeo, tile)
      d.position.set(sx * (W / 2 - A / 2), deckY + deckT / 2, armCenterZ)
      d.receiveShadow = true
      g.add(d)
    }

    const court = new THREE.Mesh(new THREE.BoxGeometry(courtW - 0.4, 0.12, courtD - 0.2), brick)
    court.position.set(0, 0.06, armCenterZ)
    court.receiveShadow = true
    g.add(court)
  }

  // --- 5 openings ---
  const faceZ = barZ + A / 2 - 0.15
  const oh = NGO_MON.openingH
  const spacing = NGO_MON.openingSpacing
  const openingXs = [-2, -1, 0, 1, 2].map((i) => i * spacing)
  const sideW = NGO_MON.openingWSide
  const royalW = NGO_MON.openingWRoyal

  if (lod === 2) {
    const dark = getMaterial('go_lim', lod)
    const sideGeo = new THREE.BoxGeometry(sideW * 0.95, oh * 0.95, 1.2)
    const sides = new THREE.InstancedMesh(sideGeo, dark, 4)
    const dummy = new THREE.Object3D()
    let idx = 0
    for (let i = 0; i < 5; i++) {
      if (i === 2) continue
      dummy.position.set(openingXs[i], oh * 0.48, faceZ)
      dummy.updateMatrix()
      sides.setMatrixAt(idx++, dummy.matrix)
    }
    sides.instanceMatrix.needsUpdate = true
    g.add(sides)
    const royal = new THREE.Mesh(new THREE.BoxGeometry(royalW * 0.95, oh * 0.95, 1.2), dark)
    royal.position.set(0, oh * 0.48, faceZ)
    g.add(royal)
  } else if (lod === 1) {
    // 4 side recesses + 1 royal + 1 lintel instance set
    const recessGeo = new THREE.BoxGeometry(sideW, oh, A * 0.92)
    const recesses = new THREE.InstancedMesh(recessGeo, wood, 4)
    const dummy = new THREE.Object3D()
    let idx = 0
    for (let i = 0; i < 5; i++) {
      if (i === 2) continue
      dummy.position.set(openingXs[i], oh / 2 + 0.15, barZ)
      dummy.updateMatrix()
      recesses.setMatrixAt(idx++, dummy.matrix)
    }
    recesses.instanceMatrix.needsUpdate = true
    g.add(recesses)

    const royal = new THREE.Mesh(new THREE.BoxGeometry(royalW, oh, A * 0.92), wood)
    royal.position.set(0, oh / 2 + 0.15, barZ)
    g.add(royal)

    const lintelGeo = new THREE.BoxGeometry(sideW + 0.9, 0.5, A * 0.5)
    const lintels = new THREE.InstancedMesh(lintelGeo, stone, 5)
    for (let i = 0; i < 5; i++) {
      const s = i === 2 ? royalW / sideW : 1
      dummy.position.set(openingXs[i], oh + 0.48, faceZ - 0.35)
      dummy.scale.set(s, 1, 1)
      dummy.updateMatrix()
      lintels.setMatrixAt(i, dummy.matrix)
      dummy.scale.set(1, 1, 1)
    }
    lintels.instanceMatrix.needsUpdate = true
    g.add(lintels)
  } else {
    // LOD0: full jambs + lintels + royal cheeks
    for (let i = 0; i < 5; i++) {
      const ow = i === 2 ? royalW : sideW
      const recess = new THREE.Mesh(new THREE.BoxGeometry(ow, oh, A * 0.92), wood)
      recess.position.set(openingXs[i], oh / 2 + 0.15, barZ)
      g.add(recess)

      const jambGeo = new THREE.BoxGeometry(0.35, oh + 0.3, A * 0.5)
      for (const side of [-1, 1] as const) {
        const jamb = new THREE.Mesh(jambGeo, stone)
        jamb.position.set(openingXs[i] + side * (ow / 2 + 0.15), oh / 2 + 0.15, faceZ - 0.4)
        g.add(jamb)
      }
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(ow + 1.0, 0.55, A * 0.55), stone)
      lintel.position.set(openingXs[i], oh + 0.5, faceZ - 0.35)
      g.add(lintel)

      if (i === 2) {
        const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 2.2), stone)
        for (const side of [-1, 1] as const) {
          const c = cheek.clone()
          c.position.set(openingXs[i] + side * (ow / 2 + 0.8), 0.55, faceZ + 1.4)
          g.add(c)
        }
      }
    }
  }

  addSteps(g, lod, openingXs, faceZ, H)
  if (lod < 2) addBalustrade(g, lod, W, D, A, deckY + deckT)

  return g
}

function addSteps(
  g: THREE.Group,
  lod: 0 | 1 | 2,
  xs: number[],
  faceZ: number,
  platformH: number,
): void {
  const stone = getMaterial('da_thanh', lod)
  const tile = getMaterial('gach_bat_trang', lod)
  const sideW = NGO_MON.openingWSide
  const royalW = NGO_MON.openingWRoyal

  if (lod === 2) {
    // Single royal stair block
    const block = new THREE.Mesh(new THREE.BoxGeometry(royalW + 1, platformH * 0.35, 2.2), stone)
    block.position.set(0, platformH * 0.175, faceZ + 1.4)
    g.add(block)
    return
  }

  if (lod === 1) {
    // Royal: 4 steps; sides: 1 ramp each via InstancedMesh
    const stepCount = 4
    const stepDepth = 0.55
    for (let s = 0; s < stepCount; s++) {
      const y = ((s + 0.5) / stepCount) * (platformH * 0.4)
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(royalW + 1.0, platformH * 0.4 / stepCount + 0.06, stepDepth),
        stone,
      )
      step.position.set(0, y, faceZ + 0.5 + stepDepth * (stepCount - s - 0.5))
      step.receiveShadow = true
      g.add(step)
    }
    const rampGeo = new THREE.BoxGeometry(sideW + 0.3, platformH * 0.28, 1.8)
    const ramps = new THREE.InstancedMesh(rampGeo, tile, 4)
    const dummy = new THREE.Object3D()
    let idx = 0
    for (let i = 0; i < 5; i++) {
      if (i === 2) continue
      dummy.position.set(xs[i], platformH * 0.14, faceZ + 1.2)
      dummy.updateMatrix()
      ramps.setMatrixAt(idx++, dummy.matrix)
    }
    ramps.instanceMatrix.needsUpdate = true
    g.add(ramps)

    // Broad approach into courtyard
    const broad = new THREE.Mesh(
      new THREE.BoxGeometry(NGO_MON.width - 2 * NGO_MON.armThickness - 2, 0.5, 1.6),
      tile,
    )
    broad.position.set(0, 0.25, NGO_MON.depth / 2 + 0.9)
    g.add(broad)
    return
  }

  // LOD0: full 6-step flights per opening + broad stair
  const stepCount = 6
  const stepDepth = 0.55
  for (let i = 0; i < 5; i++) {
    const sw = (i === 2 ? royalW : sideW) + (i === 2 ? 1.2 : 0.4)
    const mat = i === 2 ? stone : tile
    for (let s = 0; s < stepCount; s++) {
      const y = ((s + 0.5) / stepCount) * (platformH * 0.42)
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(sw, platformH * 0.42 / stepCount + 0.05, stepDepth),
        mat,
      )
      step.position.set(xs[i], y, faceZ + 0.6 + stepDepth * (stepCount - s - 0.5))
      step.receiveShadow = true
      g.add(step)
    }
  }
  for (let s = 0; s < 5; s++) {
    const h = 0.22
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(NGO_MON.width - 2 * NGO_MON.armThickness - 2, h, 0.6),
      tile,
    )
    step.position.set(0, h / 2 + s * h, NGO_MON.depth / 2 + 0.4 + s * 0.55)
    step.receiveShadow = true
    g.add(step)
  }
}

function addBalustrade(
  g: THREE.Group,
  lod: 0 | 1 | 2,
  W: number,
  D: number,
  A: number,
  y: number,
): void {
  const stone = getMaterial('da_thanh', lod)
  const postH = lod === 0 ? 0.95 : 0.8
  const postGeo = new THREE.BoxGeometry(0.16, postH, 0.16)
  const positions: [number, number, number][] = []

  const innerZ = -D / 2 + A + 0.25
  const innerCount = lod === 0 ? 18 : 10
  for (let i = 0; i < innerCount; i++) {
    const t = i / Math.max(1, innerCount - 1)
    const x = -W / 2 + A + 0.4 + t * (W - 2 * A - 0.8)
    positions.push([x, y, innerZ])
  }

  const tipZ = D / 2 - 0.3
  for (const sx of [-1, 1] as const) {
    const ax = sx * (W / 2 - A / 2)
    const n = lod === 0 ? 6 : 3
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1)
      positions.push([ax - A / 2 + 0.3 + t * (A - 0.6), y, tipZ])
    }
  }

  if (lod === 0) {
    for (const sx of [-1, 1] as const) {
      const x = sx * (W / 2 - A - 0.2)
      for (let i = 0; i < 8; i++) {
        const t = i / 7
        const z = -D / 2 + A + 0.5 + t * (D - A - 1)
        positions.push([x, y, z])
      }
    }
  }

  const posts = new THREE.InstancedMesh(postGeo, stone, positions.length)
  posts.name = 'balustrade-posts'
  const dummy = new THREE.Object3D()
  positions.forEach((p, i) => {
    dummy.position.set(p[0], p[1] + postH / 2, p[2])
    dummy.updateMatrix()
    posts.setMatrixAt(i, dummy.matrix)
  })
  posts.instanceMatrix.needsUpdate = true
  g.add(posts)

  const rail = new THREE.Mesh(new THREE.BoxGeometry(W - 2 * A - 0.6, 0.1, 0.12), stone)
  rail.position.set(0, y + postH, innerZ)
  g.add(rail)
}
