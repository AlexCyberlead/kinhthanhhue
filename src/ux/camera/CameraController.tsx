import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { OrbitControls, PointerLockControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../../state/appStore'
import { resolveWalkPosition, WALK_EYE_HEIGHT } from './collision'
import {
  buildTourCurve,
  getTourSplineVersion,
  subscribeTourSpline,
} from './tourSpline'
import { useMovementKeys } from './useMovementKeys'

const ORBIT_TARGET: [number, number, number] = [0, 10, 80]
const WALK_SPAWN = new THREE.Vector3(0, WALK_EYE_HEIGHT, 100)
const DRONE_SPAWN = new THREE.Vector3(0, 45, 160)
const TOUR_SPEED = 0.018 // progress units / second (full loop ~55s)
const BOB_AMP = 0.045
const BOB_FREQ = 9

const _fwd = new THREE.Vector3()
const _right = new THREE.Vector3()
const _wish = new THREE.Vector3()
const _look = new THREE.Vector3()
const _tan = new THREE.Vector3()

/** Known POI anchors for optional tour seek when `selectedPoiId` changes. */
const POI_ANCHORS: Record<string, THREE.Vector3> = {
  'ngo-mon': new THREE.Vector3(0, 14, 118),
  'dien-thai-hoa': new THREE.Vector3(0, 11, -48),
  'the-mieu': new THREE.Vector3(-95, 12, -90),
  'san-dai-trieu-nghi': new THREE.Vector3(0, 9, 0),
}

function OrbitMode() {
  return (
    <OrbitControls
      makeDefault
      maxPolarAngle={Math.PI * 0.49}
      minDistance={20}
      maxDistance={2500}
      target={ORBIT_TARGET}
    />
  )
}

function WalkMode() {
  const keys = useMovementKeys(true)
  const bob = useRef(0)
  const { camera } = useThree()

  useEffect(() => {
    camera.position.copy(WALK_SPAWN)
    camera.rotation.set(0, 0, 0)
    camera.up.set(0, 1, 0)
  }, [camera])

  useFrame((_, dt) => {
    const k = keys.current
    camera.getWorldDirection(_fwd)
    _fwd.y = 0
    if (_fwd.lengthSq() < 1e-6) _fwd.set(0, 0, -1)
    _fwd.normalize()
    _right.crossVectors(_fwd, camera.up).normalize()

    _wish.set(0, 0, 0)
    if (k.forward) _wish.add(_fwd)
    if (k.back) _wish.sub(_fwd)
    if (k.right) _wish.add(_right)
    if (k.left) _wish.sub(_right)

    const moving = _wish.lengthSq() > 0
    const speed = (k.sprint ? 9 : 4.5) * Math.min(dt, 0.05)

    let nx = camera.position.x
    let nz = camera.position.z
    if (moving) {
      _wish.normalize().multiplyScalar(speed)
      nx += _wish.x
      nz += _wish.z
      bob.current += dt * BOB_FREQ * (k.sprint ? 1.35 : 1)
    } else {
      bob.current *= 0.9
    }

    const resolved = resolveWalkPosition(camera.position.x, camera.position.z, nx, nz)
    const bobY = moving ? Math.sin(bob.current) * BOB_AMP : 0
    camera.position.set(resolved.x, resolved.y + bobY, resolved.z)
  })

  return <PointerLockControls makeDefault />
}

function DroneMode() {
  const keys = useMovementKeys(true)
  const { camera } = useThree()

  useEffect(() => {
    camera.position.copy(DRONE_SPAWN)
    camera.rotation.set(0, 0, 0)
    camera.up.set(0, 1, 0)
  }, [camera])

  useFrame((_, dt) => {
    const k = keys.current
    camera.getWorldDirection(_fwd)
    if (_fwd.lengthSq() < 1e-6) _fwd.set(0, 0, -1)
    _fwd.normalize()
    _right.crossVectors(_fwd, camera.up).normalize()

    _wish.set(0, 0, 0)
    if (k.forward) _wish.add(_fwd)
    if (k.back) _wish.sub(_fwd)
    if (k.right) _wish.add(_right)
    if (k.left) _wish.sub(_right)
    if (k.up) _wish.y += 1
    if (k.down) _wish.y -= 1

    if (_wish.lengthSq() > 0) {
      const speed = (k.sprint ? 55 : 28) * Math.min(dt, 0.05)
      _wish.normalize().multiplyScalar(speed)
      camera.position.add(_wish)
      // Soft floor — drone may skim but not bury underground
      if (camera.position.y < 2) camera.position.y = 2
      if (camera.position.y > 600) camera.position.y = 600
    }
  })

  return <PointerLockControls makeDefault />
}

function TourMode() {
  const progress = useRef(0)
  const [curveVersion, setCurveVersion] = useState(() => getTourSplineVersion())
  const selectedPoiId = useAppStore((s) => s.selectedPoiId)
  const { camera } = useThree()

  useEffect(() => subscribeTourSpline(() => setCurveVersion(getTourSplineVersion())), [])

  const curve = useMemo(() => buildTourCurve(), [curveVersion])

  // Optional: seek nearest sample when a known POI is selected
  useEffect(() => {
    if (!selectedPoiId) return
    const anchor = POI_ANCHORS[selectedPoiId]
    if (!anchor) return
    let bestT = 0
    let bestD = Infinity
    const samples = 64
    for (let i = 0; i <= samples; i++) {
      const t = i / samples
      const p = curve.getPoint(t)
      const d = p.distanceToSquared(anchor)
      if (d < bestD) {
        bestD = d
        bestT = t
      }
    }
    progress.current = bestT
  }, [selectedPoiId, curve])

  useFrame((_, dt) => {
    progress.current = (progress.current + dt * TOUR_SPEED) % 1
    const t = progress.current
    curve.getPoint(t, camera.position)
    curve.getTangent(t, _tan)
    if (_tan.lengthSq() < 1e-8) _tan.set(0, 0, -1)
    _look.copy(camera.position).add(_tan)
    camera.up.set(0, 1, 0)
    camera.lookAt(_look)
  })

  return null
}

/**
 * R3F camera orchestrator — swaps controls by `useAppStore().cameraMode`.
 * Mode buttons live in HUD (D2) and only mutate the store.
 */
export function CameraController(): JSX.Element {
  const cameraMode = useAppStore((s) => s.cameraMode)
  const { camera } = useThree()

  useEffect(() => {
    // Restore a sane overview pose when returning to orbit
    if (cameraMode === 'orbit') {
      camera.position.set(0, 80, 220)
      camera.up.set(0, 1, 0)
      camera.lookAt(ORBIT_TARGET[0], ORBIT_TARGET[1], ORBIT_TARGET[2])
    }
  }, [cameraMode, camera])

  switch (cameraMode) {
    case 'walk':
      return <WalkMode />
    case 'drone':
      return <DroneMode />
    case 'tour':
      return <TourMode />
    case 'orbit':
    default:
      return <OrbitMode />
  }
}
