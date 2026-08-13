import * as THREE from 'three'
import { getMaterial } from '../../../materials/MaterialLibrary'
import {
  dragonOrnamentGeo,
  gourdOrnamentGeo,
  phoenixOrnamentGeo,
  sunOrnamentGeo,
} from '../ornament'
import { sampleRoof } from './math'
import { meshOf } from './merge'
import type { RidgeKind, RoofFrame } from './types'

function placeOnRidge(mesh: THREE.Object3D, f: RoofFrame, t: number, yExtra: number, yaw: number): void {
  const s = (t * 2 - 1) * f.ridgeHalf
  const x = f.ridgeAlongX ? s : 0
  const z = f.ridgeAlongX ? 0 : s
  const p = sampleRoof(x, z, f, 1, 1)
  mesh.position.set(p.x, p.y + yExtra, p.z)
  mesh.rotation.y = (f.ridgeAlongX ? 0 : Math.PI / 2) + yaw
}

function ornamentScale(f: RoofFrame): number {
  return THREE.MathUtils.clamp(Math.min(f.halfW, f.halfD) * 0.16, 0.55, 2.15)
}

/**
 * Con giống bờ nóc. LOD0 đọc được; LOD1 giản; LOD2 bỏ.
 * Không capsule + sphere.
 */
export function buildRidgeOrnaments(f: RoofFrame, kind: RidgeKind): THREE.Group | null {
  if (kind === 'none' || f.lod === 2) return null
  const lod: 0 | 1 = f.lod === 0 ? 0 : 1
  const scale = ornamentScale(f)
  const gold = getMaterial('vang_thep', f.lod)
  const lam = getMaterial('phap_lam', f.lod)
  const g = new THREE.Group()
  g.name = 'roof-ornaments'

  if (kind === 'long-chau-nhat') {
    const geo = dragonOrnamentGeo(scale, lod)
    if (geo) {
      const left = new THREE.Mesh(geo, gold)
      left.name = 'rong-trai'
      left.castShadow = true
      placeOnRidge(left, f, 0.28, 0.08 * scale, 0)
      const right = new THREE.Mesh(geo, gold)
      right.name = 'rong-phai'
      right.castShadow = true
      placeOnRidge(right, f, 0.72, 0.08 * scale, Math.PI)
      g.add(left, right)
    }
    const sun = meshOf(sunOrnamentGeo(scale, lod), lam, 'nhat')
    if (sun) {
      placeOnRidge(sun, f, 0.5, 0.22 * scale, 0)
      if (f.ridgeAlongX) sun.rotation.x = Math.PI / 2
      else {
        sun.rotation.x = Math.PI / 2
        sun.rotation.z = Math.PI / 2
      }
      g.add(sun)
    }
  } else if (kind === 'phuong') {
    const geo = phoenixOrnamentGeo(scale, lod)
    if (geo) {
      const a = new THREE.Mesh(geo, gold)
      a.castShadow = true
      placeOnRidge(a, f, 0.22, 0.1 * scale, Math.PI)
      const b = new THREE.Mesh(geo, gold)
      b.castShadow = true
      placeOnRidge(b, f, 0.78, 0.1 * scale, 0)
      g.add(a, b)
    }
  } else {
    const count = lod === 0 ? 5 : 3
    const segs = lod === 0 ? 10 : 6
    const base = gourdOrnamentGeo(scale * 0.85, segs)
    const inst = new THREE.InstancedMesh(base, lam, count)
    inst.name = 'bau-phap-lam'
    inst.castShadow = true
    const dummy = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1)
      const mid = Math.abs(t - 0.5) < 0.01
      const s = (t * 2 - 1) * f.ridgeHalf
      const x = f.ridgeAlongX ? s : 0
      const z = f.ridgeAlongX ? 0 : s
      const p = sampleRoof(x, z, f, 1, 1)
      dummy.position.set(p.x, p.y + 0.04, p.z)
      dummy.scale.setScalar(mid ? 1.15 : 0.85)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    }
    inst.instanceMatrix.needsUpdate = true
    g.add(inst)
  }

  return g.children.length ? g : null
}
