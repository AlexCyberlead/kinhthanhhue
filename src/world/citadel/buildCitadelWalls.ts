import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { buildWall } from '../../core/geometry/kit'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { CITADEL, type LodLevel } from './constants'
import { buildCitadelCenterline, listBastions } from './citadelPath'

function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh) {
      mesh.geometry?.dispose()
      // materials are shared via MaterialLibrary — do not dispose
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

/** LOD2: 4 box segments forming a simple rectangular ring. */
function buildLod2Ring(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'CitadelWalls_LOD2'

  const hx = CITADEL.width / 2
  const hz = CITADEL.depth / 2
  const t = CITADEL.thickness
  const h = CITADEL.heightOuter
  const cx = CITADEL.centerX
  const cz = CITADEL.centerZ
  const y = h / 2

  const geos = [
    boxAt(CITADEL.width + t, h, t, cx, y, cz + hz, 0), // south
    boxAt(CITADEL.width + t, h, t, cx, y, cz - hz, 0), // north
    boxAt(t, h, CITADEL.depth - t, cx + hx, y, cz, 0), // east
    boxAt(t, h, CITADEL.depth - t, cx - hx, y, cz, 0), // west
  ]

  const merged = mergeGeometries(geos, false)
  geos.forEach((g) => g.dispose())
  if (!merged) {
    group.add(new THREE.Mesh(new THREE.BoxGeometry(1, h, t), getMaterial('gach_vo', 2)))
    return group
  }

  const mesh = new THREE.Mesh(merged, getMaterial('gach_vo', 2))
  mesh.name = 'citadel-ring'
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  return group
}

/** Thin stone plinth under curtain (merged). */
function buildPlinth(path: THREE.Vector3[], lod: LodLevel): THREE.Mesh | null {
  if (path.length < 2) return null
  const wall = buildWall({
    path,
    height: CITADEL.plinthHeight,
    thickness: CITADEL.thickness + 2.5,
    crenellation: false,
    lod,
  })
  wall.material = getMaterial('da_thanh', lod)
  wall.name = 'citadel-plinth'
  wall.position.y = 0
  return wall
}

/** Lime wash parapet / terreplein strip on wall top (LOD0–1). */
function buildParapet(path: THREE.Vector3[], lod: LodLevel): THREE.Mesh | null {
  if (path.length < 2 || lod >= 2) return null
  const wall = buildWall({
    path,
    height: CITADEL.parapetHeight,
    thickness: CITADEL.parapetThickness,
    crenellation: false,
    lod,
  })
  wall.material = getMaterial('tuong_voi', lod)
  wall.name = 'citadel-parapet'
  wall.position.y = CITADEL.heightOuter
  return wall
}

/**
 * Compact angular bastion volumes (extra mass beyond curtain thickness).
 * Merged into one mesh — keeps draw calls low while reading as Vauban projections.
 */
function buildBastionCaps(lod: LodLevel): THREE.Mesh | null {
  if (lod >= 2) return null
  const bastions = listBastions()
  const h = CITADEL.heightOuter
  const geos: THREE.BufferGeometry[] = []

  for (const b of bastions) {
    const proj = b.kind === 'corner' ? CITADEL.cornerProjection : CITADEL.sideProjection
    const halfW = b.kind === 'corner' ? CITADEL.cornerHalfWidth : CITADEL.sideHalfWidth
    const depth = proj * 0.85
    const width = halfW * 2.1
    const mid = b.position.clone().addScaledVector(b.outward, depth * 0.55)
    const yaw = Math.atan2(b.outward.x, b.outward.z)
    geos.push(boxAt(width, h, depth, mid.x, h / 2, mid.z, yaw))

    // Salient tip wedge (flattened diamond)
    const tip = b.position.clone().addScaledVector(b.outward, proj * 0.72)
    geos.push(boxAt(halfW * 1.1, h, proj * 0.45, tip.x, h / 2, tip.z, yaw))
  }

  const merged = mergeGeometries(geos, false)
  geos.forEach((g) => g.dispose())
  if (!merged) return null

  const mesh = new THREE.Mesh(merged, getMaterial('gach_vo', lod))
  mesh.name = 'citadel-bastion-caps'
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/**
 * Build Kinh Thành outer walls + 24 Vauban bastions.
 * Draw-call budget target: ≤ 8 (typically 2–4 merged meshes).
 */
export function buildCitadelWallGroup(lod: LodLevel = 1): THREE.Group {
  if (lod === 2) return buildLod2Ring()

  const group = new THREE.Group()
  group.name = `CitadelWalls_LOD${lod}`

  const path = buildCitadelCenterline({ bastions: true })
  const ringPath = buildCitadelCenterline({ bastions: false })

  // 1+2) Curtain outline + bastion mass — merge same material (gach_vo) → 1 DC
  const curtain = buildWall({
    path,
    height: CITADEL.heightOuter,
    thickness: CITADEL.thickness,
    crenellation: lod === 0,
    lod,
  })
  const caps = buildBastionCaps(lod)
  const brickSources: THREE.BufferGeometry[] = [curtain.geometry]
  if (caps) brickSources.push(caps.geometry)

  const brickMerged = mergeGeometries(brickSources, false)
  for (const g of brickSources) g.dispose()

  const brickMesh = new THREE.Mesh(
    brickMerged ?? new THREE.BoxGeometry(1, CITADEL.heightOuter, CITADEL.thickness),
    getMaterial('gach_vo', lod),
  )
  brickMesh.name = 'citadel-brick'
  brickMesh.castShadow = true
  brickMesh.receiveShadow = true
  group.add(brickMesh)

  // 3) Stone plinth (simple ring — cheap)
  const plinth = buildPlinth(ringPath, lod)
  if (plinth) group.add(plinth)

  // 4) Parapet / terreplein (tuong_voi)
  const parapet = buildParapet(path, lod)
  if (parapet) group.add(parapet)

  return group
}

export function disposeCitadelWallGroup(group: THREE.Object3D): void {
  disposeObject3D(group)
}

/** Count mesh children (= approximate draw calls with unique materials). */
export function countCitadelDrawCalls(group: THREE.Object3D): number {
  let n = 0
  group.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.isMesh) n += 1
  })
  return n
}
