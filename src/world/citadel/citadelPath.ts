import * as THREE from 'three'
import { CITADEL } from './constants'

export type BastionKind = 'corner' | 'side'

export type BastionSpec = {
  kind: BastionKind
  /** Curtain attachment point (wall centerline) */
  position: THREE.Vector3
  /** Outward horizontal unit normal */
  outward: THREE.Vector3
  /** Along-wall unit (curtain direction) */
  along: THREE.Vector3
}

type Corner = { x: number; z: number }

function corners(): { sw: Corner; se: Corner; ne: Corner; nw: Corner } {
  const hx = CITADEL.width / 2
  const hz = CITADEL.depth / 2
  const cx = CITADEL.centerX
  const cz = CITADEL.centerZ
  return {
    sw: { x: cx - hx, z: cz + hz },
    se: { x: cx + hx, z: cz + hz },
    ne: { x: cx + hx, z: cz - hz },
    nw: { x: cx - hx, z: cz - hz },
  }
}

/** Push a Vauban arrowhead (angular bastion) onto `out`. */
function pushBastion(
  out: THREE.Vector3[],
  center: THREE.Vector3,
  outward: THREE.Vector3,
  along: THREE.Vector3,
  projection: number,
  halfWidth: number,
): void {
  const left = center.clone().addScaledVector(along, -halfWidth)
  const right = center.clone().addScaledVector(along, halfWidth)

  const flankDepth = projection * 0.38
  const faceSpread = halfWidth * 0.72

  const leftFlank = center
    .clone()
    .addScaledVector(outward, flankDepth)
    .addScaledVector(along, -faceSpread)
  const rightFlank = center
    .clone()
    .addScaledVector(outward, flankDepth)
    .addScaledVector(along, faceSpread)
  const tip = center.clone().addScaledVector(outward, projection)

  out.push(left, leftFlank, tip, rightFlank, right)
}

function lerpCorner(a: Corner, b: Corner, t: number): THREE.Vector3 {
  return new THREE.Vector3(a.x + (b.x - a.x) * t, 0, a.z + (b.z - a.z) * t)
}

/**
 * Build closed centerline of Kinh Thành curtain + 24 bastions (CCW from SW).
 * Path is suitable for `buildWall` / extrusions.
 */
export function buildCitadelCenterline(opts?: { bastions?: boolean }): THREE.Vector3[] {
  const withBastions = opts?.bastions !== false
  const c = corners()
  const path: THREE.Vector3[] = []

  /** Sides in CCW order: South(+Z) → East(+X) → North(−Z) → West(−X) */
  const sides: Array<{
    from: Corner
    to: Corner
    outward: THREE.Vector3
    along: THREE.Vector3
  }> = [
    {
      from: c.sw,
      to: c.se,
      outward: new THREE.Vector3(0, 0, 1),
      along: new THREE.Vector3(1, 0, 0),
    },
    {
      from: c.se,
      to: c.ne,
      outward: new THREE.Vector3(1, 0, 0),
      along: new THREE.Vector3(0, 0, -1),
    },
    {
      from: c.ne,
      to: c.nw,
      outward: new THREE.Vector3(0, 0, -1),
      along: new THREE.Vector3(-1, 0, 0),
    },
    {
      from: c.nw,
      to: c.sw,
      outward: new THREE.Vector3(-1, 0, 0),
      along: new THREE.Vector3(0, 0, 1),
    },
  ]

  const nSide = CITADEL.intermediateBastionsPerSide

  for (let s = 0; s < sides.length; s++) {
    const side = sides[s]
    const next = sides[(s + 1) % sides.length]

    // Start of side = previous corner (already emitted as end of prior bastion / start)
    if (s === 0) {
      path.push(new THREE.Vector3(side.from.x, 0, side.from.z))
    }

    if (!withBastions) {
      path.push(new THREE.Vector3(side.to.x, 0, side.to.z))
      continue
    }

    // Intermediate bastions evenly along open curtain (exclude endpoints)
    for (let i = 1; i <= nSide; i++) {
      const t = i / (nSide + 1)
      const p = lerpCorner(side.from, side.to, t)
      pushBastion(
        path,
        p,
        side.outward,
        side.along,
        CITADEL.sideProjection,
        CITADEL.sideHalfWidth,
      )
    }

    // Corner bastion (giác bảo) at end of this side / start of next
    const cornerPt = new THREE.Vector3(side.to.x, 0, side.to.z)
    const cornerOut = side.outward.clone().add(next.outward).normalize()
    // Along for corner: bisector tangent ≈ average of side.along and next.along
    const cornerAlong = side.along.clone().add(next.along).normalize()
    // Prefer wall-bisector perpendicular: use rotate of outward
    const alongCorner = new THREE.Vector3(-cornerOut.z, 0, cornerOut.x)
    // Orient alongCorner roughly with travel direction
    if (alongCorner.dot(cornerAlong) < 0) alongCorner.negate()

    pushBastion(
      path,
      cornerPt,
      cornerOut,
      alongCorner,
      CITADEL.cornerProjection,
      CITADEL.cornerHalfWidth,
    )
  }

  // Close
  if (path.length > 0) {
    const first = path[0]
    const last = path[path.length - 1]
    if (first.distanceToSquared(last) > 1e-4) {
      path.push(first.clone())
    }
  }

  return path
}

/** Bastion attachment specs (24) for tooling / debug. */
export function listBastions(): BastionSpec[] {
  const c = corners()
  const specs: BastionSpec[] = []
  const sides = [
    {
      from: c.sw,
      to: c.se,
      outward: new THREE.Vector3(0, 0, 1),
      along: new THREE.Vector3(1, 0, 0),
    },
    {
      from: c.se,
      to: c.ne,
      outward: new THREE.Vector3(1, 0, 0),
      along: new THREE.Vector3(0, 0, -1),
    },
    {
      from: c.ne,
      to: c.nw,
      outward: new THREE.Vector3(0, 0, -1),
      along: new THREE.Vector3(-1, 0, 0),
    },
    {
      from: c.nw,
      to: c.sw,
      outward: new THREE.Vector3(-1, 0, 0),
      along: new THREE.Vector3(0, 0, 1),
    },
  ]
  const nSide = CITADEL.intermediateBastionsPerSide

  for (let s = 0; s < sides.length; s++) {
    const side = sides[s]
    const next = sides[(s + 1) % sides.length]
    for (let i = 1; i <= nSide; i++) {
      const t = i / (nSide + 1)
      specs.push({
        kind: 'side',
        position: lerpCorner(side.from, side.to, t),
        outward: side.outward.clone(),
        along: side.along.clone(),
      })
    }
    const cornerOut = side.outward.clone().add(next.outward).normalize()
    const alongCorner = new THREE.Vector3(-cornerOut.z, 0, cornerOut.x)
    const travel = side.along.clone().add(next.along).normalize()
    if (alongCorner.dot(travel) < 0) alongCorner.negate()
    specs.push({
      kind: 'corner',
      position: new THREE.Vector3(side.to.x, 0, side.to.z),
      outward: cornerOut,
      along: alongCorner,
    })
  }
  return specs
}

let cachedPath: THREE.Vector3[] | null = null

/**
 * Public path API — centerline of outer Kinh Thành wall with bastions.
 */
export function getCitadelWallPath(): THREE.Vector3[] {
  if (!cachedPath) {
    cachedPath = buildCitadelCenterline({ bastions: true })
  }
  return cachedPath.map((v) => v.clone())
}
