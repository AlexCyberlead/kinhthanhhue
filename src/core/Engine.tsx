import type { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei'
import * as THREE from 'three'

type EngineProps = {
  children: ReactNode
}

/**
 * Core R3F canvas: ACESFilmic tone mapping, sRGB, soft shadows.
 * Camera looks north (-Z) from south of Ngọ Môn by default.
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
      onCreated={({ gl, scene }) => {
        gl.shadowMap.enabled = true
        gl.shadowMap.type = THREE.PCFSoftShadowMap
        scene.background = new THREE.Color('#87a0b8')
        scene.fog = new THREE.FogExp2('#9bb0c4', 0.00035)
      }}
    >
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#cfe4ff', '#6b5a45', 0.45]} />
      <directionalLight
        castShadow
        intensity={1.35}
        position={[180, 320, 120]}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={1200}
        shadow-camera-left={-400}
        shadow-camera-right={400}
        shadow-camera-top={400}
        shadow-camera-bottom={-400}
        shadow-bias={-0.00015}
      />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      {children}
      <Preload all />
    </Canvas>
  )
}
