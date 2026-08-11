import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COUNTS } from './constants'
import { sunDirectionFromTime } from '../sky/skyMath'

const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 camRight = vec3(modelViewMatrix[0][0], modelViewMatrix[1][0], modelViewMatrix[2][0]);
  // Keep vertical shafts; slight camera face on X only
  vec3 pos = camRight * position.x + vec3(0.0, position.y, 0.0);
  vec4 mv = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  mv.xyz += pos;
  gl_Position = projectionMatrix * mv;
}
`

const fragmentShader = /* glsl */ `
precision mediump float;
uniform float uOpacity;
uniform vec3 uColor;
varying vec2 vUv;

void main() {
  float x = abs(vUv.x - 0.5) * 2.0;
  float y = vUv.y;
  // max() bắt buộc: vUv nội suy có thể nhích quá 1.0 nên 1.0 - x thành âm, mà
  // pow() với cơ số âm là undefined trong GLSL — driver trả NaN. NaN lọt qua
  // phép so alpha < 0.01 (mọi so sánh với NaN đều false) nên không bị discard,
  // additive blend ghi NaN vào buffer HDR, rồi chuỗi mipmap của Bloom lan NaN ra
  // toàn khung → màn hình đen sạch trong khung giờ god-ray bật (6.5h–8.5h).
  float shaft = pow(max(1.0 - x, 0.0), 2.2) * smoothstep(0.0, 0.15, y) * smoothstep(1.0, 0.55, y);
  float alpha = shaft * uOpacity;
  if (!(alpha >= 0.01)) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`

const _dummy = new THREE.Object3D()
const _sun = new THREE.Vector3()

type Props = {
  timeOfDay: number
  intensity: number
}

/**
 * Soft god-ray shafts — few InstancedMesh sprites aligned toward sun.
 * 1 draw call. Optional; dawn / clear only.
 */
export function GodRaySprites({ timeOfDay, intensity }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => new THREE.PlaneGeometry(8, 40), [])

  const uniforms = useMemo(
    () => ({
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color('#f0e2c0') },
    }),
    [],
  )

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    for (let i = 0; i < COUNTS.godRays; i++) {
      const t = (i + 0.5) / COUNTS.godRays
      _dummy.position.set((t - 0.5) * 80, 12, -20 + (i % 2) * 25)
      _dummy.rotation.set(0, 0, (t - 0.5) * 0.25)
      _dummy.scale.set(0.8 + Math.random() * 0.6, 1.1 + Math.random() * 0.4, 1)
      _dummy.updateMatrix()
      mesh.setMatrixAt(i, _dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.count = COUNTS.godRays
  }, [])

  useFrame(() => {
    const mesh = meshRef.current
    const mat = matRef.current
    if (!mesh || !mat) return
    const on = intensity > 0.02
    mesh.visible = on
    if (!on) return
    sunDirectionFromTime(timeOfDay, _sun)
    const yaw = Math.atan2(_sun.x, _sun.z)
    mesh.rotation.y = yaw * 0.35
    mat.uniforms.uOpacity.value = 0.12 * intensity
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, COUNTS.godRays]}
      frustumCulled={false}
      renderOrder={0}
    >
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </instancedMesh>
  )
}
