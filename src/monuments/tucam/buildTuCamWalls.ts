import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { extrudeWallGeometry } from '../../core/geometry/kit'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { TUCAM, type LodLevel } from './constants'

function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh) mesh.geometry?.dispose()
  })
}

function facePath(
  ax: number,
  az: number,
  bx: number,
  bz: number,
  gap: number,
  offset = 0,
): THREE.Vector3[][] {
  const a = new THREE.Vector3(ax, 0, az)
  const b = new THREE.Vector3(bx, 0, bz)
  const mid = a.clone().add(b).multiplyScalar(0.5)
  const dir = b.clone().sub(a)
  const len = dir.length()
  dir.normalize()
  if (gap <= 0 || gap * 2 >= len - 2) {
    return [[a, b]]
  }
  const center = mid.clone().addScaledVector(dir, offset)
  const left = center.clone().addScaledVector(dir, -gap)
  const right = center.clone().addScaledVector(dir, gap)
  return [
    [a, left],
    [right, b],
  ]
}

function curtainPaths(): THREE.Vector3[][] {
  const { halfX: hx, halfZ: hz, gaps, sideGapOffsetZ } = TUCAM
  // Bắc: hai cửa tại x = ±40 (Tường Loan / Nghi Phụng)
  const northZ = -hz
  const northGaps = [40, -40]
  const northSegs: THREE.Vector3[][] = []
  let nx = hx
  for (const gx of northGaps) {
    northSegs.push([
      new THREE.Vector3(nx, 0, northZ),
      new THREE.Vector3(gx + gaps.north, 0, northZ),
    ])
    nx = gx - gaps.north
  }
  northSegs.push([new THREE.Vector3(nx, 0, northZ), new THREE.Vector3(-hx, 0, northZ)])

  return [
    ...facePath(-hx, hz, hx, hz, gaps.south, 0),
    ...facePath(hx, hz, hx, -hz, gaps.east, -sideGapOffsetZ),
    ...northSegs,
    ...facePath(-hx, -hz, -hx, hz, gaps.west, sideGapOffsetZ),
  ]
}

function extrudeAll(
  paths: THREE.Vector3[][],
  height: number,
  thickness: number,
  lod: LodLevel,
  crenel: boolean,
): THREE.BufferGeometry {
  const pieces: THREE.BufferGeometry[] = []
  for (const path of paths) {
    pieces.push(
      extrudeWallGeometry({
        path,
        height,
        thickness,
        crenellation: crenel && lod === 0,
        lod,
      }),
    )
  }
  if (pieces.length === 1) return pieces[0]
  const merged = mergeGeometries(pieces, false)
  pieces.forEach((g) => g.dispose())
  return merged ?? pieces[0]
}

/**
 * Tử Cấm — cao 3.72 / dày 0.72 [xác thực]. Luôn restored.
 */
export function buildTuCamWallGroup(lod: LodLevel = 1): THREE.Group {
  const group = new THREE.Group()
  group.name = `TuCamWalls_LOD${lod}`

  const { height, thickness, plinthHeight, parapetHeight, parapetThickness } = TUCAM
  const paths = curtainPaths()

  const curtain = new THREE.Mesh(
    extrudeAll(paths, height, thickness, lod, false),
    getMaterial('gach_vo', lod),
  )
  curtain.name = 'tucam-curtain'
  curtain.castShadow = true
  curtain.receiveShadow = true
  group.add(curtain)

  if (lod >= 2) return group

  const plinth = new THREE.Mesh(
    extrudeAll(paths, plinthHeight, thickness + 0.25, lod, false),
    getMaterial('da_thanh', lod),
  )
  plinth.name = 'tucam-plinth'
  plinth.castShadow = true
  group.add(plinth)

  const parapet = new THREE.Mesh(
    extrudeAll(paths, parapetHeight, parapetThickness, lod, lod === 0),
    getMaterial('tuong_voi', lod),
  )
  parapet.name = 'tucam-parapet'
  parapet.position.y = height
  parapet.castShadow = true
  group.add(parapet)

  if (lod === 0) {
    const cope = new THREE.Mesh(
      extrudeAll(paths, 0.14, parapetThickness + 0.14, lod, false),
      getMaterial('da_thanh', lod),
    )
    cope.name = 'tucam-coping'
    cope.position.y = height + parapetHeight
    group.add(cope)
  }

  return group
}

export function disposeTuCamWallGroup(group: THREE.Object3D): void {
  disposeObject3D(group)
}

export function countTuCamWallDrawCalls(group: THREE.Object3D): number {
  let n = 0
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) n += 1
  })
  return n
}
