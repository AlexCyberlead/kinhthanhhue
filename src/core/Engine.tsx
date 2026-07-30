import type { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei'
import * as THREE from 'three'

type EngineProps = {
  children: ReactNode
}

/**
 * Core R3F canvas: ACESFilmic tone mapping, sRGB, soft shadows.
 * Lighting comes from SkySystem (Celestial) — no fixed lights here.
 */
export function Engine({ children }: EngineProps) {
  return (
    <Canvas
      className="h-full w-full"
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{
        fov: 50,
        near: 0.5,
        far: 8000,
        position: [0, 80, 220],
      }}
      onCreated={(state) => {
        const { gl, scene } = state
        if (import.meta.env.DEV) {
          ;(window as unknown as Record<string, unknown>).__r3f = state
        }
        gl.shadowMap.enabled = true
        gl.shadowMap.type = THREE.PCFSoftShadowMap
        // Fallback until SkySystem mounts; sky syncs fog/background via lights frame
        scene.background = new THREE.Color('#87a0b8')
        scene.fog = new THREE.FogExp2('#9bb0c4', 0.00035)
      }}
    >
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      {children}
      <Preload all />
    </Canvas>
  )
}
