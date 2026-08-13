import * as THREE from 'three'

export type WindMaterialOpts = {
  windStrength: number
  enableWind?: boolean
}

/**
 * MeshStandardMaterial + vertex wind via onBeforeCompile.
 * `enableWind=false` → material thường (prefers-reduced-motion).
 */
export function createWindMaterial(opts: WindMaterialOpts): THREE.MeshStandardMaterial {
  const { windStrength, enableWind = true } = opts
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.86,
    metalness: 0,
    vertexColors: true,
    side: THREE.DoubleSide,
    envMapIntensity: 0.28,
  })

  if (!enableWind || windStrength <= 0) {
    mat.userData.windEnabled = false
    return mat
  }

  mat.userData.windEnabled = true
  mat.userData.uTime = { value: 0 }
  mat.userData.uWindStrength = { value: windStrength }

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = mat.userData.uTime
    shader.uniforms.uWindStrength = mat.userData.uWindStrength

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
uniform float uTime;
uniform float uWindStrength;
`,
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `#include <begin_vertex>
{
  float mask = max(transformed.y, 0.0);
  float t = uTime * (1.15 + uWindStrength * 0.35);
  float phase = transformed.x * 0.18 + transformed.z * 0.14;
  float swayX = sin(t + phase) * uWindStrength * mask * 0.07;
  float swayZ = cos(t * 0.85 + phase * 0.9) * uWindStrength * mask * 0.045;
  transformed.x += swayX;
  transformed.z += swayZ;
}
`,
      )

    mat.userData.shader = shader
  }

  mat.customProgramCacheKey = () => `veg-wind-v1-${windStrength.toFixed(2)}`
  return mat
}

/** Cập nhật uTime cho mọi material wind trong list. */
export function tickWindMaterials(materials: THREE.Material[], elapsed: number): void {
  for (const m of materials) {
    const ud = (m as THREE.MeshStandardMaterial).userData
    if (ud?.windEnabled && ud.uTime) {
      ud.uTime.value = elapsed
    }
  }
}
