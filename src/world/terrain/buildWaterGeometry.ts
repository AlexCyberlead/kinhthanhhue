import * as THREE from 'three'
import { citadelOuterSDF, conDaVienMask, conHenMask } from './heightfield'
import { CITADEL, MOAT, RIVER } from './terrainConfig'

export type WaterGeoStats = {
  triangleCount: number
  vertexCount: number
}

/**
 * Merge sông Hương ribbon + hào Hộ Thành ring into one BufferGeometry (1 draw call).
 * Flat water planes at configured Y — banks come from terrain heightfield.
 */
export function buildWaterGeometry(): {
  geometry: THREE.BufferGeometry
  stats: WaterGeoStats
} {
  const pieces: THREE.BufferGeometry[] = [buildRiverSurface(), buildMoatSurface()]
  const geometry = mergeGeometries(pieces)
  for (const p of pieces) p.dispose()

  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  geometry.computeBoundingBox()

  const idx = geometry.index
  const tri = idx ? idx.count / 3 : (geometry.attributes.position.count / 3) | 0
  const stats: WaterGeoStats = {
    vertexCount: geometry.attributes.position.count,
    triangleCount: tri,
  }
  return { geometry, stats }
}

function buildRiverSurface(): THREE.BufferGeometry {
  // Dense enough to cut island holes via discarded verts → use grid + skip island cells
  const segsX = 96
  const segsZ = 24
  const minX = RIVER.minX
  const maxX = RIVER.maxX
  const minZ = RIVER.centerZ - RIVER.halfWidth
  const maxZ = RIVER.centerZ + RIVER.halfWidth
  const y = RIVER.waterY

  const positions: number[] = []
  const indices: number[] = []
  const vertIndex = new Int32Array((segsX + 1) * (segsZ + 1)).fill(-1)

  const key = (ix: number, iz: number) => iz * (segsX + 1) + ix

  for (let iz = 0; iz <= segsZ; iz++) {
    for (let ix = 0; ix <= segsX; ix++) {
      const x = minX + (ix / segsX) * (maxX - minX)
      const z = minZ + (iz / segsZ) * (maxZ - minZ)
      const island = Math.max(conHenMask(x, z), conDaVienMask(x, z))
      if (island > 0.42) continue
      vertIndex[key(ix, iz)] = positions.length / 3
      positions.push(x, y, z)
    }
  }

  for (let iz = 0; iz < segsZ; iz++) {
    for (let ix = 0; ix < segsX; ix++) {
      const a = vertIndex[key(ix, iz)]
      const b = vertIndex[key(ix + 1, iz)]
      const c = vertIndex[key(ix + 1, iz + 1)]
      const d = vertIndex[key(ix, iz + 1)]
      if (a < 0 || b < 0 || c < 0 || d < 0) continue
      indices.push(a, b, d, b, c, d)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  return geo
}

/**
 * Sample moat as a band following citadelOuterSDF with Vauban perimeter.
 * Grid over citadel AABB expanded by moat width.
 */
function buildMoatSurface(): THREE.BufferGeometry {
  const pad = MOAT.inset + MOAT.width + MOAT.bastionDepth + 20
  const minX = CITADEL.minX - pad
  const maxX = CITADEL.maxX + pad
  const minZ = CITADEL.minZ - pad
  const maxZ = CITADEL.maxZ + pad
  const segsX = 120
  const segsZ = 120
  const y = MOAT.waterY

  const positions: number[] = []
  const indices: number[] = []
  const vertIndex = new Int32Array((segsX + 1) * (segsZ + 1)).fill(-1)
  const key = (ix: number, iz: number) => iz * (segsX + 1) + ix

  const inner = MOAT.inset
  const outer = MOAT.inset + MOAT.width

  for (let iz = 0; iz <= segsZ; iz++) {
    for (let ix = 0; ix <= segsX; ix++) {
      const x = minX + (ix / segsX) * (maxX - minX)
      const z = minZ + (iz / segsZ) * (maxZ - minZ)
      const d = citadelOuterSDF(x, z)
      if (d < inner || d > outer) continue
      // Skip where river already covers (south overlap)
      if (Math.abs(z - RIVER.centerZ) < RIVER.halfWidth * 0.85) continue
      vertIndex[key(ix, iz)] = positions.length / 3
      positions.push(x, y, z)
    }
  }

  for (let iz = 0; iz < segsZ; iz++) {
    for (let ix = 0; ix < segsX; ix++) {
      const a = vertIndex[key(ix, iz)]
      const b = vertIndex[key(ix + 1, iz)]
      const c = vertIndex[key(ix + 1, iz + 1)]
      const d = vertIndex[key(ix, iz + 1)]
      if (a < 0 || b < 0 || c < 0 || d < 0) continue
      indices.push(a, b, d, b, c, d)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  return geo
}

function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const positions: number[] = []
  const indices: number[] = []
  let base = 0

  for (const g of geos) {
    const pos = g.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i))
    }
    const idx = g.index
    if (idx) {
      for (let i = 0; i < idx.count; i++) {
        indices.push(idx.getX(i) + base)
      }
    } else {
      for (let i = 0; i < pos.count; i++) {
        indices.push(base + i)
      }
    }
    base += pos.count
  }

  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  out.setIndex(indices)
  return out
}
