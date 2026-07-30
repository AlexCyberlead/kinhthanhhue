import { useMemo } from 'react'
import { OrbitControls } from '@react-three/drei'
import { WORLD } from '../data/worldConfig'
import { listMonuments } from '../registry/monuments'
import { getMaterial } from '../core/materials/MaterialLibrary'
import { buildGate } from '../core/geometry/kit'

/**
 * Bootstrap world: ground plane + placeholder Ngọ Môn from architecture kit.
 * Wave agents will replace/extend this scene.
 */
export function WorldScene() {
  const groundMat = useMemo(() => getMaterial('co_xanh'), [])
  const plazaMat = useMemo(() => getMaterial('gach_bat_trang'), [])
  const ngoMon = useMemo(() => {
    const g = buildGate({ type: 'ngo-mon', lod: 1 })
    const [x, y, z] = WORLD.landmarks.ngoMon
    g.position.set(x, y, z)
    return g
  }, [])

  const monuments = listMonuments()

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[4000, 4000]} />
        <primitive object={groundMat} attach="material" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.02, 0]}>
        <planeGeometry args={[80, 120]} />
        <primitive object={plazaMat} attach="material" />
      </mesh>

      <primitive object={ngoMon} />

      {monuments.map((m) => {
        const group = m.build(1)
        group.position.set(...m.anchor)
        group.rotation.y = m.rotationY
        return <primitive key={m.id} object={group} />
      })}

      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI * 0.49}
        minDistance={20}
        maxDistance={2500}
        target={[0, 10, 80]}
      />
    </>
  )
}
