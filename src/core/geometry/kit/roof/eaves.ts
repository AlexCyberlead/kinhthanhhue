import * as THREE from 'three'
import { getMaterial } from '../../../materials/MaterialLibrary'
import { copyUvToUv2, uvRepeat } from '../uvMeters'
import { sampleRoof, segsFor } from './math'
import { mergeKit, meshOf } from './merge'
import type { RoofFrame } from './types'

const WOOD = uvRepeat('goLim')

function eaveRing(f: RoofFrame): THREE.Vector3[] {
  const segsW = segsFor(f.halfW, f.lod)
  const segsD = segsFor(f.halfD, f.lod)
  const pts: THREE.Vector3[] = []
  const push = (x: number, z: number) => {
    const p = sampleRoof(x, z, f, WOOD.u, WOOD.v)
    pts.push(new THREE.Vector3(p.x, p.y, p.z))
  }
  for (let i = 0; i < segsW; i++) push(-f.halfW + (i / segsW) * f.halfW * 2, -f.halfD)
  for (let i = 0; i < segsD; i++) push(f.halfW, -f.halfD + (i / segsD) * f.halfD * 2)
  for (let i = 0; i < segsW; i++) push(f.halfW - (i / segsW) * f.halfW * 2, f.halfD)
  for (let i = 0; i < segsD; i++) push(-f.halfW, f.halfD - (i / segsD) * f.halfD * 2)
  return pts
}

/** Diềm gỗ theo chu vi eave (theo đầu đao). LOD0–1. */
export function buildEaveFascia(f: RoofFrame): THREE.BufferGeometry | null {
  const ring = eaveRing(f)
  const n = ring.length
  if (n < 4) return null

  const boardH = f.lod === 0 ? 0.14 : 0.12
  const boardT = 0.065
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  let dist = 0

  const outward = (p: THREE.Vector3) => {
    const o = new THREE.Vector3(p.x, 0, p.z)
    if (o.lengthSq() < 1e-8) o.set(0, 0, 1)
    else o.normalize()
    return o
  }

  for (let i = 0; i < n; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % n]
    const oa = outward(a)
    const ob = outward(b)
    const aOut = a.clone().addScaledVector(oa, boardT * 0.35)
    const bOut = b.clone().addScaledVector(ob, boardT * 0.35)
    const aIn = a.clone().addScaledVector(oa, -boardT)
    const bIn = b.clone().addScaledVector(ob, -boardT)
    const aBot = aOut.clone()
    aBot.y -= boardH
    const bBot = bOut.clone()
    bBot.y -= boardH
    const aInBot = aIn.clone()
    aInBot.y -= boardH
    const bInBot = bIn.clone()
    bInBot.y -= boardH

    const seg = a.distanceTo(b)
    const u0 = dist / WOOD.u
    const u1 = (dist + seg) / WOOD.u
    const v0 = 0
    const v1 = boardH / WOOD.v
    dist += seg

    const o = positions.length / 3
    const push = (p: THREE.Vector3, u: number, v: number) => {
      positions.push(p.x, p.y, p.z)
      uvs.push(u, v)
    }
    // outer face
    push(aOut, u0, v0)
    push(bOut, u1, v0)
    push(bBot, u1, v1)
    push(aBot, u0, v1)
    indices.push(o, o + 1, o + 2, o, o + 2, o + 3)
    // underside strip
    push(aBot, u0, v0)
    push(bBot, u1, v0)
    push(bInBot, u1, v1)
    push(aInBot, u0, v1)
    indices.push(o + 4, o + 5, o + 6, o + 4, o + 6, o + 7)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  copyUvToUv2(geo)
  return geo
}

function duongTileGeo(scale: number): THREE.BufferGeometry {
  const r = 0.07 * scale
  const tube = new THREE.CylinderGeometry(r * 0.92, r, 0.17 * scale, 8, 1)
  tube.rotateZ(Math.PI / 2)
  tube.translate(-0.04 * scale, 0.015 * scale, 0)
  const cap = new THREE.CircleGeometry(r * 1.22, 10)
  cap.rotateY(Math.PI / 2)
  cap.translate(0.045 * scale, 0.015 * scale, 0)
  const lip = new THREE.TorusGeometry(r * 1.05, r * 0.16, 5, 10, Math.PI * 2)
  lip.rotateY(Math.PI / 2)
  lip.translate(0.045 * scale, 0.015 * scale, 0)
  return mergeKit([tube, cap, lip]) ?? new THREE.CylinderGeometry(r * 0.92, r, 0.17 * scale, 8, 1)
}

/**
 * Hàng ngói dương / ô kê dọc diềm — 1 InstancedMesh.
 * LOD0 only. Spacing ~0.35 m × tileScale. [ước lượng hợp lý]
 */
export function buildOkeInstances(f: RoofFrame, tileMaterialLod: 0 | 1 | 2): THREE.InstancedMesh | null {
  if (f.lod !== 0) return null
  const ring = eaveRing(f)
  const n = ring.length
  if (n < 4) return null

  const spacing = 0.35 * Math.max(0.45, f.tileScale)
  const hits: { p: THREE.Vector3; out: THREE.Vector3 }[] = []
  let acc = 0
  let next = 0
  for (let i = 0; i < n; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % n]
    const seg = a.distanceTo(b)
    if (seg < 1e-5) continue
    const dir = new THREE.Vector3().subVectors(b, a)
    while (next <= acc + seg) {
      const t = (next - acc) / seg
      const p = a.clone().lerp(b, t)
      const out = new THREE.Vector3(p.x, 0, p.z)
      if (out.lengthSq() < 1e-8) out.set(dir.z, 0, -dir.x)
      else out.normalize()
      hits.push({ p, out })
      next += spacing
    }
    acc += seg
  }
  if (hits.length === 0) return null

  const geo = duongTileGeo(Math.max(0.7, f.tileScale))
  const mat = getMaterial('mai_ngoi_am_duong', tileMaterialLod)
  const inst = new THREE.InstancedMesh(geo, mat, hits.length)
  inst.name = 'roof-oke'
  inst.castShadow = true
  inst.receiveShadow = true
  const dummy = new THREE.Object3D()
  const yAxis = new THREE.Vector3(0, 1, 0)
  for (let i = 0; i < hits.length; i++) {
    const { p, out } = hits[i]
    const z = new THREE.Vector3().crossVectors(out, yAxis).normalize()
    if (z.lengthSq() < 1e-6) z.set(0, 0, 1)
    const y = new THREE.Vector3().crossVectors(z, out).normalize()
    dummy.position.copy(p)
    dummy.position.addScaledVector(out, 0.04)
    dummy.position.y += 0.02
    dummy.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(out, y, z))
    dummy.updateMatrix()
    inst.setMatrixAt(i, dummy.matrix)
  }
  inst.instanceMatrix.needsUpdate = true
  return inst
}

export function buildEaveGroup(f: RoofFrame, lod: 0 | 1 | 2): THREE.Group | null {
  if (lod === 2) return null
  const g = new THREE.Group()
  g.name = 'roof-eave'
  const fascia = meshOf(buildEaveFascia(f), getMaterial('go_lim', lod), 'roof-fascia')
  if (fascia) g.add(fascia)
  const oke = buildOkeInstances(f, lod)
  if (oke) g.add(oke)
  return g.children.length ? g : null
}
