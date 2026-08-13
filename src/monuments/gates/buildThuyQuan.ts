import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'
import { scaleBoxUvToMeters, uvRepeat } from '../../core/geometry/kit/uvMeters'
import { mergeKit, meshOf } from '../../core/geometry/kit/roof/merge'

/**
 * Thủy quan — cống nước xuyên thành, khác cửa bộ (không vọng lâu).
 * [xác thực — Wikipedia] Đông / Tây Thành Thủy Quan trên Ngự Hà.
 * Vòm Hội Điển ~3.825 × 5.185; cao cửa ~8.5. [xác thực — Cố đô Huế]
 */
export function buildThuyQuan(lod: 0 | 1 | 2): THREE.Group {
  const root = new THREE.Group()
  root.name = 'thuy-quan'

  const stone = getMaterial('da_thanh', lod)
  const brick = getMaterial('gach_vo', lod)
  const voi = getMaterial('tuong_voi', lod)

  const w = 18
  const h = 8.5
  const thick = lod === 2 ? 18 : 21.25
  const hw = 2.4
  const culvertH = 4.2

  if (lod === 2) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(w, h, thick), brick)
    mass.position.y = h / 2
    root.add(mass)
    return root
  }

  // Thân thành có lỗ cống (Extrude)
  const shape = new THREE.Shape()
  shape.moveTo(-w / 2, 0)
  shape.lineTo(w / 2, 0)
  shape.lineTo(w / 2, h)
  shape.lineTo(-w / 2, h)
  shape.closePath()

  const segs = lod === 0 ? 10 : 7
  const hole = new THREE.Path()
  hole.moveTo(-hw, 0)
  hole.lineTo(-hw, culvertH - hw)
  hole.absarc(0, culvertH - hw, hw, Math.PI, 0, false)
  hole.lineTo(hw, 0)
  hole.lineTo(-hw, 0)
  shape.holes.push(hole)

  const body = new THREE.ExtrudeGeometry(shape, {
    depth: thick,
    bevelEnabled: false,
    curveSegments: segs,
    steps: 1,
  })
  body.translate(0, 0, -thick / 2)
  const pos = body.getAttribute('position')
  const uvs = new Float32Array(pos.count * 2)
  const tile = uvRepeat('gachVo')
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = pos.getX(i) / tile.u
    uvs[i * 2 + 1] = pos.getY(i) / tile.v
  }
  body.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  body.computeVertexNormals()

  const bodyMesh = new THREE.Mesh(body, brick)
  bodyMesh.castShadow = true
  bodyMesh.receiveShadow = true
  root.add(bodyMesh)

  // Vành đá cống hai mặt
  const ringParts: THREE.BufferGeometry[] = []
  const radial = lod === 0 ? 12 : 8
  for (const z of [-thick / 2 - 0.08, thick / 2 + 0.08]) {
    const torus = new THREE.TorusGeometry(hw, 0.18, 5, radial, Math.PI)
    torus.translate(0, culvertH - hw, z)
    ringParts.push(torus)
    for (const sx of [-1, 1]) {
      const jamb = new THREE.BoxGeometry(0.28, culvertH * 0.7, 0.4)
      jamb.translate(sx * (hw + 0.1), culvertH * 0.35, z)
      ringParts.push(jamb)
    }
  }
  const rings = meshOf(mergeKit(ringParts), stone, 'culvert-rings')
  if (rings) root.add(rings)

  // Mặt nước chảy qua cống
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(hw * 1.7, thick + 4),
    getMaterial('nuoc', lod),
  )
  water.rotation.x = -Math.PI / 2
  water.position.y = 0.12
  water.name = 'culvert-water'
  root.add(water)

  // Đỉnh / parapet vôi
  const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.55, thick + 0.4), voi)
  scaleBoxUvToMeters(cap.geometry, w + 0.6, 0.55, thick + 0.4, uvRepeat('tuongVoi'))
  cap.position.y = h + 0.22
  cap.castShadow = true
  root.add(cap)

  if (lod === 0) {
    const merlonGeo = new THREE.BoxGeometry(1.4, 0.7, 0.45)
    const n = 5
    const merlons = new THREE.InstancedMesh(merlonGeo, stone, n * 2)
    const dummy = new THREE.Object3D()
    let i = 0
    for (const z of [-thick / 2, thick / 2]) {
      for (let k = 0; k < n; k++) {
        const x = -w * 0.38 + k * (w * 0.76) / Math.max(1, n - 1)
        dummy.position.set(x, h + 0.85, z)
        dummy.updateMatrix()
        merlons.setMatrixAt(i++, dummy.matrix)
      }
    }
    merlons.instanceMatrix.needsUpdate = true
    root.add(merlons)
  }

  return root
}
