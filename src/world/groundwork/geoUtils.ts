import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { copyUvToUv2, scaleBoxUvToMeters } from '../../core/geometry/kit/uvMeters'

const _pos = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _scale = new THREE.Vector3(1, 1, 1)
const _euler = new THREE.Euler()
const _mat = new THREE.Matrix4()

/** Bake a BoxGeometry at world transform (disposes source). */
export function boxAt(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  ry = 0,
): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(w, h, d)
  _euler.set(0, ry, 0)
  _quat.setFromEuler(_euler)
  _pos.set(x, y, z)
  _mat.compose(_pos, _quat, _scale)
  geo.applyMatrix4(_mat)
  return geo
}

/** Box with metre-scaled UVs so factory brick/stone tiles instead of stretching. */
export function paveBox(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  ry: number,
  repeat: { u: number; v: number },
): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(w, h, d)
  scaleBoxUvToMeters(geo, w, h, d, repeat)
  _euler.set(0, ry, 0)
  _quat.setFromEuler(_euler)
  _pos.set(x, y, z)
  _mat.compose(_pos, _quat, _scale)
  geo.applyMatrix4(_mat)
  return geo
}

/** Horizontal slab (XZ) with metre UVs. Prefer this for sân / đường. */
export function pavePlane(
  w: number,
  d: number,
  x: number,
  y: number,
  z: number,
  ry: number,
  repeat: { u: number; v: number },
): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(w, d)
  geo.rotateX(-Math.PI / 2)
  const uv = geo.getAttribute('uv')
  if (uv) {
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, uv.getX(i) * (w / repeat.u), uv.getY(i) * (d / repeat.v))
    }
    uv.needsUpdate = true
    copyUvToUv2(geo)
  }
  _euler.set(0, ry, 0)
  _quat.setFromEuler(_euler)
  _pos.set(x, y, z)
  _mat.compose(_pos, _quat, _scale)
  geo.applyMatrix4(_mat)
  return geo
}

/** Bake arbitrary geometry at transform; source is not disposed (caller owns). */
export function transformGeo(
  geo: THREE.BufferGeometry,
  x: number,
  y: number,
  z: number,
  ry = 0,
  sx = 1,
  sy = 1,
  sz = 1,
): THREE.BufferGeometry {
  const clone = geo.clone()
  _euler.set(0, ry, 0)
  _quat.setFromEuler(_euler)
  _pos.set(x, y, z)
  _scale.set(sx, sy, sz)
  _mat.compose(_pos, _quat, _scale)
  clone.applyMatrix4(_mat)
  _scale.set(1, 1, 1)
  return clone
}

export function mergeOrNull(geos: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  if (geos.length === 0) return null
  if (geos.length === 1) return geos[0]
  const merged = mergeGeometries(geos, false)
  for (const g of geos) g.dispose()
  return merged
}

export function meshFrom(
  geo: THREE.BufferGeometry | null,
  mat: THREE.Material,
  name: string,
): THREE.Mesh | null {
  if (!geo) return null
  const mesh = new THREE.Mesh(geo, mat)
  mesh.name = name
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/** Arch ring: rectangular frame with semicircular opening (extruded along local Z). */
export function createArchSpanGeo(
  span: number,
  rise: number,
  thickness: number,
  depth: number,
  segments: number,
): THREE.BufferGeometry {
  const outerW = span / 2 + thickness
  const outerH = rise + thickness
  const shape = new THREE.Shape()
  shape.moveTo(-outerW, 0)
  shape.lineTo(-outerW, outerH)
  shape.lineTo(outerW, outerH)
  shape.lineTo(outerW, 0)
  shape.lineTo(span / 2, 0)

  const hole = new THREE.Path()
  const segs = Math.max(6, segments)
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const a = Math.PI * (1 - t)
    const x = Math.cos(a) * (span / 2)
    const y = Math.sin(a) * rise
    if (i === 0) hole.moveTo(x, Math.max(0.02, y))
    else hole.lineTo(x, Math.max(0.02, y))
  }
  shape.holes.push(hole)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: segs,
  })
  // Extrude along +Z; center on origin
  geo.translate(0, 0, -depth / 2)
  return geo
}
