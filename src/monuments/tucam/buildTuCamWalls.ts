import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { TUCAM, type LodLevel } from './constants'

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
 * Curtain segments in local space (origin = Tử Cấm center).
 * South face split around Đại Cung Môn gap; other faces continuous.
 */
function curtainBoxes(height: number, thickness: number): THREE.BufferGeometry[] {
  const { halfX: hx, halfZ: hz, gaps } = TUCAM
  const y = height / 2
  const t = thickness
  const geos: THREE.BufferGeometry[] = []

  // South (+Z): gap at x=0 for Đại Cung Môn
  {
    const gap = gaps.south
    if (gap > 0) {
      const leftLen = hx - gap
      const leftCx = -(gap + leftLen / 2)
      const rightCx = gap + leftLen / 2
      geos.push(boxAt(leftLen, height, t, leftCx, y, hz))
      geos.push(boxAt(leftLen, height, t, rightCx, y, hz))
    } else {
      geos.push(boxAt(hx * 2, height, t, 0, y, hz))
    }
  }

  // North (−Z)
  {
    const gap = gaps.north
    if (gap > 0) {
      const leftLen = hx - gap
      const leftCx = -(gap + leftLen / 2)
      const rightCx = gap + leftLen / 2
      geos.push(boxAt(leftLen, height, t, leftCx, y, -hz))
      geos.push(boxAt(leftLen, height, t, rightCx, y, -hz))
    } else {
      geos.push(boxAt(hx * 2, height, t, 0, y, -hz))
    }
  }

  // East (+X)
  {
    const gap = gaps.east
    if (gap > 0) {
      const halfLen = hz - gap
      const southCz = gap + halfLen / 2
      const northCz = -(gap + halfLen / 2)
      geos.push(boxAt(t, height, halfLen, hx, y, southCz))
      geos.push(boxAt(t, height, halfLen, hx, y, northCz))
    } else {
      geos.push(boxAt(t, height, hz * 2, hx, y, 0))
    }
  }

  // West (−X)
  {
    const gap = gaps.west
    if (gap > 0) {
      const halfLen = hz - gap
      const southCz = gap + halfLen / 2
      const northCz = -(gap + halfLen / 2)
      geos.push(boxAt(t, height, halfLen, -hx, y, southCz))
      geos.push(boxAt(t, height, halfLen, -hx, y, northCz))
    } else {
      geos.push(boxAt(t, height, hz * 2, -hx, y, 0))
    }
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
    merged ?? new THREE.BoxGeometry(1, TUCAM.height, TUCAM.thickness),
    material,
  )
  mesh.name = name
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/**
 * Tử Cấm Thành perimeter wall — local origin = geometric center.
 * Budget: ≤ 4 draw calls (merged meshes).
 * Always restored geometry (không theo reconstructionMode).
 */
export function buildTuCamWallGroup(lod: LodLevel = 1): THREE.Group {
  const group = new THREE.Group()
  group.name = `TuCamWalls_LOD${lod}`

  const { height, thickness, plinthHeight, parapetHeight, parapetThickness } = TUCAM

  // 1) Main curtain — gạch vồ
  const curtainGeos = curtainBoxes(height, thickness)
  group.add(mergeBoxes(curtainGeos, getMaterial('gach_vo', lod), 'tucam-curtain'))

  if (lod >= 2) return group

  // 2) Stone plinth
  const plinthGeos = curtainBoxes(plinthHeight, thickness + 0.25)
  group.add(mergeBoxes(plinthGeos, getMaterial('da_thanh', lod), 'tucam-plinth'))

  // 3) Lime parapet on top
  const parapetGeos = curtainBoxes(parapetHeight, parapetThickness).map((geo) => {
    geo.translate(0, height, 0)
    return geo
  })
  group.add(mergeBoxes(parapetGeos, getMaterial('tuong_voi', lod), 'tucam-parapet'))

  // LOD0: coping strip (4th DC)
  if (lod === 0) {
    const copeH = 0.14
    const copeGeos = curtainBoxes(copeH, parapetThickness + 0.15).map((geo) => {
      geo.translate(0, height + parapetHeight, 0)
      return geo
    })
    group.add(mergeBoxes(copeGeos, getMaterial('da_thanh', lod), 'tucam-coping'))
  }

  return group
}

export function disposeTuCamWallGroup(group: THREE.Object3D): void {
  disposeObject3D(group)
}

/** Mesh count ≈ draw calls (shared MaterialLibrary materials). */
export function countTuCamWallDrawCalls(group: THREE.Object3D): number {
  let n = 0
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) n += 1
  })
  return n
}
