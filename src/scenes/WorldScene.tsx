import { useMemo } from 'react'
import { bootstrapMonuments } from '../registry/registerAll'
import { WaterSystem } from '../world/water'
import { TerrainSystem } from '../world/terrain'
import { CitadelWalls } from '../world/citadel'
import { SkySystem } from '../world/sky'
import { VegetationSystem } from '../world/vegetation'
import { GroundworkSystem } from '../world/groundwork'
import { ImperialWalls } from '../monuments/imperial'
import { TuCamWalls } from '../monuments/tucam'
import { AudioSystem } from '../world/audio'
import { AtmosphereSystem } from '../world/atmosphere'
import { PostFX } from '../world/postfx'
import { NpcSystem } from '../world/npc'
import { PropsSystem } from '../world/props'
import { PoiHotspots } from '../ux/poi'
import { CameraController } from '../ux/camera'
import { TourController } from '../ux/tour'

/**
 * World scene — orchestrator wires wave systems + registered monuments.
 */
export function WorldScene() {
  const monumentGroups = useMemo(() => {
    return bootstrapMonuments().map((m) => {
      const group = m.build(1)
      group.position.set(...m.anchor)
      group.rotation.y = m.rotationY
      return { id: m.id, group }
    })
  }, [])

  return (
    <>
      <SkySystem />
      <TerrainSystem />
      <CitadelWalls lod={1} />
      <ImperialWalls lod={1} />
      <TuCamWalls lod={1} />
      <WaterSystem />
      <GroundworkSystem lod={1} />
      <VegetationSystem density={1} />
      <NpcSystem count={300} />
      <PropsSystem lod={1} />
      <AtmosphereSystem />
      <AudioSystem />
      <PostFX />
      <PoiHotspots />

      {monumentGroups.map(({ id, group }) => (
        <primitive key={id} object={group} />
      ))}

      <CameraController />
      <TourController />
    </>
  )
}
