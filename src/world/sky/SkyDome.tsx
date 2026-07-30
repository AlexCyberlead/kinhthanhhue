import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SkyPalette } from './skyMath'

const vertexShader = /* glsl */ `
varying vec3 vWorldDir;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldDir = normalize(world.xyz - cameraPosition);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uGround;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uDay;
uniform float uTwilight;
uniform float uRain;
uniform float uTurbidity;

varying vec3 vWorldDir;

void main() {
  vec3 dir = normalize(vWorldDir);
  float elev = dir.y; // -1..1

  // Gradient sky: ground → horizon → zenith
  float h = smoothstep(-0.15, 0.05, elev);
  float z = smoothstep(0.05, 0.75, elev);
  vec3 col = mix(uGround, uHorizon, h);
  col = mix(col, uZenith, z);

  // Preetham-like sun disc glow + Rayleigh approx along sun direction
  float sunDot = max(dot(dir, normalize(uSunDir)), 0.0);
  float mie = pow(sunDot, mix(32.0, 8.0, uTurbidity * 0.08));
  float rayleigh = pow(sunDot, 2.0) * 0.35 * uDay;

  vec3 sunGlow = uSunColor * (mie * (1.2 - uRain * 0.7) + rayleigh);
  // Horizon warm band at twilight
  float horizonBand = exp(-abs(elev) * 8.0) * uTwilight;
  sunGlow += vec3(1.0, 0.45, 0.15) * horizonBand * 0.55;

  col += sunGlow * (0.35 + 0.65 * uDay);

  // Night: subtle blue gradient remains from uniforms
  col = mix(col, col * 0.85, uRain * 0.4);

  gl_FragColor = vec4(col, 1.0);
}
`

type Props = {
  palette: SkyPalette
  sunDir: THREE.Vector3
  day: number
  twilight: number
  raining: boolean
}

export function SkyDome({ palette, sunDir, day, twilight, raining }: Props) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uZenith: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uGround: { value: new THREE.Color() },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunColor: { value: new THREE.Color() },
      uDay: { value: 1 },
      uTwilight: { value: 0 },
      uRain: { value: 0 },
      uTurbidity: { value: 4 },
    }),
    [],
  )

  useFrame(() => {
    const m = matRef.current
    if (!m) return
    m.uniforms.uZenith.value.copy(palette.zenith)
    m.uniforms.uHorizon.value.copy(palette.horizon)
    m.uniforms.uGround.value.copy(palette.ground)
    m.uniforms.uSunDir.value.copy(sunDir)
    m.uniforms.uSunColor.value.copy(palette.sunColor)
    m.uniforms.uDay.value = day
    m.uniforms.uTwilight.value = twilight
    m.uniforms.uRain.value = raining ? 1 : 0
    m.uniforms.uTurbidity.value = palette.turbidity
  })

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[4000, 32, 16]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}
