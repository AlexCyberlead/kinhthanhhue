import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Season } from '../sky/skyMath'
import { COUNTS, LEAF_COLORS, LEAF_RADIUS } from './constants'

const vertexShader = /* glsl */ `
uniform float uTime;
attribute float aSeed;
attribute float aSpeed;
attribute float aSpin;
varying float vAlpha;
varying float vSeed;

void main() {
  vSeed = aSeed;
  vec3 pos = position;
  float life = fract(uTime * aSpeed * 0.045 + aSeed);
  pos.y = mix(14.0 + aSeed * 6.0, -0.5, life);
  float wind = life * 8.0;
  pos.x += sin(wind + aSeed * 6.28) * (1.5 + life * 3.0);
  pos.z += cos(wind * 0.6 + aSpin) * (1.2 + life * 2.5);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = mix(7.0, 14.0, aSeed);
  gl_PointSize = clamp(size / -mv.z * 55.0, 2.0, 22.0);
  vAlpha = smoothstep(0.0, 0.1, life) * smoothstep(1.0, 0.88, life);
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
  float ellipse = length(uv * vec2(1.0, 1.45));
  float soft = smoothstep(0.48, 0.12, ellipse);
  float notch = smoothstep(0.15, 0.0, abs(uv.x) - uv.y * 0.15);
  float alpha = soft * notch * vAlpha * uOpacity;
  if (alpha < 0.02) discard;
  vec3 col = mix(uColor, uColor * 0.75, fract(vSeed * 9.1) * 0.4);
  gl_FragColor = vec4(col, alpha);
}
`

const SEASON_DENSITY: Record<Season, number> = {
  xuan: 0.65,
  ha: 0.25,
  thu: 1.0,
  dong: 0.15,
}

type Props = {
  season: Season
  intensity: number
}

/**
 * Seasonal falling leaves / petals — one Points draw call.
 */
export function SeasonalLeaves({ season, intensity }: Props) {
  const pointsRef = useRef<THREE.Points>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const color = useMemo(() => new THREE.Color(LEAF_COLORS[season]), [season])

  const geometry = useMemo(() => {
    const n = COUNTS.leaves
    const positions = new Float32Array(n * 3)
    const seeds = new Float32Array(n)
    const speeds = new Float32Array(n)
    const spins = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.sqrt(Math.random()) * LEAF_RADIUS
      positions[i * 3] = Math.cos(a) * r
      positions[i * 3 + 1] = 4 + Math.random() * 16
      positions[i * 3 + 2] = Math.sin(a) * r - 40
      seeds[i] = Math.random()
      speeds[i] = 0.5 + Math.random() * 0.7
      spins[i] = Math.random() * Math.PI * 2
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geo.setAttribute('aSpin', new THREE.BufferAttribute(spins, 1))
    return geo
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0.55 },
      uColor: { value: new THREE.Color(LEAF_COLORS.thu) },
    }),
    [],
  )

  useFrame(({ clock }) => {
    const pts = pointsRef.current
    const mat = matRef.current
    if (!pts || !mat) return
    const dens = SEASON_DENSITY[season] * intensity
    const on = dens > 0.05
    pts.visible = on
    if (!on) return
    mat.uniforms.uTime.value = clock.elapsedTime
    mat.uniforms.uOpacity.value = 0.5 * dens
    ;(mat.uniforms.uColor.value as THREE.Color).copy(color)
  })

  return (
    <points ref={pointsRef} frustumCulled={false} renderOrder={4}>
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
