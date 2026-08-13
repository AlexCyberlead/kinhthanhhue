import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildRoof } from '../../core/geometry/kit/buildRoof'
import { buildPlatform } from '../../core/geometry/kit/buildPlatform'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'
import { buildGate } from '../../core/geometry/kit/buildGate'

export type DaiCungMonBuildOpts = {
  lod: 0 | 1 | 2
  /** Chiều ngang thân cửa (m). */
  width?: number
  /** Chiều cao thân (m). */
  height?: number
}

/**
 * Đại Cung Môn — cổng gỗ chính Nam Tử Cấm (1833, phá 1947).
 * Thân kit buildGate (tam-quan) + cửa gỗ + mái hoàng lưu ly + vọng lâu nhẹ.
 * LOD1 target ≤ 15 draw calls. Không box-only.
 */
export function buildDaiCungMon(opts: DaiCungMonBuildOpts): THREE.Group {
  const { lod, width = 20, height = 7.2 } = opts
  const group = new THREE.Group()
  group.name = 'dai-cung-mon'

  // Nền đá trước cổng
  const platform = buildPlatform({
    width: width * 1.15,
    depth: lod === 2 ? 6 : 8,
    steps: lod === 0 ? 3 : lod === 1 ? 2 : 1,
    balustrade: lod === 0,
    height: lod === 2 ? 0.55 : 0.85,
    lod,
  })
  group.add(platform)

  const deckY = lod === 2 ? 0.55 : 0.85

  // Thân tam-quan kit — gỡ mái mặc định để gắn mái hoàng lưu ly
  const base = buildGate({ type: 'tam-quan', lod, width, height })
  stripKitRoof(base)
  tintGateWood(base, lod)
  base.position.y = deckY
  group.add(base)

  // Cánh cửa gỗ (3 khoang) — đọc được là cổng gỗ, không chỉ pier
  if (lod < 2) {
    const doors = buildDoorPanels(width, height, lod)
    doors.position.y = deckY
    group.add(doors)
  }

  // Vọng lâu / lầu cửa — cột + mái hoàng lưu ly
  const pavilion = buildGatePavilion({
    lod,
    width: Math.min(width * 0.78, 15),
    depth: lod === 2 ? 5 : 6.2,
  })
  // lintel kit ngồi ~height+0.4 → deck vọng lâu
  pavilion.position.y = deckY + height + 1.15
  group.add(pavilion)

  return group
}

function stripKitRoof(gate: THREE.Group): void {
  const roofs = gate.children.filter((c) => c.name === 'roof')
  for (const r of roofs) gate.remove(r)
}

/** Đổi pier/lintel sang gỗ son — Đại Cung là cổng gỗ, không tường vôi. */
function tintGateWood(gate: THREE.Group, lod: 0 | 1 | 2): void {
  const wood = getMaterial('go_son_son', lod)
  const stone = getMaterial('da_thanh', lod)
  gate.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    // pier = tuong_voi → gỗ; lintel giữ đá / chuyển gỗ đậm
    const mat = mesh.material as THREE.Material
    const name = (mat as THREE.Material & { name?: string }).name ?? ''
    if (name.includes('tuong') || name.includes('voi')) {
      mesh.material = wood
    } else if (name.includes('da') || name.includes('stone')) {
      mesh.material = stone
    } else {
      // fallback: pier-like boxes → wood
      mesh.material = wood
    }
  })
}

/**
 * 3 cánh cửa gỗ InstancedMesh (1 DC) + khung ngang (1 DC).
 */
function buildDoorPanels(width: number, height: number, lod: 0 | 1 | 2): THREE.Group {
  const g = new THREE.Group()
  g.name = 'doors'

  const wood = getMaterial('go_lim', lod)
  const lacquer = getMaterial('go_son_son', lod)
  const panelW = width * 0.22
  const panelH = height * 0.72
  const panelD = 0.18
  const geo = new THREE.BoxGeometry(panelW, panelH, panelD)
  const doors = new THREE.InstancedMesh(geo, wood, 3)
  doors.name = 'door-panels'
  doors.castShadow = true

  const dummy = new THREE.Object3D()
  const xs = [-width * 0.4, 0, width * 0.4]
  xs.forEach((x, i) => {
    dummy.position.set(x, panelH / 2 + 0.35, 1.35)
    dummy.updateMatrix()
    doors.setMatrixAt(i, dummy.matrix)
  })
  doors.instanceMatrix.needsUpdate = true
  g.add(doors)

  // thanh ngang trang trí (LOD0 thêm 1 DC)
  if (lod === 0) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.92, 0.22, 0.28),
      lacquer,
    )
    rail.position.set(0, height * 0.55, 1.45)
    rail.castShadow = true
    g.add(rail)
  }

  return g
}

/**
 * Lầu cửa: platform mỏng + cột InstancedMesh + mái hoàng lưu ly.
 * LOD1: platform(deck+1step)≈2 + cols=1 + roof(tile+ridge+eave)=3 → ~6 DC.
 */
function buildGatePavilion(opts: {
  lod: 0 | 1 | 2
  width: number
  depth: number
}): THREE.Group {
  const { lod, width, depth } = opts
  const g = new THREE.Group()
  g.name = 'vong-lau'

  const deckH = lod === 2 ? 0.4 : 0.65
  const platform = buildPlatform({
    width: width * 1.02,
    depth: depth * 1.02,
    steps: lod === 0 ? 1 : 0,
    balustrade: false,
    height: deckH,
    lod,
  })
  // steps=0 vẫn có deck; nếu kit luôn thêm steps tối thiểu — giữ 1 step LOD0 only
  g.add(platform)

  const colH = lod === 2 ? 3.2 : 4.2
  if (lod < 2) {
    const cols = buildColumnGrid({
      rows: 2,
      cols: lod === 0 ? 4 : 3,
      spacing: [width / (lod === 0 ? 3.2 : 2.4), depth * 0.5],
      height: colH,
      radius: 0.18,
      material: 'go_son_son',
      lod,
    })
    cols.position.y = deckH
    g.add(cols)
  } else {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.6, colH, depth * 0.45),
      getMaterial('go_son_son', lod),
    )
    body.position.y = deckH + colH / 2
    g.add(body)
  }

  const roof = buildRoof({
    width: width * 1.14,
    depth: depth * 1.18,
    tiers: lod === 0 ? 2 : 1,
    tileMaterial: 'ngoi_hoang_luu_ly',
    ridge: lod < 2 ? 'long-chau-nhat' : 'none',
    lod,
  })
  roof.position.y = deckH + colH + (lod === 2 ? 0.06 : 0.12)
  g.add(roof)

  return g
}

/** Mesh count ≈ draw calls. */
export function countDaiCungMonDrawCalls(group: THREE.Object3D): number {
  let n = 0
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) n += 1
  })
  return n
}
