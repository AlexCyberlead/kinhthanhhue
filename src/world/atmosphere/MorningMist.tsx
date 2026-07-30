import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COUNTS, MIST_RADIUS } from './constants'

const vertexShader = /* glsl */ `
attribute float aSeed;
attribute float aScale;
varying vec2 vUv;
varying float vSeed;
uniform float uTime;

void main() {
  vUv = uv;
  vSeed = aSeed;
  vec3 camRight = vec3(modelViewMatrix[0][0], modelViewMatrix[1][0], modelViewMatrix[2][0]);
  vec3 camUp = vec3(0.0, 1.0, 0.0);
  vec3 pos = position;
  pos.x += sin(uTime * 0.04 + aSeed * 6.28) * 0.08;
  vec3 worldOffset = camRight * pos.x * aScale + camUp * pos.y * aScale * 0.45;
  vec4 mv = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  mv.xyz += worldOffset;
  gl_Position = projectionMatrix * mv;
}
`

const fragmentShader = /* glsl */ `
precision mediump float;
uniform float uOpacity;
uniform vec3 uColor;
varying vec2 vUv;
varying float vSeed;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float dist = length(uv * vec2(1.0, 1.25));
  float soft = smoothstep(1.0, 0.2, dist);
  float n = hash(uv * 3.0 + vSeed);
  float alpha = soft * mix(0.55, 1.0, n) * uOpacity;
  if (alpha < 0.02) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`

const _dummy = new THREE.Object3D()

type Props = {
  intensity: number
}

/**
 * Early-morning ground mist — InstancedMesh billboard sprites.
 * 1 draw call. Active ~5–8h.
 */
export function MorningMist({ intensity }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const { geometry, seeds } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1)
    const seedArr = new Float32Array(COUNTS.mist)
    const scaleArr = new Float32Array(COUNTS.mist)
    for (let i = 0; i < COUNTS.mist; i++) {
      seedArr[i] = Math.random()
      scaleArr[i] = 18 + Math.random() * 36
    }
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seedArr, 1))
    geo.setAttribute('aScale', new THREE.InstancedBufferAttribute(scaleArr, 1))
    return { geometry: geo, seeds: seedArr }
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color('#b8c2c8') },
    }),
    [],
  )

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    for (let i = 0; i < COUNTS.mist; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.sqrt(Math.random()) * MIST_RADIUS
      _dummy.position.set(Math.cos(a) * r, 1.2 + Math.random() * 3.5, Math.sin(a) * r - 30)
      _dummy.rotation.set(0, 0, 0)
      _dummy.scale.setScalar(1)
      _dummy.updateMatrix()
      mesh.setMatrixAt(i, _dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.count = COUNTS.mist
  }, [seeds])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    const mat = matRef.current
    if (!mesh || !mat) return
    const on = intensity > 0.02
    mesh.visible = on
    if (!on) return
    mat.uniforms.uTime.value = clock.elapsedTime
    mat.uniforms.uOpacity.value = 0.22 * intensity
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, COUNTS.mist]}
      frustumCulled={false}
      renderOrder={1}
    >
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </instancedMesh>
  )
}
