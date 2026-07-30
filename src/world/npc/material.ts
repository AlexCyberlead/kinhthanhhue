import * as THREE from 'three'

export type NpcMaterialOpts = {
  /** C5 costume atlas — torso samples when present; else vertex colors only. */
  atlas?: THREE.Texture | null
}

/**
 * MeshStandardMaterial + instance costume colors (+ optional atlas) + idle/walk/bow.
 * Atlas qua uniform riêng (không dùng `mat.map`) để tránh `#include <map_fragment>` ghi đè UV.
 */
export function createNpcMaterial(opts: NpcMaterialOpts = {}): THREE.MeshStandardMaterial {
  const atlas = opts.atlas ?? null
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.82,
    metalness: 0.04,
    vertexColors: true,
  })

  mat.userData.uTime = { value: 0 }
  mat.userData.uUseAtlas = { value: atlas ? 1 : 0 }
  mat.userData.uAtlas = { value: atlas }

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = mat.userData.uTime
    shader.uniforms.uUseAtlas = mat.userData.uUseAtlas
    shader.uniforms.uAtlas = mat.userData.uAtlas

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
uniform float uTime;
uniform float uUseAtlas;
attribute vec3 aPrimary;
attribute vec3 aSecondary;
attribute vec3 aAccent;
attribute vec3 aSkin;
attribute vec3 aHat;
attribute float aHasHat;
attribute vec3 aAnim;
attribute vec4 aAtlasRect;
varying vec3 vNpcColor;
varying float vUseAtlasSample;
varying vec2 vAtlasUv;
`,
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `#include <begin_vertex>
{
  float state = aAnim.x;
  float phase = aAnim.y;
  float animT = aAnim.z;
  float t = uTime + phase;

  float cr = step(0.5, color.r);
  float cg = step(0.5, color.g);
  float cb = step(0.5, color.b);
  float isHat = cr * cg;
  float isHair = cg * cb;
  float isTorso = cr * (1.0 - cg) * (1.0 - isHat) * (1.0 - isHair);

  vec3 baseCol = aPrimary * color.r + aSecondary * color.g + aSkin * color.b;
  if (isHat > 0.5) {
    baseCol = aHat;
    if (aHasHat < 0.5) transformed *= 0.001;
  } else if (isHair > 0.5) {
    baseCol = aAccent;
  }
  vNpcColor = baseCol;
  vUseAtlasSample = isTorso * uUseAtlas;
  vAtlasUv = aAtlasRect.xy + uv * aAtlasRect.zw;

  float h = max(transformed.y, 0.0);
  if (state < 0.5) {
    transformed.y += sin(t * 2.2) * 0.012 * h;
  } else if (state < 1.5) {
    float bob = abs(sin(t * 8.0)) * 0.04;
    transformed.y += bob * step(0.2, h);
    transformed.z += sin(t * 8.0) * 0.015 * h;
  } else {
    float bowAmt = smoothstep(0.0, 0.35, animT) * (1.0 - smoothstep(1.1, 1.6, animT));
    float pivot = 0.85;
    float dy = transformed.y - pivot;
    float ang = bowAmt * 0.55;
    float ca = cos(ang);
    float sa = sin(ang);
    transformed.y = pivot + dy * ca;
    transformed.z = transformed.z + dy * sa;
  }
}
`,
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
uniform sampler2D uAtlas;
uniform float uUseAtlas;
varying vec3 vNpcColor;
varying float vUseAtlasSample;
varying vec2 vAtlasUv;
`,
      )
      .replace(
        '#include <color_fragment>',
        /* glsl */ `#include <color_fragment>
{
  vec3 col = vNpcColor;
  if (vUseAtlasSample > 0.5) {
    vec4 atl = texture2D(uAtlas, vAtlasUv);
    col = mix(col, atl.rgb, 0.85);
  }
  diffuseColor.rgb = col;
}
`,
      )

    mat.userData.shader = shader
  }

  mat.customProgramCacheKey = () => `npc-instanced-v4-atlas${atlas ? 1 : 0}`
  return mat
}

export function tickNpcMaterial(mat: THREE.Material, elapsed: number): void {
  const ud = (mat as THREE.MeshStandardMaterial).userData
  if (ud?.uTime) ud.uTime.value = elapsed
}
