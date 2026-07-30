import * as THREE from 'three'

/**
 * Default guided-tour path: Ngọ Môn → Điện Thái Hòa → Thế Miếu.
 * Anchors mirror buildings.json (eye-level + slight lift for cinematic).
 * D4 may replace via {@link setTourSpline}.
 */
const DEFAULT_TOUR_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(0, 12, 140), // approach Ngọ Môn (south)
  new THREE.Vector3(0, 14, 118), // Ngọ Môn
  new THREE.Vector3(0, 10, 55), // Hồ Thái Dịch / thần đạo
  new THREE.Vector3(0, 9, 0), // sân Đại Triều Nghi
  new THREE.Vector3(0, 11, -48), // Điện Thái Hòa
  new THREE.Vector3(-40, 10, -70), // turn west toward miếu
  new THREE.Vector3(-95, 12, -90), // Thế Miếu
]

let tourPoints: THREE.Vector3[] = DEFAULT_TOUR_POINTS.map((p) => p.clone())
let version = 0
const listeners = new Set<() => void>()

function notify() {
  for (const fn of listeners) fn()
}

/** Replace the tour spline control points (D4 / external). */
export function setTourSpline(
  points: ReadonlyArray<THREE.Vector3 | readonly [number, number, number]>,
): void {
  if (points.length < 2) return
  tourPoints = points.map((p) =>
    p instanceof THREE.Vector3
      ? p.clone()
      : new THREE.Vector3(p[0], p[1], p[2]),
  )
  version += 1
  notify()
}

export function getTourSplinePoints(): THREE.Vector3[] {
  return tourPoints.map((p) => p.clone())
}

export function getTourSplineVersion(): number {
  return version
}

export function subscribeTourSpline(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/** Build a closed-open Catmull–Rom curve from current points. */
export function buildTourCurve(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(
    tourPoints.map((p) => p.clone()),
    false,
    'catmullrom',
    0.35,
  )
}
