import * as THREE from 'three'
import { getMaterial } from '../../../materials/MaterialLibrary'
import { scaleBoxUvToMeters, uvRepeat } from '../uvMeters'
import { mergeKit, meshOf } from './merge'

/**
 * Cổ diêm — band ô hộc + pháp lam giữa tầng trùng thiềm.
 * LOD0: thân pháp lam + khung thếp instanced.
 * LOD1: band phẳng có map.
 * LOD2: bỏ.
 * Kích thước band [ước lượng hợp lý].
 */
export function buildCoDiem(opts: {
  width: number
  depth: number
  y: number
  lod: 0 | 1 | 2
}): THREE.Group | null {
  const { width, depth, y, lod } = opts
  if (lod === 2) return null
  const h = lod === 0 ? 0.48 : 0.36
  const t = lod === 0 ? 0.2 : 0.16
  const g = new THREE.Group()
  g.name = 'roof-codiem'
  g.position.y = y

  const lam = getMaterial('phap_lam', lod)
  const walls: THREE.BufferGeometry[] = []
  const addWall = (w: number, d: number, x: number, z: number) => {
    const box = new THREE.BoxGeometry(w, h, d)
    scaleBoxUvToMeters(box, w, h, d, uvRepeat('phapLam'))
    box.translate(x, 0, z)
    walls.push(box)
  }
  addWall(width, t, 0, depth * 0.5)
  addWall(width, t, 0, -depth * 0.5)
  addWall(t, depth - t, width * 0.5, 0)
  addWall(t, depth - t, -width * 0.5, 0)
  const band = meshOf(mergeKit(walls), lam, 'roof-codiem-band')
  if (band) g.add(band)

  if (lod === 0) {
    const frames = buildOhocFrames(width, depth, h, t)
    if (frames) g.add(frames)
  }

  return g
}

function buildOhocFrames(width: number, depth: number, h: number, t: number): THREE.InstancedMesh | null {
  const panel = 0.72
  const inset = 0.06
  const fw = panel - inset * 2
  const fh = h - inset * 2
  const frameT = 0.035
  const top = new THREE.BoxGeometry(fw, frameT, frameT)
  top.translate(0, fh * 0.5, 0)
  const bot = new THREE.BoxGeometry(fw, frameT, frameT)
  bot.translate(0, -fh * 0.5, 0)
  const left = new THREE.BoxGeometry(frameT, fh, frameT)
  left.translate(-fw * 0.5, 0, 0)
  const right = new THREE.BoxGeometry(frameT, fh, frameT)
  right.translate(fw * 0.5, 0, 0)
  const parts = [top, bot, left, right]
  const geo = mergeKit(parts)
  if (!geo) return null

  type Slot = { x: number; z: number; ry: number }
  const slots: Slot[] = []
  const placeNS = (z: number) => {
    const count = Math.max(2, Math.floor((width - 0.9) / panel))
    const span = (count - 1) * panel
    for (let i = 0; i < count; i++) {
      const u = count === 1 ? 0 : i / (count - 1)
      slots.push({ x: -span * 0.5 + u * span, z, ry: 0 })
    }
  }
  placeNS(depth * 0.5 + t * 0.15)
  placeNS(-depth * 0.5 - t * 0.15)
  // east / west — along Z
  const zCount = Math.max(2, Math.floor((depth - 0.4) / panel))
  const zSpan = (zCount - 1) * panel
  for (const sx of [-1, 1]) {
    for (let i = 0; i < zCount; i++) {
      const u = zCount === 1 ? 0 : i / (zCount - 1)
      slots.push({ x: sx * (width * 0.5 + t * 0.15), z: -zSpan * 0.5 + u * zSpan, ry: Math.PI / 2 })
    }
  }

  const gold = getMaterial('vang_thep', 0)
  const inst = new THREE.InstancedMesh(geo, gold, slots.length)
  inst.name = 'roof-ohoc'
  inst.castShadow = true
  const dummy = new THREE.Object3D()
  for (let i = 0; i < slots.length; i++) {
    dummy.position.set(slots[i].x, 0, slots[i].z)
    dummy.rotation.set(0, slots[i].ry, 0)
    dummy.updateMatrix()
    inst.setMatrixAt(i, dummy.matrix)
  }
  inst.instanceMatrix.needsUpdate = true
  return inst
}
