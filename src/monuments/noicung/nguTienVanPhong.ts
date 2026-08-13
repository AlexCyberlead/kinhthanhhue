import * as THREE from 'three'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { scaleBoxUvToMeters, uvRepeat } from '../../core/geometry/kit/uvMeters'
import { getMaterial } from '../../core/materials/MaterialLibrary'

/**
 * Ngự Tiền Văn Phòng — khối Bảo Đại, hơi Tây (1933).
 * Mái thanh lưu ly trên thân vôi + cửa sổ chữ nhật. [ước lượng hợp lý]
 */
export function buildNguTienVanPhong(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'ngu-tien-van-phong'
  root.userData.mode = 'restored'

  const plaster = getMaterial('tuong_voi', lod)
  const stone = getMaterial('da_thanh', lod)
  const wood = getMaterial('go_lim', lod)
  const son = getMaterial('go_son_son', lod)

  const platH = 0.85
  const W = lod === 2 ? 16 : 20
  const D = lod === 2 ? 10 : 12
  const wallH = lod === 2 ? 4.2 : 5.2

  root.add(
    buildPlatform({
      width: W + 2.4,
      depth: D + 2.2,
      height: platH,
      steps: lod === 2 ? 2 : 3,
      balustrade: lod === 0,
      lod,
    }),
  )

  const floorY = platH
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, wallH, D), plaster)
  scaleBoxUvToMeters(body.geometry, W, wallH, D, uvRepeat('tuongVoi'))
  body.position.y = floorY + wallH / 2
  body.castShadow = true
  body.receiveShadow = true
  root.add(body)

  if (lod < 2) {
    const sill = new THREE.Mesh(new THREE.BoxGeometry(W * 1.02, 0.18, D * 1.02), stone)
    sill.position.y = floorY + 0.9
    root.add(sill)

    const winW = 1.4
    const winH = 1.6
    const winGeo = new THREE.BoxGeometry(winW, winH, 0.12)
    const n = lod === 0 ? 5 : 3
    const wins = new THREE.InstancedMesh(winGeo, wood, n)
    const dummy = new THREE.Object3D()
    for (let i = 0; i < n; i++) {
      const x = -W * 0.32 + (i / Math.max(1, n - 1)) * W * 0.64
      dummy.position.set(x, floorY + wallH * 0.55, D / 2 + 0.04)
      dummy.updateMatrix()
      wins.setMatrixAt(i, dummy.matrix)
    }
    wins.instanceMatrix.needsUpdate = true
    root.add(wins)

    const door = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 0.16), son)
    door.position.set(0, floorY + 1.4, D / 2 + 0.06)
    root.add(door)
  }

  const roof = buildRoof({
    width: W + 2.6,
    depth: D + 2.2,
    tiers: 1,
    tileMaterial: 'ngoi_thanh_luu_ly',
    ridge: lod < 2 ? 'bau-phap-lam' : 'none',
    lod,
  })
  roof.position.y = floorY + wallH + 0.08
  root.add(roof)

  return root
}

export const nguTienVanPhong: MonumentModule = {
  id: 'ngu-tien-van-phong',
  displayName: { vi: 'Ngự Tiền Văn Phòng', en: 'Imperial Secretariat' },
  build: buildNguTienVanPhong,
  anchor: [40, 1, -300],
  rotationY: 0,
  boundingRadius: 25,
  poi: {
    vi: 'Ngự Tiền Văn Phòng — khối hành chính thời Bảo Đại (~1933), hơi Tây. Anchor [ước lượng hợp lý].',
    en: 'Imperial Secretariat — Bảo Đại office block (~1933), slightly Western massing. Anchor [estimated].',
    year: '1933',
  },
}
