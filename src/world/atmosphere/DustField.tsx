import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COUNTS, DUST_RADIUS } from './constants'

const vertexShader = /* glsl */ `
uniform float uTime;
attribute float aSeed;
attribute float aSpeed;
varying float vAlpha;

void main() {
  vec3 pos = position;
  float t = uTime * aSpeed * 0.15 + aSeed * 6.28;
  pos.x += sin(t) * 1.8;
  pos.y += sin(t * 0.7 + aSeed) * 0.6;
  pos.z += cos(t * 0.9) * 1.5;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(6.0 / -mv.z * 28.0, 1.0, 8.0);
  vAlpha = 0.35 + 0.25 * sin(t * 2.0);
}
`

const fragmentShader = /* glsl */ `
precision mediump float;
uniform float uOpacity;
uniform vec3 uColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float soft = smoothstep(0.5, 0.1, d);
  float alpha = soft * vAlpha * uOpacity;
  if (alpha < 0.02) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`

type Props = {
  intensity: number
}

/**
 * Courtyard dust motes — soft floating points.
 * 1 draw call. Dimmed when raining.
 */
export function DustField({ intensity }: Props) {
  const pointsRef = useRef<THREE.Points>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const n = COUNTS.dust
    const positions = new Float32Array(n * 3)
    const seeds = new Float32Array(n)
    const speeds = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.sqrt(Math.random()) * DUST_RADIUS
      positions[i * 3] = Math.cos(a) * r
      positions[i * 3 + 1] = 0.4 + Math.random() * 8
      positions[i * 3 + 2] = Math.sin(a) * r
      seeds[i] = Math.random()
      speeds[i] = 0.4 + Math.random() * 0.8
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    return geo
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0.2 },
      uColor: { value: new THREE.Color('#d4c4a8') },
    }),
    [],
  )

  useFrame(({ clock }) => {
    const pts = pointsRef.current
    const mat = matRef.current
    if (!pts || !mat) return
    const on = intensity > 0.02
    pts.visible = on
    if (!on) return
    mat.uniforms.uTime.value = clock.elapsedTime
    mat.uniforms.uOpacity.value = 0.22 * intensity
  })

  return (
    <points ref={pointsRef} frustumCulled={false} renderOrder={2}>
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}
