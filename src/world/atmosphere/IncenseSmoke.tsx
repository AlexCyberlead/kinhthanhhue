import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COUNTS, INCENSE_EMITTERS } from './constants'

const vertexShader = /* glsl */ `
uniform float uTime;
attribute float aSeed;
attribute float aSpeed;
varying float vAlpha;
varying float vSeed;

void main() {
  vSeed = aSeed;
  vec3 pos = position;
  float life = fract(uTime * aSpeed * 0.08 + aSeed);
  pos.y += life * (3.5 + aSeed * 2.5);
  float swirl = life * 6.2832;
  pos.x += sin(swirl + aSeed * 10.0) * (0.15 + life * 0.55);
  pos.z += cos(swirl * 0.7 + aSeed * 7.0) * (0.12 + life * 0.45);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = mix(10.0, 28.0, life);
  gl_PointSize = clamp(size / -mv.z * 40.0, 2.0, 48.0);
  vAlpha = smoothstep(0.0, 0.12, life) * smoothstep(1.0, 0.55, life);
}
`

const fragmentShader = /* glsl */ `
precision mediump float;
uniform float uOpacity;
uniform vec3 uColor;
varying float vAlpha;
varying float vSeed;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float soft = smoothstep(0.5, 0.05, d);
  float alpha = soft * vAlpha * uOpacity * (0.55 + 0.2 * fract(vSeed * 17.3));
  if (alpha < 0.015) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`

type Props = {
  intensity: number
}

/**
 * Incense smoke plumes near ancestral temples / Điện Thái Hòa.
 * 1 draw call (Points).
 */
export function IncenseSmoke({ intensity }: Props) {
  const pointsRef = useRef<THREE.Points>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const n = COUNTS.incense
    const emitters = INCENSE_EMITTERS
    const positions = new Float32Array(n * 3)
    const seeds = new Float32Array(n)
    const speeds = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const e = emitters[i % emitters.length]!
      const jitter = 0.35
      positions[i * 3] = e[0] + (Math.random() - 0.5) * jitter
      positions[i * 3 + 1] = e[1] + Math.random() * 0.2
      positions[i * 3 + 2] = e[2] + (Math.random() - 0.5) * jitter
      seeds[i] = Math.random()
      speeds[i] = 0.6 + Math.random() * 0.7
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
      uOpacity: { value: 0.35 },
      uColor: { value: new THREE.Color('#c8c0b4') },
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
    mat.uniforms.uOpacity.value = 0.28 * intensity
  })

  return (
    <points ref={pointsRef} frustumCulled={false} renderOrder={3}>
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  )
}
