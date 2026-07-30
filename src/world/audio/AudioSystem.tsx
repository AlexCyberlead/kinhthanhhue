import { useCallback, useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../../state/appStore'
import { WORLD } from '../../data/worldConfig'
import {
  createAmbientBuffer,
  createBellBuffer,
  createBirdBuffer,
  createFootstepBuffer,
  createRainBuffer,
} from './proceduralBuffers'

type SoundKit = {
  listener: THREE.AudioListener
  ambient: THREE.Audio
  rain: THREE.Audio
  footstep: THREE.Audio
  bell: THREE.PositionalAudio
  birds: THREE.PositionalAudio
  group: THREE.Group
}

const BELL_INTERVAL_MS = 14_000
const FOOTSTEP_MIN_INTERVAL = 0.38
const FOOTSTEP_SPEED = 1.2

function attachBuffer(sound: THREE.Audio | THREE.PositionalAudio, buf: AudioBuffer) {
  sound.setBuffer(buf)
}

/**
 * 3D positional audio — procedural buffers only.
 * Lazy-inits AudioContext / AudioListener on first user gesture.
 */
export function AudioSystem() {
  const { camera, scene } = useThree()
  const muted = useAppStore((s) => s.muted)
  const raining = useAppStore((s) => s.raining)
  const cameraMode = useAppStore((s) => s.cameraMode)

  const [ready, setReady] = useState(false)
  const kitRef = useRef<SoundKit | null>(null)
  const lastCam = useRef(new THREE.Vector3())
  const footAcc = useRef(0)
  const bellTimer = useRef(0)

  const tearDown = useCallback(() => {
    const kit = kitRef.current
    if (!kit) return
    ;[kit.ambient, kit.rain, kit.footstep, kit.bell, kit.birds].forEach((s) => {
      if (s.isPlaying) s.stop()
      if (s.parent) s.parent.remove(s)
    })
    scene.remove(kit.group)
    camera.remove(kit.listener)
    kitRef.current = null
  }, [camera, scene])

  const initAudio = useCallback(() => {
    if (kitRef.current) return

    const listener = new THREE.AudioListener()
    camera.add(listener)

    const ctx = listener.context
    void ctx.resume()

    const ambientBuf = createAmbientBuffer(ctx)
    const bellBuf = createBellBuffer(ctx)
    const birdBuf = createBirdBuffer(ctx)
    const rainBuf = createRainBuffer(ctx)
    const stepBuf = createFootstepBuffer(ctx)

    const ambient = new THREE.Audio(listener)
    attachBuffer(ambient, ambientBuf)
    ambient.setLoop(true)
    ambient.setVolume(0.22)

    const rain = new THREE.Audio(listener)
    attachBuffer(rain, rainBuf)
    rain.setLoop(true)
    rain.setVolume(0.35)

    const footstep = new THREE.Audio(listener)
    attachBuffer(footstep, stepBuf)
    footstep.setLoop(false)
    footstep.setVolume(0.45)

    const group = new THREE.Group()
    group.name = 'AudioSources'

    const bell = new THREE.PositionalAudio(listener)
    attachBuffer(bell, bellBuf)
    bell.setRefDistance(40)
    bell.setRolloffFactor(1.2)
    bell.setVolume(0.55)
    bell.setLoop(false)
    const [tx, , tz] = WORLD.landmarks.theToMieu
    bell.position.set(tx, 12, tz)

    const birds = new THREE.PositionalAudio(listener)
    attachBuffer(birds, birdBuf)
    birds.setRefDistance(25)
    birds.setRolloffFactor(1.4)
    birds.setVolume(0.28)
    birds.setLoop(true)
    // Garden / east courtyard birds
    birds.position.set(90, 8, 40)

    group.add(bell)
    group.add(birds)
    scene.add(group)

    const mutedNow = useAppStore.getState().muted
    listener.setMasterVolume(mutedNow ? 0 : 1)

    ambient.play()
    birds.play()
    if (useAppStore.getState().raining) rain.play()

    kitRef.current = { listener, ambient, rain, footstep, bell, birds, group }
    lastCam.current.copy(camera.position)
    setReady(true)
  }, [camera, scene])

  // Lazy unlock on first gesture (autoplay policy)
  useEffect(() => {
    let unlocked = false
    const unlock = () => {
      if (unlocked) return
      unlocked = true
      initAudio()
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      window.removeEventListener('touchstart', unlock)
    }
    window.addEventListener('pointerdown', unlock, { passive: true })
    window.addEventListener('keydown', unlock)
    window.addEventListener('touchstart', unlock, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      window.removeEventListener('touchstart', unlock)
      tearDown()
    }
  }, [initAudio, tearDown])

  // Mute ↔ master volume
  useEffect(() => {
    const kit = kitRef.current
    if (!kit || !ready) return
    kit.listener.setMasterVolume(muted ? 0 : 1)
    void kit.listener.context.resume()
  }, [muted, ready])

  // Rain loop sync
  useEffect(() => {
    const kit = kitRef.current
    if (!kit || !ready) return
    if (raining) {
      if (!kit.rain.isPlaying) kit.rain.play()
    } else if (kit.rain.isPlaying) {
      kit.rain.stop()
    }
  }, [raining, ready])

  useFrame((_, dt) => {
    const kit = kitRef.current
    if (!kit || !ready) return

    // Periodic temple bell
    bellTimer.current += dt
    if (bellTimer.current >= BELL_INTERVAL_MS / 1000) {
      bellTimer.current = 0
      if (kit.bell.isPlaying) kit.bell.stop()
      kit.bell.play()
    }

    // Footsteps when walking / low camera (first-person-ish)
    const pos = camera.position
    const dx = pos.x - lastCam.current.x
    const dz = pos.z - lastCam.current.z
    const speed = Math.hypot(dx, dz) / Math.max(dt, 1e-4)
    lastCam.current.copy(pos)

    const walkish = cameraMode === 'walk' || pos.y < 12
    if (walkish && speed > FOOTSTEP_SPEED) {
      footAcc.current += dt
      if (footAcc.current >= FOOTSTEP_MIN_INTERVAL) {
        footAcc.current = 0
        if (kit.footstep.isPlaying) kit.footstep.stop()
        kit.footstep.setVolume(0.35 + Math.min(0.25, speed * 0.02))
        kit.footstep.play()
      }
    } else {
      footAcc.current = Math.max(0, footAcc.current - dt)
    }
  })

  return null
}
