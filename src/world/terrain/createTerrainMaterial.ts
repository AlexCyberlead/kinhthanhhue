import * as THREE from 'three'
import { getTextureSet, UV_REPEAT_METERS } from '../../core/materials/textures'

/**
 * Terrain splat: vertex color = (brick, dirt, grass) weights.
 * Maps come from the procedural factory — no extra PNG.
 *
 * UV on the heightfield is world metres / grass-cycle (8 m), so dirt/brick
 * sample with a scale offset (8 / their own cycle).
 *
 * Albedo is the splat; a single grass normal stays as a mild overlay so we
 * don't have to fork Three r170's tangent-space chunk.
 */
export function createTerrainMaterial(lod: 0 | 1 | 2): THREE.MeshStandardMaterial {
  const grass = getTextureSet('co', lod)
  const dirt = getTextureSet('dat', lod)
  const brick = getTextureSet('gachBatTrang', lod)

  const grassCycle = UV_REPEAT_METERS.co.u
  const dirtScale = grassCycle / UV_REPEAT_METERS.dat.u
  const brickScale = grassCycle / UV_REPEAT_METERS.gachBatTrang.u

  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: grass.map,
    roughness: 0.92,
    metalness: 0,
    vertexColors: true,
    envMapIntensity: lod === 0 ? 0.55 : 0.35,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })

  if (lod < 2 && grass.normalMap) {
    mat.normalMap = grass.normalMap
    mat.normalScale = new THREE.Vector2(0.48, 0.48)
  }
  if (lod < 2 && grass.roughnessMap) {
    mat.roughnessMap = grass.roughnessMap
  }

  mat.name = `terrain_splat::${lod}`
  mat.userData.splat = true

  const dirtMap = dirt.map
  const brickMap = brick.map

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uDirtMap = { value: dirtMap }
    shader.uniforms.uBrickMap = { value: brickMap }
    shader.uniforms.uDirtRepeat = { value: dirtScale }
    shader.uniforms.uBrickRepeat = { value: brickScale }

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <map_pars_fragment>',
        /* glsl */ `
        #include <map_pars_fragment>
        uniform sampler2D uDirtMap;
        uniform sampler2D uBrickMap;
        uniform float uDirtRepeat;
        uniform float uBrickRepeat;
        `,
      )
      .replace(
        '#include <map_fragment>',
        /* glsl */ `
        #ifdef USE_MAP
          vec3 splatW = vec3(0.0, 0.15, 0.85);
          #if defined( USE_COLOR_ALPHA ) || defined( USE_COLOR )
            splatW = vColor.rgb;
          #endif
          float splatSum = max(1e-4, splatW.r + splatW.g + splatW.b);
          splatW /= splatSum;
          vec4 grassTex = texture2D(map, vMapUv);
          vec4 dirtTex = texture2D(uDirtMap, vMapUv * uDirtRepeat);
          vec4 brickTex = texture2D(uBrickMap, vMapUv * uBrickRepeat);
          vec4 sampledDiffuseColor = brickTex * splatW.r + dirtTex * splatW.g + grassTex * splatW.b;
          diffuseColor *= sampledDiffuseColor;
        #endif
        `,
      )
      .replace(
        '#include <color_fragment>',
        /* glsl */ `
        // Splat weights already consumed in map_fragment — skip vColor multiply.
        `,
      )
  }

  mat.customProgramCacheKey = () => `terrain-splat-${lod}`
  return mat
}
