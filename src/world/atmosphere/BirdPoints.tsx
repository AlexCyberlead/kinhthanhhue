import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BIRD_RADIUS, COUNTS } from './constants'

const vertexShader = /* glsl */ `
uniform float uTime;
attribute float aSeed;
attribute float aRadius;
attribute float aPhase;
attribute float aSpeed;
varying float vWing;

void main() {
  float t = uTime * aSpeed + aPhase;
  float x = cos(t) * aRadius;
  float z = sin(t) * aRadius * 0.72;
  float y = position.y + sin(t * 2.4 + aSeed * 6.28) * 1.8;
  x += sin(uTime * 0.08 + aSeed) * 12.0;
  z += cos(uTime * 0.06) * 18.0 - 60.0;

  vec3 pos = vec3(x, y, z);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(9.0 / -mv.z * 70.0, 2.0, 16.0);
  vWing = sin(uTime * 14.0 + aSeed * 20.0);
}
`

const fragmentShader = /* glsl */ `
precision mediump float;
uniform float uOpacity;
uniform vec3 uColor;
varying float vWing;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float body = smoothstep(0.18, 0.05, length(uv * vec2(1.4, 2.2)));
  float wingY = abs(uv.y) - 0.02 * vWing;
  float wing = smoothstep(0.08, 0.0, abs(wingY)) * smoothstep(0.42, 0.08, abs(uv.x));
  float alpha = max(body, wing * 0.85) * uOpacity;
  if (alpha < 0.04) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`

type Props = {
  intensity: number
}

/**
 * Distant bird flock — Points billboard silhouettes.
 * 1 draw call. Hidden at night / heavy rain via intensity.
 */
export function BirdPoints({ intensity }: Props) {
  const pointsRef = useRef<THREE.Points>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const n = COUNTS.birds
    const positions = new Float32Array(n * 3)
    const seeds = new Float32Array(n)
    const radii = new Float32Array(n)
    const phases = new Float32Array(n)
    const speeds = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = 28 + Math.random() * 45
      positions[i * 3 + 2] = 0
      seeds[i] = Math.random()
      radii[i] = BIRD_RADIUS * (0.35 + Math.random() * 0.65)
      phases[i] = Math.random() * Math.PI * 2
      speeds[i] = 0.12 + Math.random() * 0.18
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geo.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    return geo
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0.7 },
      uColor: { value: new THREE.Color('#1a1e24') },
    }),
    [],
  )

  useFrame(({ clock }) => {
    const pts = pointsRef.current
    const mat = matRef.current
    if (!pts || !mat) return
    const on = intensity > 0.05
    pts.visible = on
    if (!on) return
    mat.uniforms.uTime.value = clock.elapsedTime
    mat.uniforms.uOpacity.value = 0.65 * intensity
  })

  return (
    <points ref={pointsRef} frustumCulled={false} renderOrder={6}>
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
