import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'

/**
 * Ngai vàng 3 tầng sơn son thếp vàng + bửu tán stylized (LOD0 only).
 * Đặt tại tâm chính điện.
 */
export function buildThroneAndCanopy(lod: 0 | 1 | 2): THREE.Group {
  const g = new THREE.Group()
  g.name = 'throneBuutan'
  if (lod > 0) return g

  const son = getMaterial('go_son_son', lod)
  const gold = getMaterial('vang_thep', lod)
  const lam = getMaterial('phap_lam', lod)

  // Bệ 3 tầng
  const tiers = [
    { w: 3.2, d: 2.4, h: 0.35 },
    { w: 2.6, d: 1.9, h: 0.32 },
    { w: 2.1, d: 1.5, h: 0.28 },
  ]
  let y = 0
  for (const t of tiers) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.d), son)
    base.position.y = y + t.h / 2
    g.add(base)
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(t.w * 1.02, 0.06, t.d * 1.02),
      gold,
    )
    trim.position.y = y + t.h - 0.02
    g.add(trim)
    y += t.h
  }

  // Ngai
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.22, 1.0), gold)
  seat.position.y = y + 0.11
  g.add(seat)

  const back = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 0.14), gold)
  back.position.set(0, y + 0.22 + 0.8, -0.45)
  g.add(back)

  const armGeo = new THREE.BoxGeometry(0.14, 0.55, 0.9)
  for (const x of [-0.62, 0.62]) {
    const arm = new THREE.Mesh(armGeo, gold)
    arm.position.set(x, y + 0.4, 0)
    g.add(arm)
  }

  // Bửu tán — khung thếp vàng + pháp lam panels
  const canopyY = y + 2.6
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 2.6), gold)
  frame.position.y = canopyY
  g.add(frame)

  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), gold)
  dome.position.y = canopyY + 0.15
  g.add(dome)

  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 8), gold)
  finial.position.y = canopyY + 1.15
  g.add(finial)

  // Pháp lam side panels (stylized “cửu long”)
  const panelGeo = new THREE.BoxGeometry(0.9, 0.7, 0.06)
  for (const x of [-1.1, 0, 1.1]) {
    for (const z of [-0.9, 0.9]) {
      const p = new THREE.Mesh(panelGeo, lam)
      p.position.set(x, canopyY - 0.45, z)
      g.add(p)
    }
  }

  // 4 cột chống tán nhỏ
  const postGeo = new THREE.CylinderGeometry(0.07, 0.08, 2.4, 6)
  for (const x of [-1.4, 1.4]) {
    for (const z of [-1.0, 1.0]) {
      const post = new THREE.Mesh(postGeo, son)
      post.position.set(x, canopyY - 1.2, z)
      g.add(post)
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.22), gold)
      cap.position.set(x, canopyY - 0.02, z)
      g.add(cap)
    }
  }

  return g
}
