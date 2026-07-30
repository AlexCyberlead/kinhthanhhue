import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SkyPalette } from './skyMath'

const CELESTIAL_RADIUS = 3800
const DISC_SIZE = 90

type Props = {
  sunDir: THREE.Vector3
  moonDir: THREE.Vector3
  palette: SkyPalette
  day: number
}

/**
 * Single InstancedMesh (2 instances) for sun + moon discs — 1 draw call.
 * Directional + ambient + hemisphere lights synced to timeOfDay.
 */
export function Celestial({ sunDir, moonDir, palette, day }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const sunLightRef = useRef<THREE.DirectionalLight>(null)
  const moonLightRef = useRef<THREE.DirectionalLight>(null)
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const hemiRef = useRef<THREE.HemisphereLight>(null)

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colorAttr = useMemo(
    () => new THREE.InstancedBufferAttribute(new Float32Array(2 * 3), 3),
    [],
  )

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    mesh.instanceColor = colorAttr
  }, [colorAttr])

  useFrame(({ scene, gl }) => {
    const mesh = meshRef.current
    if (mesh) {
      // Sun
      dummy.position.copy(sunDir).multiplyScalar(CELESTIAL_RADIUS)
      const sunScale = THREE.MathUtils.lerp(0.35, 1.15, day)
      dummy.scale.setScalar(DISC_SIZE * sunScale)
      dummy.lookAt(0, 0, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(0, dummy.matrix)

      // Moon
      dummy.position.copy(moonDir).multiplyScalar(CELESTIAL_RADIUS)
      const moonScale = THREE.MathUtils.lerp(1.0, 0.4, day)
      dummy.scale.setScalar(DISC_SIZE * 0.72 * moonScale)
      dummy.lookAt(0, 0, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(1, dummy.matrix)
      mesh.instanceMatrix.needsUpdate = true

      const c = colorAttr.array as Float32Array
      c[0] = palette.sunColor.r
      c[1] = palette.sunColor.g
      c[2] = palette.sunColor.b
      c[3] = palette.moonColor.r
      c[4] = palette.moonColor.g
      c[5] = palette.moonColor.b
      colorAttr.needsUpdate = true
    }

    if (sunLightRef.current) {
      sunLightRef.current.position.copy(sunDir).multiplyScalar(400)
      sunLightRef.current.target.position.set(0, 0, 0)
      sunLightRef.current.intensity = palette.sunIntensity
      sunLightRef.current.color.copy(palette.sunColor)
      sunLightRef.current.visible = palette.sunIntensity > 0.04
      // Only cast shadows when sun is meaningfully above horizon
      sunLightRef.current.castShadow = sunDir.y > 0.08
    }

    if (moonLightRef.current) {
      moonLightRef.current.position.copy(moonDir).multiplyScalar(400)
      moonLightRef.current.target.position.set(0, 0, 0)
      moonLightRef.current.intensity = palette.moonIntensity
      moonLightRef.current.color.copy(palette.moonColor)
      moonLightRef.current.visible = palette.moonIntensity > 0.03
      moonLightRef.current.castShadow = false
    }

    if (ambientRef.current) {
      ambientRef.current.intensity = palette.ambientIntensity
      ambientRef.current.color.copy(palette.horizon)
    }

    if (hemiRef.current) {
      hemiRef.current.intensity = palette.hemiIntensity
      hemiRef.current.color.copy(palette.hemiSky)
      hemiRef.current.groundColor.copy(palette.hemiGround)
    }

    // Sync fog / exposure with sky palette
    if (scene.fog && 'color' in scene.fog) {
      ;(scene.fog as THREE.Fog | THREE.FogExp2).color.copy(palette.fog)
    }
    gl.toneMappingExposure = palette.exposure
  })

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, 2]} frustumCulled={false}>
        <circleGeometry args={[1, 24]} />
        <meshBasicMaterial
          toneMapped={false}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      <ambientLight ref={ambientRef} intensity={0.3} />
      <hemisphereLight ref={hemiRef} args={['#cfe4ff', '#6b5a45', 0.4]} />

      <directionalLight
        ref={sunLightRef}
        castShadow
        intensity={1.2}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={1200}
        shadow-camera-left={-400}
        shadow-camera-right={400}
        shadow-camera-top={400}
        shadow-camera-bottom={-400}
        shadow-bias={-0.00015}
      >
        <object3D attach="target" position={[0, 0, 0]} />
      </directionalLight>

      <directionalLight ref={moonLightRef} intensity={0.2} color="#c8d4e8">
        <object3D attach="target" position={[0, 0, 0]} />
      </directionalLight>
    </>
  )
}
