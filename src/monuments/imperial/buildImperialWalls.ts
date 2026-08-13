import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { extrudeWallGeometry } from '../../core/geometry/kit'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { IMPERIAL, type LodLevel } from './constants'

function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh) mesh.geometry?.dispose()
  })
}

/**
 * Polyline 1 mặt tường, chừa gap ở giữa (local origin = tâm Hoàng thành).
 */
function facePath(
  ax: number,
  az: number,
  bx: number,
  bz: number,
  gap: number,
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
  const left = mid.clone().addScaledVector(dir, -gap)
  const right = mid.clone().addScaledVector(dir, gap)
  return [
    [a, left],
    [right, b],
  ]
}

function curtainPaths(): THREE.Vector3[][] {
  const { halfX: hx, halfZ: hz, gaps } = IMPERIAL
  return [
    ...facePath(-hx, hz, hx, hz, gaps.south),
    ...facePath(hx, hz, hx, -hz, gaps.east),
    ...facePath(hx, -hz, -hx, -hz, gaps.north),
    ...facePath(-hx, -hz, -hx, hz, gaps.west),
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
 * Hoàng Thành — cao 4.16 / dày 1.04 [xác thực], chân đá + thân gạch + đỉnh vôi.
 */
export function buildImperialWallGroup(lod: LodLevel = 1): THREE.Group {
  const group = new THREE.Group()
  group.name = `ImperialWalls_LOD${lod}`

  const { height, thickness, plinthHeight, parapetHeight, parapetThickness } = IMPERIAL
  const paths = curtainPaths()

  const curtain = new THREE.Mesh(
    extrudeAll(paths, height, thickness, lod, false),
    getMaterial('gach_vo', lod),
  )
  curtain.name = 'imperial-curtain'
  curtain.castShadow = true
  curtain.receiveShadow = true
  group.add(curtain)

  if (lod >= 2) return group

  const plinth = new THREE.Mesh(
    extrudeAll(paths, plinthHeight, thickness + 0.35, lod, false),
    getMaterial('da_thanh', lod),
  )
  plinth.name = 'imperial-plinth'
  plinth.castShadow = true
  group.add(plinth)

  const parapet = new THREE.Mesh(
    extrudeAll(paths, parapetHeight, parapetThickness, lod, lod === 0),
    getMaterial('tuong_voi', lod),
  )
  parapet.name = 'imperial-parapet'
  parapet.position.y = height
  parapet.castShadow = true
  group.add(parapet)

  if (lod === 0) {
    const cope = new THREE.Mesh(
      extrudeAll(paths, 0.16, parapetThickness + 0.18, lod, false),
      getMaterial('da_thanh', lod),
    )
    cope.name = 'imperial-coping'
    cope.position.y = height + parapetHeight
    group.add(cope)
  }

  return group
}

export function disposeImperialWallGroup(group: THREE.Object3D): void {
  disposeObject3D(group)
}

export function countImperialWallDrawCalls(group: THREE.Object3D): number {
  let n = 0
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) n += 1
  })
  return n
}
