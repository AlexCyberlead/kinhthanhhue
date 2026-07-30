import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { frustumMesh, truncatedPyramidGeo } from './geometry'
import { buildFlagPole } from './flagPole'

/**
 * Kỳ Đài — 3 truncated-pyramid tiers (~17.5 m) + 37 m flagpole ≈ 54.5 m total.
 * Anchor: buildings.json ky-dai [0, 0, 340].
 */
function buildKyDai(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'ky-dai'

  const brick = getMaterial('gach_vo', lod)
  const plaster = getMaterial('tuong_voi', lod)
  const stone = getMaterial('da_thanh', lod)
  const tile = getMaterial('gach_bat_trang', lod)
  const wood = getMaterial('go_lim', lod)

  const plinth = buildPlatform({
    width: lod === 2 ? 38 : 42,
    depth: lod === 2 ? 38 : 42,
    height: 1.2,
    steps: lod === 2 ? 2 : 4,
    balustrade: lod === 0,
    lod,
  })
  root.add(plinth)

  const tiers: { halfB: number; halfT: number; h: number }[] =
    lod === 2
      ? [
          { halfB: 16, halfT: 12.5, h: 5.5 },
          { halfB: 11.5, halfT: 8.5, h: 6 },
          { halfB: 7.5, halfT: 5.2, h: 6 },
        ]
      : [
          { halfB: 17.5, halfT: 13.2, h: 5.5 },
          { halfB: 12.2, halfT: 9.0, h: 6.0 },
          { halfB: 8.2, halfT: 5.6, h: 6.0 },
        ]

  let y = 1.2
  const deckYs: number[] = []

  for (let i = 0; i < 3; i++) {
    const { halfB, halfT, h } = tiers[i]
    const bodyMat = i === 0 ? brick : plaster

    if (lod === 0) {
      const body = new THREE.Mesh(truncatedPyramidGeo(halfB, halfT, h), bodyMat)
      body.position.y = y
      body.castShadow = true
      body.receiveShadow = true
      root.add(body)

      const cornice = new THREE.Mesh(truncatedPyramidGeo(halfT + 0.35, halfT + 0.15, 0.35), stone)
      cornice.position.y = y + h - 0.35
      root.add(cornice)

      const deck = new THREE.Mesh(new THREE.BoxGeometry(halfT * 2 - 0.4, 0.28, halfT * 2 - 0.4), tile)
      deck.position.y = y + h + 0.14
      deck.receiveShadow = true
      root.add(deck)

      const doorH = Math.min(3.2, h * 0.55)
      const doorW = 2.4
      const t = 0.35
      const faceR = halfB * (1 - t) + halfT * t
      for (const face of [
        { x: 0, z: faceR, rotY: 0 },
        { x: 0, z: -faceR, rotY: 0 },
        { x: faceR, z: 0, rotY: Math.PI / 2 },
        { x: -faceR, z: 0, rotY: Math.PI / 2 },
      ]) {
        const door = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.35), wood)
        door.position.set(face.x, y + 0.4 + doorH / 2, face.z)
        door.rotation.y = face.rotY
        root.add(door)
      }

      const postGeo = new THREE.BoxGeometry(0.7, h * 0.85, 0.7)
      for (const sx of [-1, 1] as const) {
        for (const sz of [-1, 1] as const) {
          const post = new THREE.Mesh(postGeo, stone)
          post.position.set(sx * halfB * 0.78, y + h * 0.42, sz * halfB * 0.78)
          post.castShadow = true
          root.add(post)
        }
      }
    } else {
      const body = frustumMesh(halfB, halfT, h, bodyMat, 4)
      body.position.y = y + h / 2
      root.add(body)

      if (lod === 1) {
        const deck = new THREE.Mesh(new THREE.BoxGeometry(halfT * 2 - 0.5, 0.22, halfT * 2 - 0.5), tile)
        deck.position.y = y + h + 0.1
        root.add(deck)
        // single door cue on bottom tier only (draw-call budget)
        if (i === 0) {
          const door = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 0.3), wood)
          door.position.set(0, y + 1.6, halfB * 0.72)
          root.add(door)
        }
      }
    }

    deckYs.push(y + h)
    y += h
  }

  // South stair — single InstancedMesh (draw-call friendly)
  if (lod < 2) {
    const steps = lod === 0 ? 24 : 12
    const totalH = deckYs[2] - 1.2
    const stepGeo = new THREE.BoxGeometry(3.6, 0.22, 0.85)
    const stair = new THREE.InstancedMesh(stepGeo, stone, steps)
    const dummy = new THREE.Object3D()
    for (let s = 0; s < steps; s++) {
      const t = (s + 0.5) / steps
      dummy.position.set(0, 1.2 + t * totalH, tiers[0].halfB * (1 - t * 0.55) + 2.2 + t * 2.5)
      dummy.scale.set(1 - t * 0.25, 1, 1)
      dummy.updateMatrix()
      stair.setMatrixAt(s, dummy.matrix)
    }
    stair.instanceMatrix.needsUpdate = true
    stair.castShadow = lod === 0
    stair.receiveShadow = true
    root.add(stair)
  }

  // Top railing
  if (lod < 2) {
    const topHalf = tiers[2].halfT - 0.4
    const railH = 0.85
    const postCount = lod === 0 ? 8 : 5
    const postGeo = new THREE.BoxGeometry(0.16, railH, 0.16)
    const posts = new THREE.InstancedMesh(postGeo, stone, postCount * 4)
    const dummy = new THREE.Object3D()
    let idx = 0
    const sides: Array<(u: number) => [number, number]> = [
      (u) => [-topHalf + u * topHalf * 2, -topHalf],
      (u) => [-topHalf + u * topHalf * 2, topHalf],
      (u) => [-topHalf, -topHalf + u * topHalf * 2],
      (u) => [topHalf, -topHalf + u * topHalf * 2],
    ]
    for (const side of sides) {
      for (let i = 0; i < postCount; i++) {
        const u = i / Math.max(1, postCount - 1)
        const [px, pz] = side(u)
        dummy.position.set(px, deckYs[2] + railH / 2, pz)
        dummy.updateMatrix()
        posts.setMatrixAt(idx++, dummy.matrix)
      }
    }
    posts.instanceMatrix.needsUpdate = true
    posts.castShadow = lod === 0
    root.add(posts)

    const railInst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.1, 0.12), stone, 4)
    const d2 = new THREE.Object3D()
    const segs: Array<{ p: [number, number, number]; s: [number, number, number]; r: number }> = [
      { p: [0, deckYs[2] + railH, -topHalf], s: [topHalf * 2, 1, 1], r: 0 },
      { p: [0, deckYs[2] + railH, topHalf], s: [topHalf * 2, 1, 1], r: 0 },
      { p: [-topHalf, deckYs[2] + railH, 0], s: [topHalf * 2, 1, 1], r: Math.PI / 2 },
      { p: [topHalf, deckYs[2] + railH, 0], s: [topHalf * 2, 1, 1], r: Math.PI / 2 },
    ]
    segs.forEach((seg, i) => {
      d2.position.set(...seg.p)
      d2.rotation.set(0, seg.r, 0)
      d2.scale.set(...seg.s)
      d2.updateMatrix()
      railInst.setMatrixAt(i, d2.matrix)
    })
    railInst.instanceMatrix.needsUpdate = true
    root.add(railInst)
  }

  const pole = buildFlagPole({
    height: 37,
    radius: lod === 2 ? 0.28 : 0.2,
    lod,
    flag: lod < 2,
  })
  pole.position.y = deckYs[2] + 0.2
  root.add(pole)

  return root
}

export const kyDai: MonumentModule = {
  id: 'ky-dai',
  displayName: { vi: 'Kỳ Đài', en: 'Flag Tower' },
  build: buildKyDai,
  anchor: [0, 0, 340],
  rotationY: 0,
  boundingRadius: 40,
  poi: {
    vi: 'Kỳ Đài (Cột cờ) — ba tầng đài chóp cụt xây 1807, cột cờ ~37 m, tổng cao ~54 m. Pháo đài Nam Chánh, mặt tiền Kinh thành trước Ngọ Môn.',
    en: 'Flag Tower — three truncated-pyramid tiers (1807) plus a ~37 m flagpole (~54 m overall). South citadel front before Ngọ Môn.',
    year: '1807',
  },
}
