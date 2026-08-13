import * as THREE from 'three'
import { copyUvToUv2 } from '../uvMeters'
import { sampleRoof, segsFor, type RoofFrame } from './math'

/** Thân mái tứ thủy — heightfield hip + ức + đầu đao. LOD2 = wedge đặc. */
export function buildRoofBody(f: RoofFrame, tileU: number, tileV: number): THREE.BufferGeometry {
  if (f.lod === 2) return buildWedge(f, tileU, tileV)
  return buildSurface(f, tileU, tileV)
}

function buildSurface(f: RoofFrame, tileU: number, tileV: number): THREE.BufferGeometry {
  const segsW = segsFor(f.halfW, f.lod)
  const segsD = segsFor(f.halfD, f.lod)
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let iz = 0; iz <= segsD; iz++) {
    const vz = iz / segsD
    const z = -f.halfD + vz * f.halfD * 2
    for (let ix = 0; ix <= segsW; ix++) {
      const vx = ix / segsW
      const x = -f.halfW + vx * f.halfW * 2
      const p = sampleRoof(x, z, f, tileU, tileV)
      positions.push(p.x, p.y, p.z)
      uvs.push(p.u, p.v)
    }
  }

  const stride = segsW + 1
  for (let iz = 0; iz < segsD; iz++) {
    for (let ix = 0; ix < segsW; ix++) {
      const a = iz * stride + ix
      const b = a + 1
      const c = a + stride
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

/** Silhouette hip đặc — 2 đỉnh sống + 4 góc + đáy. [ước lượng hợp lý] */
function buildWedge(f: RoofFrame, tileU: number, tileV: number): THREE.BufferGeometry {
  const lift = 0.08 * f.rise * f.curvature
  const hw = f.halfW
  const hd = f.halfD
  const rh = f.ridgeHalf
  const yR = f.rise

  type V = [number, number, number]
  const corners: V[] = [
    [-hw, lift, -hd],
    [hw, lift, -hd],
    [hw, lift, hd],
    [-hw, lift, hd],
  ]
  const ridge: V[] = f.ridgeAlongX
    ? [
        [-rh, yR, 0],
        [rh, yR, 0],
      ]
    : [
        [0, yR, -rh],
        [0, yR, rh],
      ]

  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  const push = (px: number, py: number, pz: number, u: number, v: number) => {
    positions.push(px, py, pz)
    uvs.push(u / tileU, v / tileV)
  }

  const quad = (a: V, b: V, c: V, d: V, u0: number, v0: number, u1: number, v1: number) => {
    const o = positions.length / 3
    push(a[0], a[1], a[2], u0, v0)
    push(b[0], b[1], b[2], u1, v0)
    push(c[0], c[1], c[2], u1, v1)
    push(d[0], d[1], d[2], u0, v1)
    indices.push(o, o + 1, o + 2, o, o + 2, o + 3)
  }

  const tri = (a: V, b: V, c: V, u0: number, v0: number, u1: number, v1: number) => {
    const o = positions.length / 3
    push(a[0], a[1], a[2], u0, v0)
    push(b[0], b[1], b[2], u1, v0)
    push(c[0], c[1], c[2], (u0 + u1) * 0.5, v1)
    indices.push(o, o + 1, o + 2)
  }

  if (f.ridgeAlongX) {
    quad(corners[0], corners[1], ridge[1], ridge[0], -hw, -hd, hw, 0)
    quad(corners[3], ridge[0], ridge[1], corners[2], -hw, hd, hw, 0)
    tri(ridge[1], corners[1], corners[2], rh, -hd, hw, hd)
    tri(ridge[0], corners[3], corners[0], -rh, hd, -hw, -hd)
  } else {
    quad(corners[0], ridge[0], ridge[1], corners[3], -hw, -hd, 0, hd)
    quad(corners[1], corners[2], ridge[1], ridge[0], hw, -hd, 0, hd)
    tri(ridge[0], corners[0], corners[1], 0, -rh, hw, -hd)
    tri(ridge[1], corners[2], corners[3], 0, rh, -hw, hd)
  }
  // underside so LOD2 massing is solid
  quad(corners[0], corners[3], corners[2], corners[1], -hw, -hd, hw, hd)

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  copyUvToUv2(geo)
  return geo
}
