import * as THREE from 'three'

const VERT = /* glsl */ `
#include <common>
#include <fog_pars_vertex>

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

float waveField(vec3 pos, float t) {
  float f = uWaveFreq;
  float w1 = sin(pos.x * f * 0.09 + t * 0.55) * cos(pos.z * f * 0.07 - t * 0.4);
  float w2 = sin((pos.x * 0.7 + pos.z) * f * 0.05 + t * 0.72) * 0.45;
  float w3 = sin(pos.z * f * 0.13 - t * 0.28) * 0.28;
  float rain = uRainStrength > 0.001
    ? ripple(vec2(pos.x, pos.z) * 0.08 + vec2(t * 0.02, 0.0), t) * uRainStrength * 0.12
    : 0.0;
  return (w1 + w2 + w3) * uWaveAmp + rain;
}

void main() {
  vUv = uv;
  vec3 pos = position;
  float wave = waveField(pos, uTime);
  pos.y += wave;
  vWave = wave;

  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorldPos = world.xyz;

  float e = 0.45;
  float wx = waveField(pos + vec3(e, 0.0, 0.0), uTime);
  float wz = waveField(pos + vec3(0.0, 0.0, e), uTime);
  vec3 nLocal = normalize(vec3(-(wx - wave) / e, 1.0, -(wz - wave) / e));
  vWorldNormal = normalize(mat3(modelMatrix) * nLocal);

  vec4 mvPosition = viewMatrix * world;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`

const FRAG = /* glsl */ `
#include <common>
#include <fog_pars_fragment>
#include <tonemapping_pars_fragment>
#include <colorspace_pars_fragment>

uniform vec3 uDeepColor;
uniform vec3 uShallowColor;
uniform vec3 uFoamColor;
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

  vec3 R = reflect(-V, N);
  float skyMix = clamp(R.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 env = mix(uEnvHorizon, uEnvSky, skyMix);

  float bankX = min(vUv.x, 1.0 - vUv.x);
  float bankY = vUv.y >= 0.0 && vUv.y <= 1.0 ? min(vUv.y, 1.0 - vUv.y) : 1.0;
  float bank = min(bankX, bankY);
  float shore = 1.0 - smoothstep(0.0, 0.11, bank);
  float depth = smoothstep(0.02, 0.38, bank);

  float cau =
    0.5
    + 0.5 * sin(vWorldPos.x * 0.62 + uTime * 0.35)
    * sin(vWorldPos.z * 0.54 - uTime * 0.28);
  cau *= 0.5 + 0.5 * sin((vWorldPos.x + vWorldPos.z) * 0.85 + uTime * 0.42);
  float silt = hash21(floor(vWorldPos.xz * 0.35));

  vec3 water = mix(uDeepColor, uShallowColor, (1.0 - depth) * 0.85 + cau * 0.12);
  water = mix(water, uDeepColor * 0.7, silt * 0.18);
  water += vec3(0.04, 0.07, 0.05) * cau * depth;
  water = mix(water, uFoamColor, shore * 0.55);
  water += vec3(0.03, 0.04, 0.03) * vWave * 8.0;

  vec3 col = mix(water, env, fresnel * 0.55);

  vec3 L = normalize(vec3(0.35, 0.82, 0.28));
  float spec = pow(max(dot(reflect(-L, N), V), 0.0), 72.0) * uSpecular;
  col += vec3(0.78, 0.86, 0.82) * spec * (1.0 - shore * 0.6);

  if (uRainStrength > 0.01) {
    float spark = hash21(floor(vUv * 40.0 + uTime * 3.0)) * uRainStrength;
    col += vec3(0.45, 0.55, 0.52) * spark * 0.14;
  }

  float alpha = mix(uOpacity, min(1.0, uOpacity + 0.08), fresnel);
  alpha = mix(alpha, min(1.0, alpha + 0.12), shore);
  gl_FragColor = vec4(col, alpha);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`

export type WaterMaterialHandle = {
  material: THREE.ShaderMaterial
  setTime: (t: number) => void
  setRaining: (v: boolean) => void
  dispose: () => void
}

/**
 * Palace-pond water: dark tea-green, shore foam, calm ripples.
 * Hexes are pond silt — not the white `nuoc` material tint.
 */
const WATER_DEEP = '#163832'
const WATER_SHALLOW = '#3A6754'
const WATER_FOAM = '#C4D0C0'

export function createWaterMaterial(): WaterMaterialHandle {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uWaveAmp: { value: 0.032 },
      uWaveFreq: { value: 1.15 },
      uRainStrength: { value: 0 },
      uDeepColor: { value: new THREE.Color(WATER_DEEP) },
      uShallowColor: { value: new THREE.Color(WATER_SHALLOW) },
      uFoamColor: { value: new THREE.Color(WATER_FOAM) },
      uEnvSky: { value: new THREE.Color('#8FB4A8') },
      uEnvHorizon: { value: new THREE.Color('#4A6A58') },
      uFresnelPower: { value: 3.6 },
      uOpacity: { value: 0.94 },
      uSpecular: { value: 0.42 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: true,
    toneMapped: true,
  })
  material.name = 'WaterShader'

  return {
    material,
    setTime: (t: number) => {
      material.uniforms.uTime.value = t
    },
    setRaining: (v: boolean) => {
      material.uniforms.uRainStrength.value = v ? 1 : 0
      material.uniforms.uWaveAmp.value = v ? 0.055 : 0.032
    },
    dispose: () => {
      material.dispose()
    },
  }
}
