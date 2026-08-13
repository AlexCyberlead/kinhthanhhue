import * as THREE from 'three'
import { IMPERIAL_CITY, IMPERIAL_MOAT, NOI_KIM_THUY as NOI_KIM_CFG } from '../terrain/terrainConfig'
import { imperialMoatGateBridge, imperialMoatSouthZ, noiKimThuyGateBridge } from '../terrain/heightfield'
import { HO_THAI_DICH, HO_TINH_TAM, NGOAI_KIM_THUY, NOI_KIM_THUY, NGU_HA, WATER_Y } from './waterConfig'

/** Horizontal plane (XZ), Y-up — ready for water surface. */
export function createLakeGeometry(
  sizeX: number,
  sizeZ: number,
  segX: number,
  segZ: number,
): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(sizeX, sizeZ, segX, segZ)
  geo.rotateX(-Math.PI / 2)
  return geo
}

/**
 * Ribbon strip along XZ polyline (Ngự Hà).
 * Single BufferGeometry → 1 draw call.
 */
export function createCanalRibbon(
  path: [number, number][],
  width: number,
  segsPerEdge: number,
  widthSegs: number,
  y: number,
): THREE.BufferGeometry {
  if (path.length < 2) {
    return new THREE.BufferGeometry()
  }

  // Densify + compute tangents
  const pts: THREE.Vector3[] = []
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]
    const b = path[i + 1]
    for (let s = 0; s < segsPerEdge; s++) {
      const t = s / segsPerEdge
      pts.push(
        new THREE.Vector3(
          a[0] + (b[0] - a[0]) * t,
          y,
          a[1] + (b[1] - a[1]) * t,
        ),
      )
    }
  }
  const last = path[path.length - 1]
  pts.push(new THREE.Vector3(last[0], y, last[1]))

  const half = width * 0.5
  const cols = widthSegs + 1
  const rows = pts.length
  const positions = new Float32Array(rows * cols * 3)
  const uvs = new Float32Array(rows * cols * 2)
  const normals = new Float32Array(rows * cols * 3)

  let dist = 0
  for (let i = 0; i < rows; i++) {
    const p = pts[i]
    const prev = pts[Math.max(0, i - 1)]
    const next = pts[Math.min(rows - 1, i + 1)]
    if (i > 0) dist += p.distanceTo(prev)

    const tangent = new THREE.Vector3().subVectors(next, prev).setY(0)
    if (tangent.lengthSq() < 1e-8) tangent.set(1, 0, 0)
    else tangent.normalize()
    // Perpendicular in XZ (left of travel)
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize()

    for (let c = 0; c < cols; c++) {
      const u = c / widthSegs
      const offset = (u - 0.5) * 2 * half
      const v = new THREE.Vector3().copy(p).addScaledVector(side, offset)
      const idx = (i * cols + c) * 3
      positions[idx] = v.x
      positions[idx + 1] = v.y
      positions[idx + 2] = v.z
      normals[idx] = 0
      normals[idx + 1] = 1
      normals[idx + 2] = 0
      const uvi = (i * cols + c) * 2
      uvs[uvi] = u
      uvs[uvi + 1] = dist * 0.02
    }
  }

  const indices: number[] = []
  for (let i = 0; i < rows - 1; i++) {
    for (let c = 0; c < widthSegs; c++) {
      const a = i * cols + c
      const b = a + 1
      const d = (i + 1) * cols + c
      const e = d + 1
      indices.push(a, d, b, b, d, e)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeBoundingSphere()
  return geo
}

/**
 * Ngoại Kim Thủy ring — 4 bands, gate bridges left dry.
 * One BufferGeometry, Y = IMPERIAL_MOAT.waterY.
 */
export function createImperialMoatGeometry(): THREE.BufferGeometry {
  const southZ = imperialMoatSouthZ()
  const northZ = IMPERIAL_CITY.centerZ - IMPERIAL_CITY.halfZ
  const eastX = IMPERIAL_CITY.centerX + IMPERIAL_CITY.halfX
  const westX = IMPERIAL_CITY.centerX - IMPERIAL_CITY.halfX
  const inner = IMPERIAL_MOAT.inset
  const outer = IMPERIAL_MOAT.inset + IMPERIAL_MOAT.width
  const y = IMPERIAL_MOAT.waterY

  const pieces: THREE.BufferGeometry[] = []

  const addBand = (minX: number, maxX: number, minZ: number, maxZ: number) => {
    const w = maxX - minX
    const d = maxZ - minZ
    if (w < 1 || d < 1) return
    const segsX = Math.max(1, Math.round(w / 8))
    const segsZ = Math.max(1, Math.round(d / 8))
    const geo = new THREE.PlaneGeometry(w, d, segsX, segsZ)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position as THREE.BufferAttribute
    const keep: number[] = []
    const indexOf = new Int32Array(pos.count).fill(-1)
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + (minX + maxX) * 0.5
      const z = pos.getZ(i) + (minZ + maxZ) * 0.5
      if (imperialMoatGateBridge(x, z)) continue
      indexOf[i] = keep.length / 3
      keep.push(x, y, z)
    }
    const idx = geo.getIndex()
    const outIdx: number[] = []
    if (idx) {
      for (let i = 0; i < idx.count; i += 3) {
        const a = indexOf[idx.getX(i)]
        const b = indexOf[idx.getX(i + 1)]
        const c = indexOf[idx.getX(i + 2)]
        if (a < 0 || b < 0 || c < 0) continue
        outIdx.push(a, b, c)
      }
    }
    geo.dispose()
    if (keep.length < 9 || outIdx.length < 3) return
    const trimmed = new THREE.BufferGeometry()
    trimmed.setAttribute('position', new THREE.Float32BufferAttribute(keep, 3))
    trimmed.setIndex(outIdx)
    const uvs = new Float32Array((keep.length / 3) * 2)
    for (let i = 0; i < keep.length / 3; i++) {
      uvs[i * 2] = keep[i * 3] * 0.05
      uvs[i * 2 + 1] = keep[i * 3 + 2] * 0.05
    }
    trimmed.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    pieces.push(trimmed)
  }

  // South / north full width
  addBand(westX - outer, eastX + outer, southZ + inner, southZ + outer)
  addBand(westX - outer, eastX + outer, northZ - outer, northZ - inner)
  // East / west between the north and south lips (no corner double-cover)
  addBand(eastX + inner, eastX + outer, northZ - inner, southZ + inner)
  addBand(westX - outer, westX - inner, northZ - inner, southZ + inner)

  if (pieces.length === 0) return new THREE.BufferGeometry()
  if (pieces.length === 1) {
    pieces[0].computeVertexNormals()
    pieces[0].computeBoundingSphere()
    return pieces[0]
  }

  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  let base = 0
  for (const g of pieces) {
    const pos = g.attributes.position as THREE.BufferAttribute
    const uv = g.attributes.uv as THREE.BufferAttribute | undefined
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i))
      if (uv) {
        uvs.push(uv.getX(i), uv.getY(i))
      } else {
        uvs.push(pos.getX(i) * 0.05, pos.getZ(i) * 0.05)
      }
    }
    const idx = g.index
    if (idx) {
      for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + base)
    }
    base += pos.count
    g.dispose()
  }
  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  out.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  out.setIndex(indices)
  out.computeVertexNormals()
  out.computeBoundingSphere()
  return out
}

/**
 * Nội Kim Thủy — 3 band Đông/Tây/Bắc, chừa cầu cửa Tử Cấm.
 * [ước lượng hợp lý]
 */
export function createNoiKimThuyGeometry(): THREE.BufferGeometry {
  const { centerX, centerZ, innerHalfX, innerHalfZ, width, waterY } = NOI_KIM_CFG
  const innerE = centerX + innerHalfX
  const innerW = centerX - innerHalfX
  const innerN = centerZ - innerHalfZ
  const innerS = centerZ + innerHalfZ
  const pieces: THREE.BufferGeometry[] = []

  const addBand = (minX: number, maxX: number, minZ: number, maxZ: number) => {
    const w = maxX - minX
    const d = maxZ - minZ
    if (w < 1 || d < 1) return
    const geo = new THREE.PlaneGeometry(w, d, Math.max(1, Math.round(w / 6)), Math.max(1, Math.round(d / 6)))
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position as THREE.BufferAttribute
    const keep: number[] = []
    const indexOf = new Int32Array(pos.count).fill(-1)
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + (minX + maxX) * 0.5
      const z = pos.getZ(i) + (minZ + maxZ) * 0.5
      if (noiKimThuyGateBridge(x, z)) continue
      indexOf[i] = keep.length / 3
      keep.push(x, waterY, z)
    }
    const idx = geo.getIndex()
    const outIdx: number[] = []
    if (idx) {
      for (let i = 0; i < idx.count; i += 3) {
        const a = indexOf[idx.getX(i)]
        const b = indexOf[idx.getX(i + 1)]
        const c = indexOf[idx.getX(i + 2)]
        if (a < 0 || b < 0 || c < 0) continue
        outIdx.push(a, b, c)
      }
    }
    geo.dispose()
    if (keep.length < 9 || outIdx.length < 3) return
    const trimmed = new THREE.BufferGeometry()
    trimmed.setAttribute('position', new THREE.Float32BufferAttribute(keep, 3))
    trimmed.setIndex(outIdx)
    const uvs = new Float32Array((keep.length / 3) * 2)
    for (let i = 0; i < keep.length / 3; i++) {
      uvs[i * 2] = keep[i * 3] * 0.05
      uvs[i * 2 + 1] = keep[i * 3 + 2] * 0.05
    }
    trimmed.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    pieces.push(trimmed)
  }

  addBand(innerW - width, innerE + width, innerN - width, innerN)
  addBand(innerE, innerE + width, innerN, innerS)
  addBand(innerW - width, innerW, innerN, innerS)

  if (pieces.length === 0) return new THREE.BufferGeometry()
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  let base = 0
  for (const g of pieces) {
    const pos = g.attributes.position as THREE.BufferAttribute
    const uv = g.attributes.uv as THREE.BufferAttribute | undefined
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i))
      if (uv) uvs.push(uv.getX(i), uv.getY(i))
      else uvs.push(pos.getX(i) * 0.05, pos.getZ(i) * 0.05)
    }
    const idx = g.index
    if (idx) {
      for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + base)
    }
    base += pos.count
    g.dispose()
  }
  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  out.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  out.setIndex(indices)
  out.computeVertexNormals()
  out.computeBoundingSphere()
  return out
}

export type WaterMeshBundle = {
  thaiDich: THREE.Mesh
  tinhTam: THREE.Mesh
  nguHa: THREE.Mesh
  ngoaiKimThuy: THREE.Mesh
  noiKimThuy: THREE.Mesh
  dispose: () => void
}

/** Build water meshes sharing one material (≤ 4 draw calls). */
export function createWaterMeshes(material: THREE.Material): WaterMeshBundle {
  const thaiGeo = createLakeGeometry(
    HO_THAI_DICH.size[0],
    HO_THAI_DICH.size[1],
    HO_THAI_DICH.segments[0],
    HO_THAI_DICH.segments[1],
  )
  const tinhGeo = createLakeGeometry(
    HO_TINH_TAM.size[0],
    HO_TINH_TAM.size[1],
    HO_TINH_TAM.segments[0],
    HO_TINH_TAM.segments[1],
  )
  const canalGeo = createCanalRibbon(
    NGU_HA.path,
    NGU_HA.width,
    NGU_HA.segsPerEdge,
    NGU_HA.widthSegs,
    WATER_Y,
  )
  const moatGeo = createImperialMoatGeometry()
  const noiGeo = createNoiKimThuyGeometry()

  const thaiDich = new THREE.Mesh(thaiGeo, material)
  thaiDich.name = HO_THAI_DICH.id
  thaiDich.position.set(...HO_THAI_DICH.center)
  thaiDich.renderOrder = 1
  thaiDich.frustumCulled = true

  const tinhTam = new THREE.Mesh(tinhGeo, material)
  tinhTam.name = HO_TINH_TAM.id
  tinhTam.position.set(...HO_TINH_TAM.center)
  tinhTam.renderOrder = 1
  tinhTam.frustumCulled = true

  const nguHa = new THREE.Mesh(canalGeo, material)
  nguHa.name = NGU_HA.id
  nguHa.renderOrder = 1
  nguHa.frustumCulled = true

  const ngoaiKimThuy = new THREE.Mesh(moatGeo, material)
  ngoaiKimThuy.name = NGOAI_KIM_THUY.id
  ngoaiKimThuy.renderOrder = 1
  ngoaiKimThuy.frustumCulled = true

  const noiKimThuy = new THREE.Mesh(noiGeo, material)
  noiKimThuy.name = NOI_KIM_THUY.id
  noiKimThuy.renderOrder = 1
  noiKimThuy.frustumCulled = true

  return {
    thaiDich,
    tinhTam,
    nguHa,
    ngoaiKimThuy,
    noiKimThuy,
    dispose: () => {
      thaiGeo.dispose()
      tinhGeo.dispose()
      canalGeo.dispose()
      moatGeo.dispose()
      noiGeo.dispose()
    },
  }
}
