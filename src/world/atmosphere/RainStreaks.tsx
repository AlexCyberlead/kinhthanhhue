import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { COUNTS, RAIN_HALF_XZ, RAIN_HEIGHT } from './constants'

const vertexShader = /* glsl */ `
uniform float uTime;
attribute float aSeed;
attribute float aSpeed;
varying float vAlpha;

void main() {
  vec3 pos = position;
  float life = fract(uTime * aSpeed * 0.12 + aSeed);
  pos.y = mix(${RAIN_HEIGHT.toFixed(1)}, -1.5, life);
  pos.x += sin(uTime * 0.35 + aSeed * 6.28) * 0.8 + life * 2.2;
  pos.z += cos(uTime * 0.28 + aSeed * 4.1) * 0.5;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(28.0 / -mv.z, 1.5, 14.0);
  vAlpha = smoothstep(0.0, 0.08, life) * smoothstep(1.0, 0.85, life);
}
`

const fragmentShader = /* glsl */ `
precision mediump float;
uniform float uOpacity;
uniform vec3 uColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float streak = 1.0 - smoothstep(0.04, 0.22, abs(uv.x));
  streak *= 1.0 - smoothstep(0.35, 0.5, abs(uv.y));
  float alpha = streak * vAlpha * uOpacity;
  if (alpha < 0.02) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`

type Props = {
  active: boolean
}

/**
 * Hue rain — long streaks, slow fall (mưa dầm), camera-locked box.
 * 1 draw call (Points).
 */
export function RainStreaks({ active }: Props) {
  const pointsRef = useRef<THREE.Points>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { camera } = useThree()

  const geometry = useMemo(() => {
    const n = COUNTS.rain
    const positions = new Float32Array(n * 3)
    const seeds = new Float32Array(n)
    const speeds = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      positions[i * 3] = (Math.random() * 2 - 1) * RAIN_HALF_XZ
      positions[i * 3 + 1] = Math.random() * RAIN_HEIGHT
      positions[i * 3 + 2] = (Math.random() * 2 - 1) * RAIN_HALF_XZ
      seeds[i] = Math.random()
      speeds[i] = 0.75 + Math.random() * 0.55
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
      uOpacity: { value: 0.55 },
      uColor: { value: new THREE.Color('#a8b4bc') },
    }),
    [],
  )

  useFrame(({ clock }) => {
    const pts = pointsRef.current
    const mat = matRef.current
    if (!pts) return
    pts.visible = active
    if (!active || !mat) return
    mat.uniforms.uTime.value = clock.elapsedTime
    pts.position.set(camera.position.x, 0, camera.position.z)
  })

  return (
    <points ref={pointsRef} frustumCulled={false} renderOrder={5} visible={active}>
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
