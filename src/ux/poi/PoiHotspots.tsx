import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { bootstrapMonuments } from '../../registry/registerAll'
import { useAppStore } from '../../state/appStore'
import type { MonumentModule } from '../../core/types/MonumentModule'
import { togglePoi } from './poiUrl'

const IDLE_COLOR = new THREE.Color('#E8DCC8')
const IDLE_EMISSIVE = new THREE.Color('#6E6E68')
const SELECTED_COLOR = new THREE.Color('#C9A227')
const SELECTED_EMISSIVE = new THREE.Color('#8B1A1A')
const HOVER_COLOR = new THREE.Color('#D4A017')

const markerGeo = new THREE.SphereGeometry(1.1, 12, 10)
const ringGeo = new THREE.RingGeometry(1.6, 2.15, 24)

type MarkerProps = {
  monument: MonumentModule
  selected: boolean
}

function PoiMarker({ monument, selected }: MarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const hovered = useRef(false)
  const baseY = monument.anchor[1] + Math.max(8, monument.boundingRadius * 0.22)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const mesh = meshRef.current
    const ring = ringRef.current
    const mat = matRef.current
    if (!mesh || !mat) return

    const bob = Math.sin(t * 1.6 + monument.anchor[0] * 0.01) * 0.35
    mesh.position.y = baseY + bob

    const pulse = selected ? 1.15 + Math.sin(t * 3.2) * 0.08 : hovered.current ? 1.08 : 1
    mesh.scale.setScalar(pulse)

    if (selected) {
      mat.color.copy(SELECTED_COLOR)
      mat.emissive.copy(SELECTED_EMISSIVE)
      mat.emissiveIntensity = 0.55 + Math.sin(t * 3.2) * 0.15
    } else if (hovered.current) {
      mat.color.copy(HOVER_COLOR)
      mat.emissive.copy(HOVER_COLOR)
      mat.emissiveIntensity = 0.35
    } else {
      mat.color.copy(IDLE_COLOR)
      mat.emissive.copy(IDLE_EMISSIVE)
      mat.emissiveIntensity = 0.18
    }

    if (ring) {
      ring.visible = selected
      ring.rotation.z = t * 0.6
      ring.position.y = baseY - 1.2 + bob * 0.3
    }
  })

  return (
    <group position={[monument.anchor[0], 0, monument.anchor[2]]}>
      <mesh
        ref={meshRef}
        geometry={markerGeo}
        position={[0, baseY, 0]}
        onClick={(e) => {
          e.stopPropagation()
          togglePoi(monument.id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          hovered.current = true
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          hovered.current = false
          document.body.style.cursor = 'auto'
        }}
      >
        <meshStandardMaterial
          ref={matRef}
          color={IDLE_COLOR}
          emissive={IDLE_EMISSIVE}
          emissiveIntensity={0.18}
          roughness={0.45}
          metalness={0.25}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ringRef} geometry={ringGeo} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <meshBasicMaterial
          color="#C9A227"
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

/**
 * Clickable 3D POI markers on monument anchors — mount inside `<Canvas>`.
 */
export function PoiHotspots(): JSX.Element {
  const monuments = useMemo(() => bootstrapMonuments(), [])
  const selectedPoiId = useAppStore((s) => s.selectedPoiId)

  return (
    <group name="poi-hotspots">
      {monuments.map((m) => (
        <PoiMarker key={m.id} monument={m} selected={selectedPoiId === m.id} />
      ))}
    </group>
  )
}
