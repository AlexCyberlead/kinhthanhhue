import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { IMPERIAL, type LodLevel } from './constants'

function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh) {
      mesh.geometry?.dispose()
    }
  })
}

function boxAt(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  rotY = 0,
): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(w, h, d)
  const m = new THREE.Matrix4()
  m.makeRotationY(rotY)
  m.setPosition(x, y, z)
  geo.applyMatrix4(m)
  return geo
}

/**
 * Curtain segments in local space (origin = Hoàng Thành center).
 * 8 segments = 4 faces × 2 sides of each gate gap.
 */
function curtainBoxes(height: number, thickness: number): THREE.BufferGeometry[] {
  const { halfX: hx, halfZ: hz, gaps } = IMPERIAL
  const y = height / 2
  const t = thickness
  const geos: THREE.BufferGeometry[] = []

  // South (+Z): gap at x=0
  {
    const gap = gaps.south
    const leftLen = hx - gap
    const leftCx = -(gap + leftLen / 2)
    const rightCx = gap + leftLen / 2
    geos.push(boxAt(leftLen, height, t, leftCx, y, hz))
    geos.push(boxAt(leftLen, height, t, rightCx, y, hz))
  }

  // North (−Z): gap at x=0
  {
    const gap = gaps.north
    const leftLen = hx - gap
    const leftCx = -(gap + leftLen / 2)
    const rightCx = gap + leftLen / 2
    geos.push(boxAt(leftLen, height, t, leftCx, y, -hz))
    geos.push(boxAt(leftLen, height, t, rightCx, y, -hz))
  }

  // East (+X): gap at z=0
  {
    const gap = gaps.east
    const halfLen = hz - gap
    const southCz = gap + halfLen / 2
    const northCz = -(gap + halfLen / 2)
    geos.push(boxAt(t, height, halfLen, hx, y, southCz))
    geos.push(boxAt(t, height, halfLen, hx, y, northCz))
  }

  // West (−X): gap at z=0
  {
    const gap = gaps.west
    const halfLen = hz - gap
    const southCz = gap + halfLen / 2
    const northCz = -(gap + halfLen / 2)
    geos.push(boxAt(t, height, halfLen, -hx, y, southCz))
    geos.push(boxAt(t, height, halfLen, -hx, y, northCz))
  }

  return geos
}

function mergeBoxes(
  geos: THREE.BufferGeometry[],
  material: THREE.Material,
  name: string,
): THREE.Mesh {
  const merged = mergeGeometries(geos, false)
  geos.forEach((g) => g.dispose())
  const mesh = new THREE.Mesh(
    merged ?? new THREE.BoxGeometry(1, IMPERIAL.height, IMPERIAL.thickness),
    material,
  )
  mesh.name = name
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/**
 * Hoàng Thành perimeter wall — local origin = geometric center.
 * Budget: ≤ 4 draw calls (typically 1–3 merged meshes).
 */
export function buildImperialWallGroup(lod: LodLevel = 1): THREE.Group {
  const group = new THREE.Group()
  group.name = `ImperialWalls_LOD${lod}`

  const { height, thickness, plinthHeight, parapetHeight, parapetThickness } = IMPERIAL

  // 1) Main curtain — gạch vồ
  const curtainGeos = curtainBoxes(height, thickness)
  group.add(mergeBoxes(curtainGeos, getMaterial('gach_vo', lod), 'imperial-curtain'))

  if (lod >= 2) return group

  // 2) Stone plinth (slightly thicker / shorter)
  const plinthGeos = curtainBoxes(plinthHeight, thickness + 0.35)
  group.add(mergeBoxes(plinthGeos, getMaterial('da_thanh', lod), 'imperial-plinth'))

  // 3) Lime parapet on top
  const parapetGeos = curtainBoxes(parapetHeight, parapetThickness).map((geo) => {
    geo.translate(0, height, 0)
    return geo
  })
  group.add(mergeBoxes(parapetGeos, getMaterial('tuong_voi', lod), 'imperial-parapet'))

  // LOD0: thin coping strip (4th DC) — reads as finished wall crown
  if (lod === 0) {
    const copeH = 0.18
    const copeGeos = curtainBoxes(copeH, parapetThickness + 0.2).map((geo) => {
      geo.translate(0, height + parapetHeight, 0)
      return geo
    })
    group.add(mergeBoxes(copeGeos, getMaterial('da_thanh', lod), 'imperial-coping'))
  }

  return group
}

export function disposeImperialWallGroup(group: THREE.Object3D): void {
  disposeObject3D(group)
}

/** Mesh count ≈ draw calls (shared MaterialLibrary materials). */
export function countImperialWallDrawCalls(group: THREE.Object3D): number {
  let n = 0
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) n += 1
  })
  return n
}
