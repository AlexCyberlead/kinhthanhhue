/**
 * Wave integration helpers — orchestrator-owned.
 * Sub-agents export modules; this file wires them after each wave.
 */
import { registerMonument, listMonuments } from './monuments'
import type { MonumentModule } from '../core/types/MonumentModule'
import { citadelGateModules, thuyQuanModules } from '../monuments/gates'
import { kyDai, phuVanLau, nghinhLuongDinh } from '../monuments/kydai'
import { vuModules } from '../monuments/vu'
import { cungModules } from '../monuments/cung'
import { imperialGateModules } from '../monuments/imperial'
import { theMieuModules } from '../monuments/themieu'
import { truongLangModules } from '../monuments/truonglang'
import { thaiHoaModules } from '../monuments/thaihoa'
import { daiTrieuModules } from '../monuments/daitrieu'
import { ancestralMieuModules } from '../monuments/mieu'
import { vuonModules } from '../monuments/vuon'
import { ngoMonModules } from '../monuments/ngomon'
import { daiCungMon } from '../monuments/tucam'
import { noiCungModules } from '../monuments/noicung'
import { duyetThiModules } from '../monuments/duyetthi'
import { hoangThanhModules } from '../monuments/hoangthanh'
import { tinhTamModules } from '../monuments/tinhtam'

let bootstrapped = false

export function registerAll(modules: MonumentModule[]): void {
  for (const m of modules) registerMonument(m)
}

/** Idempotent — call once before reading listMonuments(). */
export function bootstrapMonuments(): MonumentModule[] {
  if (!bootstrapped) {
    // Skip cot-co (embedded in ky-dai).
    // Skip tuong-hoang-thanh / tuong-tu-cam — walls via <ImperialWalls/> / <TuCamWalls/>.
    registerAll([
      ...citadelGateModules,
      ...thuyQuanModules,
      kyDai,
      phuVanLau,
      nghinhLuongDinh,
      ...ngoMonModules,
      ...thaiHoaModules,
      ...daiTrieuModules,
      ...imperialGateModules,
      ...theMieuModules,
      ...ancestralMieuModules,
      ...cungModules,
      ...truongLangModules,
      ...vuModules,
      ...vuonModules,
      daiCungMon,
      ...noiCungModules,
      ...duyetThiModules,
      ...hoangThanhModules,
      ...tinhTamModules,
    ])
    bootstrapped = true
  }
  return listMonuments()
}
