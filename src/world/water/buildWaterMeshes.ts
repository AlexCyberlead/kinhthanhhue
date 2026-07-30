import * as THREE from 'three'
import { HO_THAI_DICH, HO_TINH_TAM, NGU_HA, WATER_Y } from './waterConfig'

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

export type WaterMeshBundle = {
  thaiDich: THREE.Mesh
  tinhTam: THREE.Mesh
  nguHa: THREE.Mesh
  dispose: () => void
}

/** Build 3 water meshes sharing one material (≤ 3 draw calls). */
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

  return {
    thaiDich,
    tinhTam,
    nguHa,
    dispose: () => {
      thaiGeo.dispose()
      tinhGeo.dispose()
      canalGeo.dispose()
    },
  }
}
