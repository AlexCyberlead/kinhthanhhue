import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { createLotusBloomGeometry, createLotusLeafGeometry } from '../vegetation/geometries'
import { HO_THAI_DICH, HO_TINH_TAM } from './waterConfig'

const PETAL = '#F0E2CC'

let bloomMat: THREE.MeshStandardMaterial | null = null

function lotusMats(lod: 0 | 1 | 2) {
  if (!bloomMat) {
    bloomMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.72,
      metalness: 0,
      name: 'lotus-bloom',
    })
  }
  return {
    leaf: getMaterial('co_xanh', lod),
    stem: getMaterial('go_lim', lod),
    bloom: bloomMat,
  }
}

function scatterLotus(
  name: string,
  lod: 0 | 1 | 2,
  count: number,
  pick: (i: number) => { x: number; z: number } | null,
  waterY: number,
  skip: (x: number, z: number) => boolean,
): THREE.Group {
  const root = new THREE.Group()
  root.name = name
  if (lod === 2) return root

  const { leaf, stem, bloom } = lotusMats(lod)
  const segs = lod === 0 ? 12 : 8
  const leafGeo = createLotusLeafGeometry(0.46, segs)
  const stemGeo = new THREE.CylinderGeometry(0.014, 0.02, 0.92, 5)
  const bloomGeo = createLotusBloomGeometry(lod, PETAL)

  const leaves = new THREE.InstancedMesh(leafGeo, leaf, count)
  const stems = new THREE.InstancedMesh(stemGeo, stem, count)
  const blooms = new THREE.InstancedMesh(bloomGeo, bloom, Math.ceil(count * 0.4))
  leaves.name = `${name}-leaves`
  stems.name = `${name}-stems`
  blooms.name = `${name}-blooms`
  leaves.receiveShadow = true
  leaves.castShadow = false
  blooms.castShadow = false

  const dummy = new THREE.Object3D()
  let bloomIdx = 0
  let placed = 0
  for (let i = 0; i < count * 4 && placed < count; i++) {
    const at = pick(i)
    if (!at || skip(at.x, at.z)) continue

    const scale = 0.72 + ((i * 13) % 13) * 0.03
    dummy.position.set(at.x, waterY, at.z)
    dummy.rotation.set(0, (i * 0.55) % Math.PI, 0)
    dummy.scale.set(scale, 1, scale)
    dummy.updateMatrix()
    leaves.setMatrixAt(placed, dummy.matrix)

    dummy.position.set(at.x, waterY + 0.46, at.z)
    dummy.scale.set(1, scale, 1)
    dummy.updateMatrix()
    stems.setMatrixAt(placed, dummy.matrix)

    if (i % 2 === 0 && bloomIdx < blooms.count) {
      dummy.position.set(at.x, waterY + 0.98, at.z)
      dummy.scale.set(scale, scale, scale)
      dummy.updateMatrix()
      blooms.setMatrixAt(bloomIdx++, dummy.matrix)
    }
    placed++
  }

  leaves.count = placed
  stems.count = placed
  blooms.count = bloomIdx
  leaves.instanceMatrix.needsUpdate = true
  stems.instanceMatrix.needsUpdate = true
  blooms.instanceMatrix.needsUpdate = true
  root.add(leaves, stems, blooms)
  return root
}

/**
 * Sen thưa trên Hồ Thái Dịch — InstancedMesh, tránh dải cầu Trung Đạo.
 */
export function buildThaiDichLotus(lod: 0 | 1 | 2): THREE.Group {
  const count = lod === 0 ? 86 : 48
  const [hx, hz] = [HO_THAI_DICH.size[0] * 0.42, HO_THAI_DICH.size[1] * 0.38]
  const [cx, , cz] = HO_THAI_DICH.center
  const waterY = HO_THAI_DICH.center[1] + 0.03
  const bridgeHalf = 6.2

  return scatterLotus(
    'thai-dich-lotus',
    lod,
    count,
    (i) => {
      const a = (i * 2.399963) % (Math.PI * 2)
      const r = Math.sqrt(((i * 0.618033) % 1) * 0.92)
      return { x: cx + Math.cos(a) * r * hx, z: cz + Math.sin(a) * r * hz }
    },
    waterY,
    (x, z) => Math.abs(x) < bridgeHalf || Math.abs(z - cz) > hz * 0.92,
  )
}

/**
 * Sen dày Hồ Tịnh Tâm — tránh 3 đảo.
 */
export function buildTinhTamLotus(lod: 0 | 1 | 2): THREE.Group {
  const count = lod === 0 ? 360 : 220
  const [hx, hz] = [HO_TINH_TAM.size[0] * 0.44, HO_TINH_TAM.size[1] * 0.42]
  const [cx, , cz] = HO_TINH_TAM.center
  const waterY = HO_TINH_TAM.center[1] + 0.03
  const islands: Array<[number, number, number, number]> = [
    [220, -575, 24, 18],
    [285, -655, 16, 13],
    [155, -658, 14, 12],
  ]

  return scatterLotus(
    'tinh-tam-lotus',
    lod,
    count,
    (i) => {
      const a = (i * 2.399963) % (Math.PI * 2)
      const r = Math.sqrt(((i * 0.618033) % 1) * 0.96)
      return { x: cx + Math.cos(a) * r * hx, z: cz + Math.sin(a) * r * hz }
    },
    waterY,
    (x, z) => {
      for (const [ix, iz, iw, id] of islands) {
        if (Math.abs(x - ix) < iw && Math.abs(z - iz) < id) return true
      }
      return false
    },
  )
}
