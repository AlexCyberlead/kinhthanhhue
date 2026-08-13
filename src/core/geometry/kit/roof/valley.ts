import * as THREE from 'three'
import { getMaterial } from '../../../materials/MaterialLibrary'
import { scaleBoxUvToMeters, uvRepeat } from '../uvMeters'
import { mergeKit, meshOf } from './merge'
import type { RoofFrame } from './types'

/**
 * Stretch — máng thừa lưu dọc diềm +Z.
 * U-channel đồng thau, caller bật `linkedValley`. [ước lượng hợp lý]
 */
export function buildLinkedValley(f: RoofFrame): THREE.Mesh | null {
  if (f.lod === 2) return null
  const len = f.halfW * 2 * 0.88
  const w = 0.48
  const floor = new THREE.BoxGeometry(len, 0.04, w)
  scaleBoxUvToMeters(floor, len, 0.04, w, uvRepeat('dongThau'))
  const wallH = 0.13
  const left = new THREE.BoxGeometry(len, wallH, 0.04)
  left.translate(0, wallH * 0.5, -w * 0.45)
  const right = new THREE.BoxGeometry(len, wallH, 0.04)
  right.translate(0, wallH * 0.5, w * 0.45)
  const geo = mergeKit([floor, left, right])
  const mesh = meshOf(geo, getMaterial('dong_thau', f.lod), 'roof-valley', false)
  if (!mesh) return null
  mesh.position.set(0, -0.1, f.halfD + 0.18)
  return mesh
}
