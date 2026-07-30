import * as THREE from 'three'
import { moatWeight, sampleHeight } from './heightfield'
import { RIVER, TERRAIN_SIZE } from './terrainConfig'

export type TerrainGeoStats = {
  segments: number
  vertexCount: number
  triangleCount: number
}

/**
 * Build a single PlaneGeometry-style heightfield in XZ (Y up).
 * Centered on TERRAIN_SIZE, covering TERRAIN_BOUNDS.
 */
export function buildTerrainGeometry(segments: number): {
  geometry: THREE.BufferGeometry
  stats: TerrainGeoStats
} {
  const width = TERRAIN_SIZE.width
  const depth = TERRAIN_SIZE.depth
  const geo = new THREE.PlaneGeometry(width, depth, segments, segments)
  // PlaneGeometry is XY; rotate to XZ
  geo.rotateX(-Math.PI / 2)

  const pos = geo.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)

  // Vertex tint: grass → dirt (banks) → stone (moat lip) — matches MaterialLibrary HEX
  const grass = new THREE.Color('#4F6B3C')
  const dirt = new THREE.Color('#7A6A52')
  const stone = new THREE.Color('#6E6E68')
  const tmp = new THREE.Color()

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + TERRAIN_SIZE.centerX
    const z = pos.getZ(i) + TERRAIN_SIZE.centerZ
    const y = sampleHeight(x, z)
    pos.setY(i, y)

    const riverProx = Math.abs(z - RIVER.centerZ)
    const riverBank = THREE.MathUtils.clamp(
      1 - Math.abs(riverProx - RIVER.halfWidth) / RIVER.bankWidth,
      0,
      1,
    )
    const moatLip = moatWeight(x, z)
    tmp.copy(grass).lerp(dirt, riverBank * 0.7).lerp(stone, Math.min(1, moatLip * 1.2) * 0.55)
    colors[i * 3] = tmp.r
    colors[i * 3 + 1] = tmp.g
    colors[i * 3 + 2] = tmp.b

    pos.setX(i, x)
    pos.setZ(i, z)
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
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
