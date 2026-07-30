import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { buildColumnGrid } from '../../core/geometry/kit/buildColumnGrid'

export type InteriorDims = {
  hallW: number
  hallD: number
  floorY: number
  colH: number
}

/**
 * Nội thất Duyệt Thị Đường — LOD0 only.
 * Sân khấu giữa, hậu trường, đài ngự tọa 2 bậc (tây), ghế quan hai bên, cột nội.
 */
export function buildInterior(dims: InteriorDims): THREE.Group {
  const { hallW, hallD, floorY, colH } = dims
  const g = new THREE.Group()
  g.name = 'interior'

  const wood = getMaterial('go_lim', 0)
  const son = getMaterial('go_son_son', 0)
  const gold = getMaterial('vang_thep', 0)
  const plaster = getMaterial('tuong_voi', 0)
  const lam = getMaterial('phap_lam', 0)
  const brick = getMaterial('gach_bat_trang', 0)

  // Sàn gỗ khán giả
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(hallW - 1.4, 0.1, hallD - 1.2),
    wood,
  )
  floor.position.set(0, floorY + 0.06, 0)
  floor.receiveShadow = true
  g.add(floor)

  // —— Sân khấu giữa (3 mặt mở) ——
  const stageW = 7.2
  const stageD = 6.0
  const stageH = 0.55
  const stageZ = 1.2

  const stage = new THREE.Mesh(new THREE.BoxGeometry(stageW, stageH, stageD), wood)
  stage.position.set(0, floorY + stageH / 2 + 0.1, stageZ)
  stage.castShadow = true
  stage.receiveShadow = true
  g.add(stage)

  // Viền sân khấu son
  const stageTrim = new THREE.Mesh(
    new THREE.BoxGeometry(stageW + 0.2, 0.08, stageD + 0.2),
    son,
  )
  stageTrim.position.set(0, floorY + stageH + 0.12, stageZ)
  g.add(stageTrim)

  // Cột góc sân khấu (4) — Instanced
  {
    const geo = new THREE.CylinderGeometry(0.14, 0.16, 3.2, 8)
    const posts = new THREE.InstancedMesh(geo, son, 4)
    posts.name = 'stagePosts'
    posts.castShadow = true
    const dummy = new THREE.Object3D()
    let i = 0
    for (const x of [-stageW / 2 + 0.25, stageW / 2 - 0.25]) {
      for (const z of [-stageD / 2 + 0.25, stageD / 2 - 0.25]) {
        dummy.position.set(x, floorY + stageH + 1.7, stageZ + z)
        dummy.updateMatrix()
        posts.setMatrixAt(i++, dummy.matrix)
      }
    }
    posts.instanceMatrix.needsUpdate = true
    g.add(posts)
  }

  // Khung phông sân khấu + pháp lam panel
  const backdropY = floorY + stageH + 2.4
  const backdrop = new THREE.Mesh(new THREE.BoxGeometry(stageW * 0.95, 3.6, 0.12), plaster)
  backdrop.position.set(0, backdropY, stageZ - stageD / 2 + 0.1)
  g.add(backdrop)

  const lamPanel = new THREE.Mesh(new THREE.BoxGeometry(stageW * 0.7, 1.4, 0.08), lam)
  lamPanel.position.set(0, backdropY + 0.4, stageZ - stageD / 2 + 0.18)
  g.add(lamPanel)

  // Mái che sân khấu nhỏ (gold frame)
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(stageW * 1.05, 0.1, stageD * 0.55), gold)
  canopy.position.set(0, floorY + stageH + 3.5, stageZ - 0.4)
  g.add(canopy)

  // —— Hậu trường (đông / +Z phía sau sân khấu) ——
  const backZ = stageZ - stageD / 2 - 2.4
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(stageW + 1.5, 4.2, 0.28), plaster)
  backWall.position.set(0, floorY + 2.2, backZ)
  backWall.castShadow = true
  g.add(backWall)

  // Hai cửa vào/ra diễn viên
  const doorGeo = new THREE.BoxGeometry(1.1, 2.4, 0.1)
  for (const x of [-1.8, 1.8]) {
    const door = new THREE.Mesh(doorGeo, son)
    door.position.set(x, floorY + 1.3, backZ + 0.12)
    g.add(door)
  }

  // Phòng đạo cụ / khám tổ sư (khối đơn giản phía sau tường)
  const propRoom = new THREE.Mesh(new THREE.BoxGeometry(stageW + 0.8, 3.6, 2.8), plaster)
  propRoom.position.set(0, floorY + 1.9, backZ - 1.6)
  g.add(propRoom)

  const altar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 0.7), gold)
  altar.position.set(0, floorY + 1.0, backZ - 1.6)
  g.add(altar)

  // —— Đài ngự tọa 2 bậc (phía tây / -Z, đối diện sân khấu) ——
  const galleryZ = -hallD * 0.28
  // Bậc thấp — ngự tọa vua
  const tier1 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.7, 3.2), brick)
  tier1.position.set(0, floorY + 0.45, galleryZ)
  tier1.receiveShadow = true
  g.add(tier1)

  // Bậc cao — cung tần (có sáo trúc stylized = thin screen)
  const tier2 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.55, 2.4), brick)
  tier2.position.set(0, floorY + 1.05, galleryZ - 1.4)
  g.add(tier2)

  const throne = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 1.1), gold)
  throne.position.set(0, floorY + 0.95, galleryZ + 0.3)
  g.add(throne)

  const throneBack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.5, 0.12), gold)
  throneBack.position.set(0, floorY + 1.7, galleryZ - 0.3)
  g.add(throneBack)

  // Vòm ngự tọa (arch stylized)
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(1.1, 0.1, 6, 12, Math.PI),
    gold,
  )
  arch.rotation.z = Math.PI
  arch.position.set(0, floorY + 2.6, galleryZ - 0.35)
  g.add(arch)

  // Sáo trúc thưa (screen) — thin wood strips Instanced
  {
    const stripGeo = new THREE.BoxGeometry(0.04, 2.0, 0.04)
    const count = 18
    const screen = new THREE.InstancedMesh(stripGeo, wood, count)
    screen.name = 'bambooScreen'
    const dummy = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      const x = -2.4 + (i / (count - 1)) * 4.8
      dummy.position.set(x, floorY + 2.2, galleryZ - 0.15)
      dummy.updateMatrix()
      screen.setMatrixAt(i, dummy.matrix)
    }
    screen.instanceMatrix.needsUpdate = true
    g.add(screen)
  }

  // Lan can đài
  const rail = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.12, 0.1), son)
  rail.position.set(0, floorY + 1.45, galleryZ + 1.5)
  g.add(rail)

  // —— Ghế quan hai bên sân khấu (Instanced benches) ——
  {
    const benchGeo = new THREE.BoxGeometry(2.4, 0.35, 0.55)
    const count = 12
    const benches = new THREE.InstancedMesh(benchGeo, wood, count)
    benches.name = 'sideBenches'
    benches.castShadow = true
    const dummy = new THREE.Object3D()
    let i = 0
    for (const side of [-1, 1]) {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
          dummy.position.set(
            side * (stageW / 2 + 1.6 + col * 2.6),
            floorY + 0.35,
            stageZ - 1.5 + row * 1.4,
          )
          dummy.rotation.y = side > 0 ? -0.15 : 0.15
          dummy.updateMatrix()
          benches.setMatrixAt(i++, dummy.matrix)
        }
      }
    }
    benches.instanceMatrix.needsUpdate = true
    g.add(benches)
  }

  // —— Cột nội thất 2 hàng (lim sơn son ~12 m visual truncated to hall) ——
  const innerH = Math.min(colH - 0.4, 10.5)
  const innerCols = buildColumnGrid({
    rows: 2,
    cols: 6,
    spacing: [3.6, 8.5] as [number, number],
    height: innerH,
    radius: 0.28,
    material: 'go_son_son',
    lod: 0,
  })
  innerCols.position.y = floorY
  innerCols.name = 'interiorColumns'
  g.add(innerCols)

  // —— Trần xanh lơ stylized + tinh tú (pháp lam discs) ——
  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(hallW - 2.2, 0.12, hallD - 2.0),
    lam,
  )
  ceiling.position.set(0, floorY + colH - 0.35, 0)
  g.add(ceiling)

  {
    const starGeo = new THREE.SphereGeometry(0.12, 6, 4)
    const stars = new THREE.InstancedMesh(starGeo, gold, 9)
    stars.name = 'ceilingStars'
    const dummy = new THREE.Object3D()
    let i = 0
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        dummy.position.set(-4 + col * 4, floorY + colH - 0.45, -3 + row * 3)
        dummy.updateMatrix()
        stars.setMatrixAt(i++, dummy.matrix)
      }
    }
    stars.instanceMatrix.needsUpdate = true
    g.add(stars)
  }

  // Dầm ngang dưới trần
  const beam = new THREE.Mesh(new THREE.BoxGeometry(hallW - 1.5, 0.28, 0.35), wood)
  for (const z of [-hallD * 0.22, 0, hallD * 0.22]) {
    const b = beam.clone()
    b.position.set(0, floorY + colH - 0.55, z)
    g.add(b)
  }

  return g
}
