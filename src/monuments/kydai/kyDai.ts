import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { scaleBoxUvToMeters, uvRepeat } from '../../core/geometry/kit/uvMeters'
import { frustumMesh, truncatedPyramidGeo } from './geometry'
import { buildFlagPole } from './flagPole'

function railRing(
  half: number,
  y: number,
  lod: 0 | 1,
  stone: THREE.Material,
): THREE.Group {
  const g = new THREE.Group()
  const railH = 0.78
  const postCount = lod === 0 ? 7 : 5
  const postGeo = new THREE.BoxGeometry(0.14, railH, 0.14)
  scaleBoxUvToMeters(postGeo, 0.14, railH, 0.14, uvRepeat('daThanh'))
  const posts = new THREE.InstancedMesh(postGeo, stone, postCount * 4)
  posts.castShadow = lod === 0
  const dummy = new THREE.Object3D()
  let idx = 0
  const sides: Array<(u: number) => [number, number]> = [
    (u) => [-half + u * half * 2, -half],
    (u) => [-half + u * half * 2, half],
    (u) => [-half, -half + u * half * 2],
    (u) => [half, -half + u * half * 2],
  ]
  for (const side of sides) {
    for (let i = 0; i < postCount; i++) {
      const u = i / Math.max(1, postCount - 1)
      const [px, pz] = side(u)
      dummy.position.set(px, y + railH / 2, pz)
      dummy.updateMatrix()
      posts.setMatrixAt(idx++, dummy.matrix)
    }
  }
  posts.instanceMatrix.needsUpdate = true
  g.add(posts)

  const railInst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.09, 0.11), stone, 4)
  const segs: Array<{ p: [number, number, number]; s: [number, number, number]; r: number }> = [
    { p: [0, y + railH, -half], s: [half * 2, 1, 1], r: 0 },
    { p: [0, y + railH, half], s: [half * 2, 1, 1], r: 0 },
    { p: [-half, y + railH, 0], s: [half * 2, 1, 1], r: Math.PI / 2 },
    { p: [half, y + railH, 0], s: [half * 2, 1, 1], r: Math.PI / 2 },
  ]
  segs.forEach((seg, i) => {
    dummy.position.set(...seg.p)
    dummy.rotation.set(0, seg.r, 0)
    dummy.scale.set(...seg.s)
    dummy.updateMatrix()
    railInst.setMatrixAt(i, dummy.matrix)
  })
  railInst.instanceMatrix.needsUpdate = true
  g.add(railInst)
  return g
}

/**
 * Kỳ Đài — 3 tầng đài thu dần ốp gạch vồ + lan can mỗi sân + cột 37 m.
 * [xác thực — VnExpress] đài ~17.5 m (5.5 / 6 / 6) + cột 37 m ≈ 54.5 m.
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
    stepFace: 'south',
  })
  root.add(plinth)

  // [xác thực] 3 tầng ~5.5 / 6 / 6 m. Nửa cạnh [ước lượng hợp lý].
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
    const bodyMat = i === 0 ? brick : i === 1 ? brick : plaster

    if (lod < 2) {
      const body = new THREE.Mesh(truncatedPyramidGeo(halfB, halfT, h), bodyMat)
      body.position.y = y
      body.castShadow = true
      body.receiveShadow = true
      root.add(body)

      const cornice = new THREE.Mesh(truncatedPyramidGeo(halfT + 0.38, halfT + 0.16, 0.32), stone)
      cornice.position.y = y + h - 0.32
      root.add(cornice)

      const deck = new THREE.Mesh(new THREE.BoxGeometry(halfT * 2 - 0.35, 0.26, halfT * 2 - 0.35), tile)
      scaleBoxUvToMeters(deck.geometry, halfT * 2 - 0.35, 0.26, halfT * 2 - 0.35, uvRepeat('gachBatTrang'))
      deck.position.y = y + h + 0.13
      deck.receiveShadow = true
      root.add(deck)

      const doorH = Math.min(3.0, h * 0.5)
      const faceR = halfB * 0.62 + halfT * 0.38
      const doorGeo = new THREE.BoxGeometry(2.2, doorH, 0.32)
      scaleBoxUvToMeters(doorGeo, 2.2, doorH, 0.32, uvRepeat('goLim'))
      for (const face of [
        { x: 0, z: faceR, rotY: 0 },
        { x: 0, z: -faceR, rotY: 0 },
        { x: faceR, z: 0, rotY: Math.PI / 2 },
        { x: -faceR, z: 0, rotY: Math.PI / 2 },
      ]) {
        if (lod === 1 && i > 0 && face.z !== faceR) continue
        const door = new THREE.Mesh(doorGeo, wood)
        door.position.set(face.x, y + 0.45 + doorH / 2, face.z)
        door.rotation.y = face.rotY
        root.add(door)
      }

      if (lod === 0) {
        const postGeo = new THREE.BoxGeometry(0.65, h * 0.82, 0.65)
        scaleBoxUvToMeters(postGeo, 0.65, h * 0.82, 0.65, uvRepeat('daThanh'))
        for (const sx of [-1, 1] as const) {
          for (const sz of [-1, 1] as const) {
            const post = new THREE.Mesh(postGeo, stone)
            post.position.set(sx * halfB * 0.76, y + h * 0.4, sz * halfB * 0.76)
            post.castShadow = true
            root.add(post)
          }
        }
      }

      root.add(railRing(halfT - 0.45, y + h + 0.14, lod === 0 ? 0 : 1, stone))
    } else {
      const body = frustumMesh(halfB, halfT, h, bodyMat, 4)
      body.position.y = y + h / 2
      root.add(body)
    }

    deckYs.push(y + h)
    y += h
  }

  // Cầu thang Nam — thu dần theo mặt dốc
  if (lod < 2) {
    const steps = lod === 0 ? 28 : 16
    const totalH = deckYs[2] - 1.2
    const stepGeo = new THREE.BoxGeometry(3.4, 0.2, 0.78)
    scaleBoxUvToMeters(stepGeo, 3.4, 0.2, 0.78, uvRepeat('daThanh'))
    const stair = new THREE.InstancedMesh(stepGeo, stone, steps)
    const dummy = new THREE.Object3D()
    for (let s = 0; s < steps; s++) {
      const t = (s + 0.5) / steps
      dummy.position.set(0, 1.2 + t * totalH, tiers[0].halfB * (1 - t * 0.58) + 2.0 + t * 2.8)
      dummy.scale.set(1 - t * 0.28, 1, 1)
      dummy.updateMatrix()
      stair.setMatrixAt(s, dummy.matrix)
    }
    stair.instanceMatrix.needsUpdate = true
    stair.castShadow = lod === 0
    stair.receiveShadow = true
    stair.name = 'ky-dai-stair'
    root.add(stair)

    // Thành bậc hai bên
    const cheekGeo = new THREE.BoxGeometry(0.32, totalH * 0.35, 8)
    const cheekL = new THREE.Mesh(cheekGeo, stone)
    cheekL.position.set(-2.1, 1.2 + totalH * 0.22, tiers[0].halfB + 4)
    cheekL.rotation.x = -0.55
    root.add(cheekL)
    const cheekR = cheekL.clone()
    cheekR.position.x = 2.1
    root.add(cheekR)
  }

  const pole = buildFlagPole({
    height: 37,
    radius: lod === 2 ? 0.28 : 0.2,
    lod,
    flag: lod < 2,
  })
  pole.position.y = deckYs[2] + 0.22
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
