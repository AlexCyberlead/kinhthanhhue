import * as THREE from 'three'
import { getMaterial } from '../../materials/MaterialLibrary'
import { meshOf } from './roof/merge'
import { copyUvToUv2, uvRepeat } from './uvMeters'

export type WallOpts = {
  path: THREE.Vector3[]
  height: number
  thickness: number
  crenellation?: boolean
  lod?: 0 | 1 | 2
  /**
   * `layered` = chân gạch vồ + thân vôi + đỉnh (mặc định).
   * `masonry` = một vật liệu gạch vồ (thành / merge pipeline).
   */
  finish?: 'layered' | 'masonry'
}

export type WallExtrudeOpts = {
  path: THREE.Vector3[]
  height: number
  thickness: number
  crenellation?: boolean
  lod?: 0 | 1 | 2
  y0?: number
  tile?: { u: number; v: number }
}

/**
 * Đùn tường theo polyline — geo trần cho citadel / merge.
 * UV world-ish mét. Crenel nhịp đều (không 1 hộp mỗi đoạn).
 */
export function extrudeWallGeometry(opts: WallExtrudeOpts): THREE.BufferGeometry {
  const {
    path,
    height,
    thickness,
    crenellation = false,
    lod = 0,
    y0 = 0,
    tile = uvRepeat('gachVo'),
  } = opts

  if (path.length < 2) {
    const g = new THREE.BoxGeometry(1, height, thickness)
    g.translate(0, y0 + height / 2, 0)
    copyUvToUv2(g)
    return g
  }

  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const half = thickness / 2
  let vertexOffset = 0
  let dist = 0

  const pushCorner = (p: THREE.Vector3, u: number, v: number) => {
    positions.push(p.x, p.y, p.z)
    uvs.push(u / tile.u, v / tile.v)
  }

  const pushQuad = (
    p0: THREE.Vector3,
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    p3: THREE.Vector3,
    u0: number,
    v0: number,
    u1: number,
    v1: number,
  ) => {
    const o = vertexOffset
    pushCorner(p0, u0, v0)
    pushCorner(p1, u1, v0)
    pushCorner(p2, u1, v1)
    pushCorner(p3, u0, v1)
    indices.push(o, o + 1, o + 2, o, o + 2, o + 3)
    vertexOffset += 4
  }

  const appendBox = (cw: number, ch: number, cd: number, mid: THREE.Vector3, yaw: number, yCenter: number) => {
    const crenel = new THREE.BoxGeometry(cw, ch, cd)
    const box = new THREE.Mesh(crenel)
    box.position.set(mid.x, yCenter, mid.z)
    box.rotation.y = yaw
    box.updateMatrix()
    const pos = crenel.attributes.position
    const uvAttr = crenel.attributes.uv
    const base = vertexOffset
    for (let vi = 0; vi < pos.count; vi++) {
      const p = new THREE.Vector3().fromBufferAttribute(pos, vi).applyMatrix4(box.matrix)
      positions.push(p.x, p.y, p.z)
      uvs.push((uvAttr.getX(vi) * cw) / tile.u, (uvAttr.getY(vi) * ch) / tile.v)
    }
    const idx = crenel.index
    if (idx) {
      for (let k = 0; k < idx.count; k++) indices.push(base + idx.getX(k))
    }
    vertexOffset += pos.count
    crenel.dispose()
  }

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]
    const b = path[i + 1]
    const dir = new THREE.Vector3().subVectors(b, a)
    const len = dir.length()
    if (len < 1e-4) continue
    dir.normalize()
    const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(half)
    const y1 = y0 + height

    const bl = a.clone().add(side).setY(y0)
    const br = a.clone().sub(side).setY(y0)
    const tl = b.clone().add(side).setY(y0)
    const tr = b.clone().sub(side).setY(y0)
    const blh = bl.clone().setY(y1)
    const brh = br.clone().setY(y1)
    const tlh = tl.clone().setY(y1)
    const trh = tr.clone().setY(y1)

    const u0 = dist
    const u1 = dist + len

    pushQuad(bl, tl, tlh, blh, u0, y0, u1, y1)
    pushQuad(br, brh, trh, tr, u0, y0, u1, y1)
    pushQuad(blh, tlh, trh, brh, u0, 0, u1, thickness)
    pushQuad(bl, br, tr, tl, u0, 0, u1, thickness)
    pushQuad(bl, br, brh, blh, 0, y0, thickness, y1)
    pushQuad(tl, tlh, trh, tr, 0, y0, thickness, y1)

    if (crenellation && lod < 2) {
      // Nhịp merlon ~1.55 + khe 1.05. [ước lượng hợp lý]
      const merlonW = 1.55
      const gap = 1.05
      const pitch = merlonW + gap
      const ch = 0.88
      const yaw = Math.atan2(dir.x, dir.z)
      let d = 0.65
      while (d + merlonW < len - 0.35) {
        const mid = a.clone().addScaledVector(dir, d + merlonW * 0.5)
        appendBox(merlonW, ch, thickness * 0.92, mid, yaw, y1 + ch / 2)
        d += pitch
      }
    }

    dist += len
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  copyUvToUv2(geo)
  return geo
}

function alongPath(path: THREE.Vector3[], spacing: number): Array<{ p: THREE.Vector3; yaw: number }> {
  const out: Array<{ p: THREE.Vector3; yaw: number }> = []
  let acc = 0
  let next = spacing * 0.5
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
      out.push({ p: a.clone().addScaledVector(dir, t), yaw })
      next += spacing
    }
    acc += len
  }
  return out
}

/**
 * Tường lớp: chân gạch vồ, thân vôi, đỉnh / con sơn / pháp lam lod0.
 * Trả Group (nhiều material). Citadel dùng `extrudeWallGeometry`.
 */
export function buildWall(opts: WallOpts): THREE.Group {
  const { path, height, thickness, crenellation = false, lod = 0, finish = 'layered' } = opts
  const group = new THREE.Group()
  group.name = 'wall'

  if (path.length < 2 || lod === 2 || finish === 'masonry') {
    const geo = extrudeWallGeometry({ path, height, thickness, crenellation: crenellation && lod < 2, lod })
    const id = finish === 'layered' && lod === 2 ? 'tuong_voi' : 'gach_vo'
    const mesh = new THREE.Mesh(geo, getMaterial(id, lod))
    mesh.name = 'wall-body'
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
    return group
  }

  // Chân ~0.85 m hoặc 30% cao. [ước lượng hợp lý]
  const baseH = Math.min(0.9, Math.max(0.35, height * 0.3))
  const capH = height > 1.4 ? 0.16 : 0.1
  const bodyH = Math.max(0.2, height - baseH - capH)

  const baseGeo = extrudeWallGeometry({
    path,
    height: baseH,
    thickness: thickness * 1.06,
    crenellation: false,
    lod,
    y0: 0,
    tile: uvRepeat('gachVo'),
  })
  const bodyGeo = extrudeWallGeometry({
    path,
    height: bodyH,
    thickness,
    crenellation: false,
    lod,
    y0: baseH,
    tile: uvRepeat('tuongVoi'),
  })
  const capGeo = extrudeWallGeometry({
    path,
    height: capH,
    thickness: thickness * 1.12,
    crenellation,
    lod,
    y0: baseH + bodyH,
    tile: lod === 0 ? uvRepeat('phapLam') : uvRepeat('daThanh'),
  })

  const base = new THREE.Mesh(baseGeo, getMaterial('gach_vo', lod))
  base.name = 'wall-base'
  base.castShadow = true
  base.receiveShadow = true
  const body = new THREE.Mesh(bodyGeo, getMaterial('tuong_voi', lod))
  body.name = 'wall-body'
  body.castShadow = true
  body.receiveShadow = true
  const cap = new THREE.Mesh(capGeo, getMaterial(lod === 0 ? 'phap_lam' : 'da_thanh', lod))
  cap.name = 'wall-cap'
  cap.castShadow = true
  cap.receiveShadow = true
  group.add(base, body, cap)

  if (lod === 0) {
    const slots = alongPath(path, 1.65)
    if (slots.length > 0) {
      const wood = getMaterial('go_lim', lod)
      const arm = new THREE.BoxGeometry(0.12, 0.08, 0.28)
      const inst = new THREE.InstancedMesh(arm, wood, slots.length)
      inst.name = 'wall-con-son'
      inst.castShadow = true
      const dummy = new THREE.Object3D()
      const y = baseH + bodyH - 0.06
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i]
        dummy.position.set(s.p.x, y, s.p.z)
        dummy.rotation.y = s.yaw
        dummy.updateMatrix()
        inst.setMatrixAt(i, dummy.matrix)
      }
      inst.instanceMatrix.needsUpdate = true
      group.add(inst)
    }
  }

  return group
}

/** @deprecated dùng meshOf + extrude — giữ cho caller merge cũ nếu còn. */
export function wallBodyMesh(opts: WallOpts): THREE.Mesh {
  const { path, height, thickness, crenellation = false, lod = 0 } = opts
  const geo = extrudeWallGeometry({ path, height, thickness, crenellation, lod })
  return meshOf(geo, getMaterial('gach_vo', lod), 'wall') ?? new THREE.Mesh(geo)
}
