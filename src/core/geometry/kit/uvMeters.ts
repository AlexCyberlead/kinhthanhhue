import type * as THREE from 'three'
import { UV_REPEAT_METERS, type TextureFactoryId } from '../../materials/textures'

export function uvRepeat(id: TextureFactoryId): { u: number; v: number } {
  return UV_REPEAT_METERS[id]
}

/** aoMap in Three.js reads uv2 — copy uv so kit meshes actually show AO. */
export function copyUvToUv2(geo: THREE.BufferGeometry): void {
  const uv = geo.getAttribute('uv')
  if (!uv) return
  geo.setAttribute('uv2', uv.clone())
}

/**
 * Scale default BoxGeometry 0–1 face UVs into metres / repeat cycle.
 * Face order (Three r170): +x −x +y −y +z −z.
 */
export function scaleBoxUvToMeters(
  geo: THREE.BufferGeometry,
  width: number,
  height: number,
  depth: number,
  repeat: { u: number; v: number },
): void {
  const uv = geo.getAttribute('uv')
  if (!uv) return
  const faceSize: [number, number][] = [
    [depth, height],
    [depth, height],
    [width, depth],
    [width, depth],
    [width, height],
    [width, height],
  ]
  for (let face = 0; face < 6; face++) {
    const [fu, fv] = faceSize[face]
    const su = fu / repeat.u
    const sv = fv / repeat.v
    const base = face * 4
    for (let i = 0; i < 4; i++) {
      const idx = base + i
      uv.setXY(idx, uv.getX(idx) * su, uv.getY(idx) * sv)
    }
  }
  uv.needsUpdate = true
  copyUvToUv2(geo)
}
