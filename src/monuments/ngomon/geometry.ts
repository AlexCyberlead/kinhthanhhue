import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { copyUvToUv2, scaleBoxUvToMeters, uvRepeat } from '../../core/geometry/kit/uvMeters'
import type { TextureFactoryId } from '../../core/materials/textures'

export type Lod = 0 | 1 | 2

export type ArchOpening = { x: number; hw: number; hh: number }

/**
 * Dims Ngọ Môn — mặt bằng chữ U mở Nam (+Z).
 * Số đo công trình chưa có bản vẽ TTBTDT trong research; tag rõ.
 */
export const NGO_MON = {
  /** [ước lượng hợp lý] mặt tiền ~58 m (tư liệu phổ biến 57–58 m). */
  width: 58,
  /** [ước lượng hợp lý] sâu chữ U ~27.5 m. */
  depth: 27.5,
  /** [ước lượng hợp lý] bề dày thanh bắc / cánh. */
  armThickness: 10.2,
  /** [ước lượng hợp lý] cao đài xây tới mặt sàn. */
  bodyHeight: 8.6,
  deckThickness: 0.38,
  /** [ước lượng hợp lý] vòm giữa (lối vua) cao hơn / rộng hơn. */
  openingH: 5.55,
  openingHSide: 5.05,
  openingWRoyal: 4.6,
  openingWSide: 3.5,
  openingSpacing: 8.85,
  /** [ước lượng hợp lý] Lầu Ngũ Phụng. */
  pavilionFloorH: 4.5,
  upperFloorH: 3.65,
  pavilionW: 48,
  pavilionD: 14.2,
} as const

export type NgoMonLayout = {
  barZ: number
  armX: number
  armCenterZ: number
  armLen: number
  courtW: number
  courtD: number
  deckY: number
  barSouthZ: number
  barNorthZ: number
}

export function ngoMonLayout(): NgoMonLayout {
  const { width: W, depth: D, armThickness: A, bodyHeight: H } = NGO_MON
  return {
    barZ: -D / 2 + A / 2,
    armX: W / 2 - A / 2,
    armCenterZ: -D / 2 + A + (D - A) / 2,
    armLen: D - A,
    courtW: W - 2 * A,
    courtD: D - A,
    deckY: H,
    barSouthZ: -D / 2 + A,
    barNorthZ: -D / 2,
  }
}

/** 5 lối — giữa rộng hơn. [ước lượng hợp lý] nhịp. */
export function ngoMonOpenings(): ArchOpening[] {
  const { openingSpacing: s, openingWRoyal, openingWSide, openingH, openingHSide } = NGO_MON
  return [-2, -1, 0, 1, 2].map((i) => ({
    x: i * s,
    hw: (i === 0 ? openingWRoyal : openingWSide) / 2,
    hh: i === 0 ? openingH : openingHSide,
  }))
}

export function meterBox(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  factory: TextureFactoryId,
): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d)
  scaleBoxUvToMeters(g, w, h, d, uvRepeat(factory))
  g.translate(x, y, z)
  return g
}

function worldUv(geo: THREE.BufferGeometry, tileU: number, tileV: number): void {
  const pos = geo.getAttribute('position')
  const uvs = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = pos.getX(i) / tileU
    uvs[i * 2 + 1] = pos.getY(i) / tileV
  }
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  copyUvToUv2(geo)
}

/**
 * Thân tường chữ nhật có lỗ vòm xuyên (không hộp + inset tối).
 * Shape XY, đùn Z, gốc giữa bề dày.
 */
export function extrudeArchWall(
  width: number,
  height: number,
  thickness: number,
  openings: readonly ArchOpening[],
  lod: Lod,
  tile = uvRepeat('gachVo'),
): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  shape.moveTo(-width / 2, 0)
  shape.lineTo(width / 2, 0)
  shape.lineTo(width / 2, height)
  shape.lineTo(-width / 2, height)
  shape.closePath()

  const segs = lod === 0 ? 14 : lod === 1 ? 9 : 5
  for (const o of openings) {
    const left = o.x - o.hw
    const right = o.x + o.hw
    const spring = Math.max(0.4, o.hh - o.hw)
    const hole = new THREE.Path()
    hole.moveTo(left, 0)
    hole.lineTo(left, spring)
    hole.absarc(o.x, spring, o.hw, Math.PI, 0, false)
    hole.lineTo(right, 0)
    hole.lineTo(left, 0)
    shape.holes.push(hole)
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: segs,
    steps: 1,
  })
  geo.translate(0, 0, -thickness / 2)
  worldUv(geo, tile.u, tile.v)
  geo.computeVertexNormals()
  return geo
}

/**
 * Thanh bắc Ngọ Môn: 5 nhịp vòm riêng + trụ đặc.
 * Cấm 1 Extrude 5 lỗ — triangulation dễ ra tam giác lệch phủ nửa màn hình.
 */
export function buildNgoMonBarGeo(lod: Lod): THREE.BufferGeometry | null {
  const { width: W, armThickness: A, bodyHeight: H } = NGO_MON
  const openings = [...ngoMonOpenings()].sort((a, b) => a.x - b.x)
  const jamb = 0.28
  const parts: THREE.BufferGeometry[] = []

  let cursor = -W / 2
  for (const o of openings) {
    const bayW = o.hw * 2 + jamb * 2
    const bayLeft = o.x - bayW / 2
    if (bayLeft - cursor > 0.06) {
      const w = bayLeft - cursor
      parts.push(meterBox(w, H, A, cursor + w / 2, H / 2, 0, 'gachVo'))
    }
    const bay = extrudeArchWall(
      bayW,
      H,
      A,
      [{ x: 0, hw: o.hw, hh: o.hh }],
      lod,
      uvRepeat('gachVo'),
    )
    bay.translate(o.x, 0, 0)
    parts.push(bay)
    cursor = o.x + bayW / 2
  }
  if (W / 2 - cursor > 0.06) {
    const w = W / 2 - cursor
    parts.push(meterBox(w, H, A, cursor + w / 2, H / 2, 0, 'gachVo'))
  }
  return mergeOrNull(parts)
}

/** Vành đá + trụ vòm hai mặt. LOD2 bỏ. */
export function archDressingGeo(
  openings: readonly ArchOpening[],
  thickness: number,
  lod: Lod,
): THREE.BufferGeometry | null {
  if (lod === 2) return null
  const parts: THREE.BufferGeometry[] = []
  const radial = lod === 0 ? 14 : 8
  const tube = lod === 0 ? 0.14 : 0.12
  for (const o of openings) {
    const spring = Math.max(0.4, o.hh - o.hw)
    for (const z of [-thickness / 2 - 0.05, thickness / 2 + 0.05]) {
      const torus = new THREE.TorusGeometry(o.hw, tube, 5, radial, Math.PI)
      torus.translate(o.x, spring, z)
      parts.push(torus)
    }
    for (const sx of [-1, 1] as const) {
      const jamb = new THREE.BoxGeometry(0.24, o.hh * 0.74, thickness + 0.22)
      scaleBoxUvToMeters(jamb, 0.24, o.hh * 0.74, thickness + 0.22, uvRepeat('daThanh'))
      jamb.translate(o.x + sx * (o.hw + 0.1), o.hh * 0.37, 0)
      parts.push(jamb)
    }
    const lintelW = o.hw * 2 + 1.15
    const lintel = new THREE.BoxGeometry(lintelW, 0.42, thickness * 0.55)
    scaleBoxUvToMeters(lintel, lintelW, 0.42, thickness * 0.55, uvRepeat('daThanh'))
    lintel.translate(o.x, o.hh + 0.28, thickness / 2 - 0.15)
    parts.push(lintel)
    const lintelN = new THREE.BoxGeometry(lintelW, 0.42, thickness * 0.55)
    scaleBoxUvToMeters(lintelN, lintelW, 0.42, thickness * 0.55, uvRepeat('daThanh'))
    lintelN.translate(o.x, o.hh + 0.28, -thickness / 2 + 0.15)
    parts.push(lintelN)
  }
  return mergeOrNull(parts)
}

export function mergeOrNull(geos: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  const usable = geos.filter((g) => (g.getAttribute('position')?.count ?? 0) > 0)
  if (usable.length === 0) return null
  if (usable.length === 1) {
    const g = usable[0]
    if (!g.getAttribute('normal')) g.computeVertexNormals()
    copyUvToUv2(g)
    return g
  }
  for (const g of usable) {
    if (!g.getAttribute('normal')) g.computeVertexNormals()
    if (!g.getAttribute('uv')) {
      const n = g.getAttribute('position').count
      g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2))
    }
  }
  const merged = mergeGeometries(usable, false)
  for (const g of usable) g.dispose()
  if (!merged) return null
  merged.computeVertexNormals()
  copyUvToUv2(merged)
  return merged
}

export function estimateTris(root: THREE.Object3D): number {
  let tris = 0
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    const geo = mesh.geometry as THREE.BufferGeometry
    const index = geo.getIndex()
    const pos = geo.getAttribute('position')
    let faceTris = 0
    if (index) faceTris = index.count / 3
    else if (pos) faceTris = pos.count / 3
    const inst = (mesh as THREE.InstancedMesh).isInstancedMesh
      ? (mesh as THREE.InstancedMesh).count
      : 1
    tris += faceTris * inst
  })
  return Math.round(tris)
}

export function countDrawCalls(root: THREE.Object3D): number {
  let n = 0
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh) n += 1
  })
  return n
}
