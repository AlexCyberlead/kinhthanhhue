import * as THREE from 'three'
import { getMaterial } from '../../core/materials/MaterialLibrary'

const VERT = /* glsl */ `
uniform float uTime;
uniform float uWaveAmp;
uniform float uWaveFreq;
uniform float uRainStrength;

varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec2 vUv;
varying float vWave;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float ripple(vec2 uv, float t) {
  vec2 cell = floor(uv * 7.0);
  vec2 f = fract(uv * 7.0) - 0.5;
  float h = hash21(cell);
  float phase = t * (1.8 + h * 2.4) + h * 6.28;
  float d = length(f + (hash21(cell + 17.0) - 0.5) * 0.35);
  float ring = abs(sin(d * 28.0 - phase));
  float falloff = smoothstep(0.48, 0.05, d);
  return ring * falloff * h;
}

void main() {
  vUv = uv;
  vec3 pos = position;

  float w1 = sin(pos.x * uWaveFreq * 0.11 + uTime * 1.15)
           * cos(pos.z * uWaveFreq * 0.09 - uTime * 0.85);
  float w2 = sin((pos.x + pos.z) * uWaveFreq * 0.07 + uTime * 1.55) * 0.55;
  float w3 = sin(pos.z * uWaveFreq * 0.17 - uTime * 0.65) * 0.35;
  float rain = uRainStrength > 0.001
    ? ripple(uv + vec2(uTime * 0.02, 0.0), uTime) * uRainStrength * 0.12
    : 0.0;

  float wave = (w1 + w2 + w3) * uWaveAmp + rain;
  pos.y += wave;
  vWave = wave;

  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorldPos = world.xyz;

  // Approximate normal from finite-diff of the same wave field
  float e = 0.6;
  float wx = (sin((pos.x + e) * uWaveFreq * 0.11 + uTime * 1.15)
            * cos(pos.z * uWaveFreq * 0.09 - uTime * 0.85)
            + sin((pos.x + e + pos.z) * uWaveFreq * 0.07 + uTime * 1.55) * 0.55)
            * uWaveAmp;
  float wz = (sin(pos.x * uWaveFreq * 0.11 + uTime * 1.15)
            * cos((pos.z + e) * uWaveFreq * 0.09 - uTime * 0.85)
            + sin((pos.x + pos.z + e) * uWaveFreq * 0.07 + uTime * 1.55) * 0.55)
            * uWaveAmp;
  vec3 nLocal = normalize(vec3(-(wx - wave) / e, 1.0, -(wz - wave) / e));
  vWorldNormal = normalize(mat3(modelMatrix) * nLocal);

  gl_Position = projectionMatrix * viewMatrix * world;
}
`

const FRAG = /* glsl */ `
uniform vec3 uDeepColor;
uniform vec3 uShallowColor;
uniform vec3 uEnvSky;
uniform vec3 uEnvHorizon;
uniform float uFresnelPower;
uniform float uOpacity;
uniform float uTime;
uniform float uRainStrength;
uniform float uSpecular;

varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec2 vUv;
varying float vWave;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float ndotv = clamp(dot(N, V), 0.0, 1.0);
  float fresnel = pow(1.0 - ndotv, uFresnelPower);

  // Fake environment reflection — sky/horizon blend from reflect dir
  vec3 R = reflect(-V, N);
  float skyMix = clamp(R.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 env = mix(uEnvHorizon, uEnvSky, skyMix);

  float depthHint = clamp(0.45 + vWave * 2.5, 0.0, 1.0);
  vec3 water = mix(uDeepColor, uShallowColor, depthHint * (1.0 - fresnel * 0.35));
  vec3 col = mix(water, env, fresnel * 0.72);

  // Soft specular lobe (sun-ish from +Y/+Z)
  vec3 L = normalize(vec3(0.35, 0.85, 0.25));
  float spec = pow(max(dot(reflect(-L, N), V), 0.0), 48.0) * uSpecular;
  col += vec3(0.85, 0.92, 1.0) * spec;

  // Rain sparkle / extra fresnel
  if (uRainStrength > 0.01) {
    float spark = hash21(floor(vUv * 40.0 + uTime * 3.0)) * uRainStrength;
    col += vec3(0.55, 0.65, 0.75) * spark * 0.18;
    fresnel = mix(fresnel, 1.0, uRainStrength * 0.15);
  }

  float alpha = mix(uOpacity, min(1.0, uOpacity + 0.25), fresnel);
  gl_FragColor = vec4(col, alpha);
}
`

export type WaterMaterialHandle = {
  material: THREE.ShaderMaterial
  setTime: (t: number) => void
  setRaining: (v: boolean) => void
  dispose: () => void
}

/**
 * Shared water ShaderMaterial: fresnel + noise waves + fake env reflection + rain ripples.
 * Tint seeded from MaterialLibrary `nuoc` (read-only).
 */
export function createWaterMaterial(): WaterMaterialHandle {
  const base = getMaterial('nuoc')
  const deep = base.color.clone()
  const shallow = deep.clone().lerp(new THREE.Color('#7EB8C4'), 0.45)

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uWaveAmp: { value: 0.085 },
      uWaveFreq: { value: 1.0 },
      uRainStrength: { value: 0 },
      uDeepColor: { value: deep },
      uShallowColor: { value: shallow },
      uEnvSky: { value: new THREE.Color('#A8C4DE') },
      uEnvHorizon: { value: new THREE.Color('#6A8FA8') },
      uFresnelPower: { value: 3.2 },
      uOpacity: { value: 0.82 },
      uSpecular: { value: 0.55 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  material.name = 'WaterShader'

  return {
    material,
    setTime: (t: number) => {
      material.uniforms.uTime.value = t
    },
    setRaining: (v: boolean) => {
      material.uniforms.uRainStrength.value = v ? 1 : 0
      material.uniforms.uWaveAmp.value = v ? 0.12 : 0.085
    },
    dispose: () => {
      material.dispose()
    },
  }
}
