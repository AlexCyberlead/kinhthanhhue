import * as THREE from 'three'
import { getMaterial, type MaterialId } from '../../materials/MaterialLibrary'
import { copyUvToUv2, scaleBoxUvToMeters, uvRepeat } from './uvMeters'

export type RoofOpts = {
  width: number
  depth: number
  tiers: number
  curvature?: number
  tileMaterial?: MaterialId
  ridgeOrnament?: 'dragon' | 'phoenix' | 'none'
  lod?: 0 | 1 | 2
}

function curvedRoofShape(halfW: number, halfD: number, rise: number, curvature: number): THREE.BufferGeometry {
  const segments = 8
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const tile = uvRepeat('ngoiMenVang')

  for (let iz = 0; iz <= segments; iz++) {
    const vz = iz / segments
    const z = -halfD + vz * halfD * 2
    for (let ix = 0; ix <= segments; ix++) {
      const vx = ix / segments
      const x = -halfW + vx * halfW * 2
      const edge = Math.max(Math.abs(vx * 2 - 1), Math.abs(vz * 2 - 1))
      const y = rise * (1 - Math.pow(edge, 1 + curvature * 0.8))
      // tip eave upturn
      const eave = Math.max(0, edge - 0.75) / 0.25
      positions.push(x, y + eave * rise * 0.12 * curvature, z)
      uvs.push(x / tile.u, z / tile.v)
    }
  }

  for (let iz = 0; iz < segments; iz++) {
    for (let ix = 0; ix < segments; ix++) {
      const a = iz * (segments + 1) + ix
      const b = a + 1
      const c = a + (segments + 1)
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  copyUvToUv2(geo)
  return geo
}

function makeOrnament(kind: 'dragon' | 'phoenix', scale: number): THREE.Group {
  const g = new THREE.Group()
  const mat = getMaterial('vang_thep')
  if (kind === 'dragon') {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.18 * scale, 1.2 * scale, 4, 8), mat)
    body.rotation.z = Math.PI / 2
    body.position.y = 0.2 * scale
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22 * scale, 8, 8), mat)
    head.position.set(0.75 * scale, 0.35 * scale, 0)
    g.add(body, head)
  } else {
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.35 * scale, 0.9 * scale, 6), mat)
    body.position.y = 0.45 * scale
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.1 * scale, 0.05 * scale, 0.35 * scale), mat)
    wing.position.y = 0.5 * scale
    g.add(body, wing)
  }
  return g
}

/**
 * Multi-tier curved Vietnamese palace roof (trùng thiềm stylized).
 */
export function buildRoof(opts: RoofOpts): THREE.Group {
  const {
    width,
    depth,
    tiers,
    curvature = 0.85,
    tileMaterial = 'ngoi_hoang_luu_ly',
    ridgeOrnament = 'none',
    lod = 0,
  } = opts

  const group = new THREE.Group()
  group.name = 'roof'
  const mat = getMaterial(tileMaterial, lod)
  const wood = getMaterial('go_lim', lod)
  const safeTiers = Math.max(1, Math.min(4, Math.floor(tiers)))

  for (let t = 0; t < safeTiers; t++) {
    const scale = 1 - t * 0.14
    const w = width * scale
    const d = depth * scale
    const yBase = t * (lod === 2 ? 1.2 : 1.55)
    const rise = lod === 2 ? 1.0 : 1.6 + (1 - scale) * 0.4

    if (lod === 2) {
      const boxGeo = new THREE.BoxGeometry(w, rise, d)
      scaleBoxUvToMeters(boxGeo, w, rise, d, uvRepeat('ngoiMenVang'))
      const box = new THREE.Mesh(boxGeo, mat)
      box.position.y = yBase + rise * 0.5
      box.castShadow = true
      group.add(box)
    } else {
      const geo = curvedRoofShape(w * 0.5, d * 0.5, rise, curvature)
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.y = yBase
      mesh.castShadow = true
      mesh.receiveShadow = true
      group.add(mesh)

      // ridge beam
      const ridgeW = w * 0.15
      const ridgeGeo = new THREE.BoxGeometry(ridgeW, 0.18, d * 0.08)
      scaleBoxUvToMeters(ridgeGeo, ridgeW, 0.18, d * 0.08, uvRepeat('vangThep'))
      const ridge = new THREE.Mesh(ridgeGeo, getMaterial('vang_thep', lod))
      ridge.position.y = yBase + rise + 0.1
      group.add(ridge)
    }

    // eaves board
    if (lod < 2) {
      const eaveW = w * 1.02
      const eaveD = d * 1.02
      const eaveGeo = new THREE.BoxGeometry(eaveW, 0.12, eaveD)
      scaleBoxUvToMeters(eaveGeo, eaveW, 0.12, eaveD, uvRepeat('goLim'))
      const eave = new THREE.Mesh(eaveGeo, wood)
      eave.position.y = yBase + 0.05
      group.add(eave)
    }
  }

  if (ridgeOrnament !== 'none' && lod === 0) {
    const topY = safeTiers * 1.55 + 1.2
    const left = makeOrnament(ridgeOrnament, Math.min(width, depth) * 0.08)
    left.position.set(-width * 0.28, topY, 0)
    const right = makeOrnament(ridgeOrnament, Math.min(width, depth) * 0.08)
    right.position.set(width * 0.28, topY, 0)
    right.rotation.y = Math.PI
    group.add(left, right)
  }

  return group
}
