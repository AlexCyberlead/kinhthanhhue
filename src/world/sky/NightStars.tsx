import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STAR_COUNT = 1200
const STAR_RADIUS = 3900

type Props = {
  opacity: number
}

export function NightStars({ opacity }: Props) {
  const pointsRef = useRef<THREE.Points>(null)
  const matRef = useRef<THREE.PointsMaterial>(null)

  const geometry = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3)
    for (let i = 0; i < STAR_COUNT; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = u * Math.PI * 2
      // Upper hemisphere only
      const phi = Math.acos(Math.min(1, 0.02 + v * 0.98))
      const y = Math.abs(Math.cos(phi))
      const r = STAR_RADIUS
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * r
      positions[i * 3 + 1] = y * r
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  useFrame(({ clock }) => {
    const mat = matRef.current
    if (!mat) return
    // Subtle twinkle
    const twinkle = 0.85 + Math.sin(clock.elapsedTime * 0.7) * 0.08
    mat.opacity = Math.max(0, opacity * twinkle)
    mat.visible = opacity > 0.01
    if (pointsRef.current) pointsRef.current.visible = opacity > 0.01
  })

  return (
    <points ref={pointsRef} frustumCulled={false} renderOrder={-8}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        ref={matRef}
        color="#e8eef8"
        size={6}
        sizeAttenuation
        transparent
        depthWrite={false}
        depthTest
        toneMapped={false}
        opacity={0}
      />
    </points>
  )
}
