import * as THREE from 'three'
import { moatWeight, sampleHeight } from './heightfield'
import { splatWeights } from './splatWeights'
import { RIVER, TERRAIN_SIZE } from './terrainConfig'
import { UV_REPEAT_METERS } from '../../core/materials/textures'

export type TerrainGeoStats = {
  segments: number
  vertexCount: number
  triangleCount: number
}

/**
 * Build a single PlaneGeometry-style heightfield in XZ (Y up).
 * Centered on TERRAIN_SIZE, covering TERRAIN_BOUNDS.
 *
 * Vertex color = splat weights (brick, dirt, grass).
 * UV = world metres / grass cycle so the factory maps tile instead of stretching 5 km.
 */
export function buildTerrainGeometry(segments: number): {
  geometry: THREE.BufferGeometry
  stats: TerrainGeoStats
} {
  const width = TERRAIN_SIZE.width
  const depth = TERRAIN_SIZE.depth
  const geo = new THREE.PlaneGeometry(width, depth, segments, segments)
  geo.rotateX(-Math.PI / 2)

  const pos = geo.attributes.position as THREE.BufferAttribute
  const uv = geo.attributes.uv as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)
  const grassCycle = UV_REPEAT_METERS.co.u

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + TERRAIN_SIZE.centerX
    const z = pos.getZ(i) + TERRAIN_SIZE.centerZ
    const y = sampleHeight(x, z)
    pos.setY(i, y)
    pos.setX(i, x)
    pos.setZ(i, z)

    const w = splatWeights(x, z)
    colors[i * 3] = w.brick
    colors[i * 3 + 1] = w.dirt
    colors[i * 3 + 2] = w.grass

    uv.setXY(i, x / grassCycle, z / grassCycle)
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.setAttribute('uv2', uv.clone())
  geo.computeVertexNormals()
  geo.computeBoundingSphere()
  geo.computeBoundingBox()

  const stats: TerrainGeoStats = {
    segments,
    vertexCount: pos.count,
    triangleCount: segments * segments * 2,
  }

  return { geometry: geo, stats }
}

/** Kept for debug / older callers that still want a river-bank scalar. */
export function riverBankWeight(_x: number, z: number): number {
  const riverProx = Math.abs(z - RIVER.centerZ)
  return THREE.MathUtils.clamp(1 - Math.abs(riverProx - RIVER.halfWidth) / RIVER.bankWidth, 0, 1)
}

export function moatLipWeight(x: number, z: number): number {
  return moatWeight(x, z)
}
