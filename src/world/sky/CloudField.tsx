import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CLOUD_COUNT = 48
const CLOUD_RADIUS = 2200
const CLOUD_Y_MIN = 380
const CLOUD_Y_MAX = 720

const vertexShader = /* glsl */ `
attribute float aSeed;
attribute float aScale;
varying vec2 vUv;
varying float vSeed;
uniform float uTime;

void main() {
  vUv = uv;
  vSeed = aSeed;

  // Billboard: face camera, keep world Y-up soft
  vec3 camRight = vec3(modelViewMatrix[0][0], modelViewMatrix[1][0], modelViewMatrix[2][0]);
  vec3 camUp = vec3(0.0, 1.0, 0.0);
  vec3 pos = position;
  // Soft drift in local plane
  pos.x += sin(uTime * 0.02 + aSeed * 6.28) * 0.05;
  vec3 worldOffset = camRight * pos.x * aScale + camUp * pos.y * aScale * 0.55;
  vec4 mv = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  mv.xyz += worldOffset;
  gl_Position = projectionMatrix * mv;
}
`

const fragmentShader = /* glsl */ `
precision mediump float;
uniform float uOpacity;
uniform float uRain;
uniform vec3 uColor;
varying vec2 vUv;
varying float vSeed;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.05;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float dist = length(uv * vec2(1.0, 1.35));
  float soft = smoothstep(1.0, 0.15, dist);

  float n = fbm(uv * 2.8 + vSeed * 10.0);
  float alpha = soft * smoothstep(0.28, 0.72, n);
  alpha *= uOpacity * mix(1.0, 0.35, uRain);

  if (alpha < 0.02) discard;
  vec3 col = mix(uColor, uColor * 0.75, uRain);
  gl_FragColor = vec4(col, alpha);
}
`

type Props = {
  opacity: number
  raining: boolean
  tint: THREE.Color
}

export function CloudField({ opacity, raining, tint }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const { seeds, geometry } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1)
    const seedArr = new Float32Array(CLOUD_COUNT)
    const scaleArr = new Float32Array(CLOUD_COUNT)
    for (let i = 0; i < CLOUD_COUNT; i++) {
      seedArr[i] = Math.random()
      scaleArr[i] = 180 + Math.random() * 320
    }
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seedArr, 1))
    geo.setAttribute('aScale', new THREE.InstancedBufferAttribute(scaleArr, 1))
    return { seeds: seedArr, geometry: geo }
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0.6 },
      uRain: { value: 0 },
      uColor: { value: new THREE.Color('#f2f5f8') },
    }),
    [],
  )

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const dummy = new THREE.Object3D()
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const seed = seeds[i]!
      const ang = seed * Math.PI * 2 + i * 0.37
      const r = CLOUD_RADIUS * (0.55 + seed * 0.45)
      const y = CLOUD_Y_MIN + ((seed * 17.3) % 1) * (CLOUD_Y_MAX - CLOUD_Y_MIN)
      dummy.position.set(Math.cos(ang) * r, y, Math.sin(ang) * r * 0.85)
      dummy.scale.setScalar(1)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.count = CLOUD_COUNT
  }, [seeds])

  useFrame(({ clock }) => {
    const m = matRef.current
    if (!m) return
    m.uniforms.uTime.value = clock.elapsedTime
    m.uniforms.uOpacity.value = opacity
    m.uniforms.uRain.value = raining ? 1 : 0
    m.uniforms.uColor.value.copy(tint)
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, CLOUD_COUNT]}
      frustumCulled={false}
      renderOrder={-5}
    >
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  )
}
