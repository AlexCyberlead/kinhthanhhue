import { useEffect, useMemo, useRef, type JSX } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../../state/appStore'
import { animStateCode, spawnAgents, tickAgents } from './agents'
import { tryGetCostumeAtlasTexture } from './costumeResolve'
import { getNpcGeometry } from './geometry'
import { createNpcMaterial, tickNpcMaterial } from './material'
import type { NpcAgent, NpcSystemProps } from './types'

const _dummy = new THREE.Object3D()

function writeColorAttrs(
  agents: NpcAgent[],
  attrs: {
    primary: Float32Array
    secondary: Float32Array
    accent: Float32Array
    skin: Float32Array
    hat: Float32Array
    hasHat: Float32Array
    anim: Float32Array
    atlasRect: Float32Array
  },
): void {
  for (let i = 0; i < agents.length; i++) {
    const a = agents[i]!
    const i3 = i * 3
    const i4 = i * 4
    attrs.primary[i3] = a.primary[0]
    attrs.primary[i3 + 1] = a.primary[1]
    attrs.primary[i3 + 2] = a.primary[2]
    attrs.secondary[i3] = a.secondary[0]
    attrs.secondary[i3 + 1] = a.secondary[1]
    attrs.secondary[i3 + 2] = a.secondary[2]
    attrs.accent[i3] = a.accent[0]
    attrs.accent[i3 + 1] = a.accent[1]
    attrs.accent[i3 + 2] = a.accent[2]
    attrs.skin[i3] = a.skin[0]
    attrs.skin[i3 + 1] = a.skin[1]
    attrs.skin[i3 + 2] = a.skin[2]
    attrs.hat[i3] = a.hat[0]
    attrs.hat[i3 + 1] = a.hat[1]
    attrs.hat[i3 + 2] = a.hat[2]
    attrs.hasHat[i] = a.hasHat
    attrs.anim[i3] = animStateCode(a.anim)
    attrs.anim[i3 + 1] = a.phase
    attrs.anim[i3 + 2] = a.animT
    attrs.atlasRect[i4] = a.atlasRect[0]
    attrs.atlasRect[i4 + 1] = a.atlasRect[1]
    attrs.atlasRect[i4 + 2] = a.atlasRect[2]
    attrs.atlasRect[i4 + 3] = a.atlasRect[3]
  }
}

/**
 * Instanced NPC crowd — 1 draw call (≤ 6 budget), default ≥ 300 instances.
 */
export function NpcSystem(props: NpcSystemProps = {}): JSX.Element {
  const { count = 300 } = props
  const quality = useAppStore((s) => s.quality)
  const castShadow = quality === 'high' || quality === 'ultra'

  const meshRef = useRef<THREE.InstancedMesh>(null)
  const agentsRef = useRef<NpcAgent[]>([])
  const attrsRef = useRef<{
    primary: Float32Array
    secondary: Float32Array
    accent: Float32Array
    skin: Float32Array
    hat: Float32Array
    hasHat: Float32Array
    anim: Float32Array
    atlasRect: Float32Array
  } | null>(null)

  const { geometry, material } = useMemo(() => {
    const geometry = getNpcGeometry().clone()
    const atlas = tryGetCostumeAtlasTexture()
    const material = createNpcMaterial({ atlas })
    return { geometry, material }
  }, [])

  useEffect(() => {
    const agents = spawnAgents(count)
    agentsRef.current = agents

    const primary = new Float32Array(count * 3)
    const secondary = new Float32Array(count * 3)
    const accent = new Float32Array(count * 3)
    const skin = new Float32Array(count * 3)
    const hat = new Float32Array(count * 3)
    const hasHat = new Float32Array(count)
    const anim = new Float32Array(count * 3)
    const atlasRect = new Float32Array(count * 4)
    const attrs = { primary, secondary, accent, skin, hat, hasHat, anim, atlasRect }
    attrsRef.current = attrs

    geometry.setAttribute('aPrimary', new THREE.InstancedBufferAttribute(primary, 3))
    geometry.setAttribute('aSecondary', new THREE.InstancedBufferAttribute(secondary, 3))
    geometry.setAttribute('aAccent', new THREE.InstancedBufferAttribute(accent, 3))
    geometry.setAttribute('aSkin', new THREE.InstancedBufferAttribute(skin, 3))
    geometry.setAttribute('aHat', new THREE.InstancedBufferAttribute(hat, 3))
    geometry.setAttribute('aHasHat', new THREE.InstancedBufferAttribute(hasHat, 1))
    geometry.setAttribute('aAnim', new THREE.InstancedBufferAttribute(anim, 3))
    geometry.setAttribute('aAtlasRect', new THREE.InstancedBufferAttribute(atlasRect, 4))

    writeColorAttrs(agents, attrs)
    for (const key of [
      'aPrimary',
      'aSecondary',
      'aAccent',
      'aSkin',
      'aHat',
      'aHasHat',
      'aAnim',
      'aAtlasRect',
    ] as const) {
      ;(geometry.getAttribute(key) as THREE.InstancedBufferAttribute).needsUpdate = true
    }

    const mesh = meshRef.current
    if (mesh) {
      for (let i = 0; i < agents.length; i++) {
        const a = agents[i]!
        _dummy.position.set(a.x, 0, a.z)
        _dummy.rotation.set(0, a.rotY, 0)
        _dummy.scale.setScalar(a.scale)
        _dummy.updateMatrix()
        mesh.setMatrixAt(i, _dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
      mesh.count = agents.length
    }
  }, [count, geometry])

  useEffect(() => {
    return () => {
      material.dispose()
      geometry.dispose()
    }
  }, [material, geometry])

  useFrame(({ clock }, delta) => {
    tickNpcMaterial(material, clock.elapsedTime)
    const agents = agentsRef.current
    const attrs = attrsRef.current
    const mesh = meshRef.current
    if (!agents.length || !attrs || !mesh) return

    const dt = Math.min(delta, 0.05)
    tickAgents(agents, dt, clock.elapsedTime)

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i]!
      _dummy.position.set(a.x, 0, a.z)
      _dummy.rotation.set(0, a.rotY, 0)
      _dummy.scale.setScalar(a.scale)
      _dummy.updateMatrix()
      mesh.setMatrixAt(i, _dummy.matrix)

      const i3 = i * 3
      attrs.anim[i3] = animStateCode(a.anim)
      attrs.anim[i3 + 1] = a.phase
      attrs.anim[i3 + 2] = a.animT
    }
    mesh.instanceMatrix.needsUpdate = true
    ;(mesh.geometry.getAttribute('aAnim') as THREE.InstancedBufferAttribute).needsUpdate =
      true
  })

  return (
    <group name="NpcSystem" userData={{ instanceCount: count, drawCalls: 1 }}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, Math.max(count, 1)]}
        castShadow={castShadow}
        receiveShadow
        frustumCulled={false}
      />
    </group>
  )
}
