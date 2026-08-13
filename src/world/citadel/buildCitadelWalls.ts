import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { extrudeWallGeometry } from '../../core/geometry/kit'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { CITADEL, type LodLevel } from './constants'
import { buildCitadelCenterline, listBastions } from './citadelPath'

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

function offsetPath(path: THREE.Vector3[], amount: number): THREE.Vector3[] {
  if (path.length < 2) return path.map((p) => p.clone())
  const out: THREE.Vector3[] = []
  for (let i = 0; i < path.length; i++) {
    const prev = path[i === 0 ? (path.length > 2 ? path.length - 2 : 0) : i - 1]
    const next = path[i === path.length - 1 ? (path.length > 2 ? 1 : i) : i + 1]
    const cur = path[i]
    const t1 = new THREE.Vector3().subVectors(cur, prev).setY(0)
    const t2 = new THREE.Vector3().subVectors(next, cur).setY(0)
    if (t1.lengthSq() < 1e-8) t1.copy(t2)
    if (t2.lengthSq() < 1e-8) t2.copy(t1)
    t1.normalize()
    t2.normalize()
    const n1 = new THREE.Vector3(-t1.z, 0, t1.x)
    const n2 = new THREE.Vector3(-t2.z, 0, t2.x)
    const n = n1.add(n2)
    if (n.lengthSq() < 1e-8) n.copy(n1)
    n.normalize()
    out.push(cur.clone().addScaledVector(n, amount))
  }
  return out
}

function mergeMesh(
  geos: THREE.BufferGeometry[],
  material: THREE.Material,
  name: string,
): THREE.Mesh | null {
  if (geos.length === 0) return null
  const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false)
  if (geos.length > 1) geos.forEach((g) => g.dispose())
  if (!merged) return null
  const mesh = new THREE.Mesh(merged, material)
  mesh.name = name
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
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
    boxAt(CITADEL.width + t, h, t, cx, y, cz + hz, 0),
    boxAt(CITADEL.width + t, h, t, cx, y, cz - hz, 0),
    boxAt(t, h, CITADEL.depth - t, cx + hx, y, cz, 0),
    boxAt(t, h, CITADEL.depth - t, cx - hx, y, cz, 0),
  ]

  const merged = mergeGeometries(geos, false)
  geos.forEach((g) => g.dispose())
  const mesh = new THREE.Mesh(
    merged ?? new THREE.BoxGeometry(1, h, t),
    getMaterial('gach_vo', 2),
  )
  mesh.name = 'citadel-ring'
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  return group
}

/**
 * Pháo đài Vauban — khối mũi tên đọc được (không blob tròn).
 */
function buildBastionCaps(lod: LodLevel): THREE.BufferGeometry[] {
  const bastions = listBastions()
  const h = CITADEL.heightOuter
  const geos: THREE.BufferGeometry[] = []

  for (const b of bastions) {
    const proj = b.kind === 'corner' ? CITADEL.cornerProjection : CITADEL.sideProjection
    const halfW = b.kind === 'corner' ? CITADEL.cornerHalfWidth : CITADEL.sideHalfWidth
    const yaw = Math.atan2(b.outward.x, b.outward.z)

    // Thân pháo đài
    const mid = b.position.clone().addScaledVector(b.outward, proj * 0.42)
    geos.push(boxAt(halfW * 1.85, h, proj * 0.72, mid.x, h / 2, mid.z, yaw))

    // Mũi nhọn
    const tip = b.position.clone().addScaledVector(b.outward, proj * 0.82)
    geos.push(boxAt(halfW * 0.85, h, proj * 0.38, tip.x, h / 2, tip.z, yaw))

    // Hai mặt nghiêng (flank) — đọc góc Vauban
    if (lod === 0) {
      const left = b.position
        .clone()
        .addScaledVector(b.outward, proj * 0.38)
        .addScaledVector(b.along, -halfW * 0.62)
      const right = b.position
        .clone()
        .addScaledVector(b.outward, proj * 0.38)
        .addScaledVector(b.along, halfW * 0.62)
      geos.push(boxAt(halfW * 0.55, h, proj * 0.42, left.x, h / 2, left.z, yaw + 0.35))
      geos.push(boxAt(halfW * 0.55, h, proj * 0.42, right.x, h / 2, right.z, yaw - 0.35))
    }
  }
  return geos
}

/**
 * Kinh Thành: dày 21.25 m, cao ngoài 6.46 / trong 3.825, mặt ngoài dốc,
 * hành lang mặt thành, 24 pháo đài Vauban, bắn ải thưa.
 */
export function buildCitadelWallGroup(lod: LodLevel = 1): THREE.Group {
  if (lod === 2) return buildLod2Ring()

  const group = new THREE.Group()
  group.name = `CitadelWalls_LOD${lod}`

  const path = buildCitadelCenterline({ bastions: true })
  const ringPath = buildCitadelCenterline({ bastions: false })

  // Lõi đất / mặt trong — cao 3.825 [xác thực]
  const innerGeo = extrudeWallGeometry({
    path,
    height: CITADEL.heightInner,
    thickness: CITADEL.thickness,
    crenellation: false,
    lod,
  })

  // Mặt ngoài dốc — dày hơn đáy, lệch ra ngoài ~1.2 m
  const outerPath = offsetPath(path, 1.15)
  const scarpGeo = extrudeWallGeometry({
    path: outerPath,
    height: CITADEL.heightOuter,
    thickness: 7.4,
    crenellation: lod === 0,
    lod,
  })

  const brickGeos: THREE.BufferGeometry[] = [innerGeo, scarpGeo, ...buildBastionCaps(lod)]
  const brick = mergeMesh(brickGeos, getMaterial('gach_vo', lod), 'citadel-brick')
  if (brick) group.add(brick)

  // Chân đá thanh (dày hơn, thấp)
  const plinthGeo = extrudeWallGeometry({
    path: offsetPath(ringPath, 2.2),
    height: CITADEL.plinthHeight,
    thickness: CITADEL.thickness + 5.5,
    crenellation: false,
    lod,
  })
  const plinth = new THREE.Mesh(plinthGeo, getMaterial('da_thanh', lod))
  plinth.name = 'citadel-plinth'
  plinth.castShadow = true
  plinth.receiveShadow = true
  group.add(plinth)

  // Hành lang mặt thành — lát trên cao trong
  const walkGeo = extrudeWallGeometry({
    path,
    height: 0.18,
    thickness: CITADEL.thickness * 0.72,
    crenellation: false,
    lod,
  })
  const walk = new THREE.Mesh(walkGeo, getMaterial('gach_bat_trang', lod))
  walk.name = 'citadel-walkway'
  walk.position.y = CITADEL.heightInner
  walk.receiveShadow = true
  group.add(walk)

  // Parapet vôi trên mép ngoài
  const parapetGeo = extrudeWallGeometry({
    path: outerPath,
    height: CITADEL.parapetHeight,
    thickness: CITADEL.parapetThickness,
    crenellation: lod === 0,
    lod,
  })
  const parapet = new THREE.Mesh(parapetGeo, getMaterial('tuong_voi', lod))
  parapet.name = 'citadel-parapet'
  parapet.position.y = CITADEL.heightOuter
  parapet.castShadow = true
  group.add(parapet)

  // Bắn ải / pháo nhãn stylized — thưa, InstancedMesh
  if (lod < 2) {
    const embrasures = buildEmbrasures(outerPath, lod)
    if (embrasures) group.add(embrasures)
  }

  return group
}

function buildEmbrasures(path: THREE.Vector3[], lod: LodLevel): THREE.InstancedMesh | null {
  const spacing = lod === 0 ? 28 : 42
  const slots: Array<{ p: THREE.Vector3; yaw: number }> = []
  let acc = 0
  let next = spacing * 0.6
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]
    const b = path[i + 1]
    const dir = new THREE.Vector3().subVectors(b, a)
    const len = dir.length()
    if (len < 1e-4) continue
    dir.normalize()
    const yaw = Math.atan2(dir.x, dir.z)
    while (next <= acc + len) {
      const t = next - acc
      slots.push({ p: a.clone().addScaledVector(dir, t), yaw })
      next += spacing
    }
    acc += len
  }
  if (slots.length === 0) return null

  const geo = new THREE.BoxGeometry(0.55, 0.42, 1.15)
  const mesh = new THREE.InstancedMesh(geo, getMaterial('da_thanh', lod), slots.length)
  mesh.name = 'citadel-embrasures'
  mesh.castShadow = lod === 0
  const dummy = new THREE.Object3D()
  slots.forEach((s, i) => {
    dummy.position.set(s.p.x, CITADEL.heightOuter + 0.55, s.p.z)
    dummy.rotation.set(0, s.yaw, 0)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  })
  mesh.instanceMatrix.needsUpdate = true
  return mesh
}

export function disposeCitadelWallGroup(group: THREE.Object3D): void {
  disposeObject3D(group)
}

export function countCitadelDrawCalls(group: THREE.Object3D): number {
  let n = 0
  group.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.isMesh) n += 1
  })
  return n
}
