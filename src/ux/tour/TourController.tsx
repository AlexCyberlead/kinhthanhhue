import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../../state/appStore'
import { setTourSpline } from '../camera/tourSpline'
import { TOUR_STOPS } from './stops'
import { useTourStore } from './tourStore'
import { speakTourNarration, stopTourSpeech } from './tts'

const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

type CamPose = { pos: THREE.Vector3; look: THREE.Vector3 }

function poseOf(i: number): CamPose {
  const s = TOUR_STOPS[Math.max(0, Math.min(TOUR_STOPS.length - 1, i))]!
  return {
    pos: new THREE.Vector3(s.camera[0], s.camera[1], s.camera[2]),
    look: new THREE.Vector3(s.lookAt[0], s.lookAt[1], s.lookAt[2]),
  }
}

/**
 * R3F tour rig — drives the active camera along {@link TOUR_STOPS}
 * when `cameraMode === 'tour'`. Also pushes control points into D1's
 * {@link setTourSpline} for CameraController compatibility.
 */
export function TourController(): JSX.Element {
  const { camera } = useThree()
  const cameraMode = useAppStore((s) => s.cameraMode)
  const locale = useAppStore((s) => s.locale)
  const muted = useAppStore((s) => s.muted)
  const setSelectedPoiId = useAppStore((s) => s.setSelectedPoiId)

  const fromPoseRef = useRef<CamPose>(poseOf(0))
  const transitKeyRef = useRef<string | null>(null)
  const lastSpokenKeyRef = useRef<string | null>(null)

  useEffect(() => {
    setTourSpline(TOUR_STOPS.map((s) => s.camera))
  }, [])

  useEffect(() => {
    if (cameraMode !== 'tour') {
      stopTourSpeech()
      lastSpokenKeyRef.current = null
      transitKeyRef.current = null
      useTourStore.setState({ playing: false, phase: 'idle' })
      return
    }
    const idx = useTourStore.getState().stopIndex
    const cur = poseOf(idx)
    camera.position.copy(cur.pos)
    camera.lookAt(cur.look)
    fromPoseRef.current = {
      pos: cur.pos.clone(),
      look: cur.look.clone(),
    }
    useTourStore.setState({ phase: 'dwell', transitT: 1, dwellElapsed: 0 })
  }, [cameraMode, camera])

  useEffect(() => {
    if (cameraMode !== 'tour') return

    const speakIfNeeded = (stopIndex: number, phase: string) => {
      if (phase !== 'dwell') return
      if (useAppStore.getState().muted) return
      const loc = useAppStore.getState().locale
      const stop = TOUR_STOPS[stopIndex]!
      const key = `${stopIndex}:${loc}`
      if (lastSpokenKeyRef.current === key) return
      lastSpokenKeyRef.current = key
      speakTourNarration(stop.narration[loc], loc, false)
      if (stop.poiId) setSelectedPoiId(stop.poiId)
    }

    if (muted) {
      stopTourSpeech()
      lastSpokenKeyRef.current = null
    } else {
      const { stopIndex, phase } = useTourStore.getState()
      speakIfNeeded(stopIndex, phase)
    }

    const unsub = useTourStore.subscribe((state, prev) => {
      if (state.phase === 'dwell' && (prev.phase !== 'dwell' || prev.stopIndex !== state.stopIndex)) {
        lastSpokenKeyRef.current = null
        speakIfNeeded(state.stopIndex, state.phase)
      }
    })
    return () => {
      unsub()
      stopTourSpeech()
    }
  }, [cameraMode, locale, muted, setSelectedPoiId])

  useFrame((_, dt) => {
    if (cameraMode !== 'tour') return
    const clampedDt = Math.min(dt, 0.05)
    const store = useTourStore.getState()

    if (store.phase === 'transit') {
      const key = `t-${store.stopIndex}`
      if (transitKeyRef.current !== key) {
        transitKeyRef.current = key
        fromPoseRef.current = {
          pos: camera.position.clone(),
          look: (() => {
            const dir = new THREE.Vector3()
            camera.getWorldDirection(dir)
            return camera.position.clone().add(dir.multiplyScalar(40))
          })(),
        }
      }

      store._tickTransit(clampedDt)
      const t = easeInOutCubic(useTourStore.getState().transitT)
      const target = poseOf(store.stopIndex)
      _pos.lerpVectors(fromPoseRef.current.pos, target.pos, t)
      _look.lerpVectors(fromPoseRef.current.look, target.look, t)
      camera.position.copy(_pos)
      camera.lookAt(_look)
      return
    }

    transitKeyRef.current = null
    const target = poseOf(store.stopIndex)
    camera.position.lerp(target.pos, 1 - Math.exp(-4 * clampedDt))
    camera.lookAt(target.look)
    if (store.phase === 'dwell') store._tickDwell(clampedDt)
  })

  return <group name="tour-controller" />
}
