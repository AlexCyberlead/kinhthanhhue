import { WORLD } from '../../data/worldConfig'
import { SPECIES, SPECIES_ORDER } from './species'
import type { Placement, VegetationSpeciesId } from './types'

/** Deterministic LCG — cùng density → cùng layout. */
function createRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 4294967296
  }
}

function randRange(rng: () => number, a: number, b: number): number {
  return a + (b - a) * rng()
}

type RectZone = {
  cx: number
  cz: number
  hx: number
  hz: number
  y?: number
}

type RingZone = {
  halfOuter: number
  halfInner: number
  y?: number
}

type DiskZone = {
  cx: number
  cz: number
  radius: number
  y?: number
}

/** Zones ước lượng — khớp WORLD landmarks + research nature_people. */
const ZONES = {
  /** Hào / mép Kinh thành — tre clumps. */
  moat: { halfOuter: 1180, halfInner: 1080, y: 0 } satisfies RingZone,
  /** Quanh Kỳ Đài. */
  kyDai: {
    cx: WORLD.landmarks.kyDai[0],
    cz: WORLD.landmarks.kyDai[2],
    radius: 140,
    y: 0,
  } satisfies DiskZone,
  /** Hai bên trục thần đạo — tránh mặt hồ Thái Dịch (z≈55). */
  axisEast: { cx: 44, cz: 40, hx: 14, hz: 110, y: 0 } satisfies RectZone,
  axisWest: { cx: -44, cz: 40, hx: 14, hz: 110, y: 0 } satisfies RectZone,
  /** Vườn Thiệu Phương (Đông nội đình) — ước lượng. */
  thieuPhuong: { cx: 140, cz: -210, hx: 70, hz: 55, y: 0 } satisfies RectZone,
  /** Vườn Cơ Hạ (Tây) — ước lượng. */
  coHa: { cx: -150, cz: -230, hx: 65, hz: 50, y: 0 } satisfies RectZone,
  /** Hồ Thái Dịch (trước Ngọ Môn / sân triều). */
  hoThaiDich: { cx: 0, cz: 55, hx: 70, hz: 28, y: 0.05 } satisfies RectZone,
  /** Hồ Tịnh Tâm — Bắc/Đông-Bắc Hoàng thành [220, −620], 280×180. */
  hoTinhTam: { cx: 220, cz: -620, hx: 140, hz: 90, y: 0.05 } satisfies RectZone,
  hoTinhTamShore: { cx: 220, cz: -620, hx: 148, hz: 98, y: 0 } satisfies RectZone,
  /** Ao Liên Trì trong vườn — ước lượng. */
  aoLienTri: { cx: 130, cz: -200, hx: 22, hz: 16, y: 0.05 } satisfies RectZone,
  /** Ngoài tường / đường phố — phượng, nhãn. */
  urbanSouth: { cx: 0, cz: 520, hx: 280, hz: 80, y: 0 } satisfies RectZone,
  urbanEast: { cx: 380, cz: -100, hx: 80, hz: 220, y: 0 } satisfies RectZone,
  urbanWest: { cx: -380, cz: -100, hx: 80, hz: 220, y: 0 } satisfies RectZone,
  /** Giả sơn / góc vườn — thông điểm. */
  giaSon: { cx: -160, cz: -260, hx: 40, hz: 30, y: 0 } satisfies RectZone,
  mieuCorner: {
    cx: WORLD.landmarks.theToMieu[0],
    cz: WORLD.landmarks.theToMieu[2],
    radius: 50,
    y: 0,
  } satisfies DiskZone,
}

const TINH_ISLANDS: Array<{ cx: number; cz: number; hx: number; hz: number }> = [
  { cx: 220, cz: -575, hx: 24, hz: 18 },
  { cx: 285, cz: -655, hx: 16, hz: 13 },
  { cx: 155, cz: -658, hx: 14, hz: 12 },
]

function onTinhIsland(x: number, z: number): boolean {
  for (const i of TINH_ISLANDS) {
    if (Math.abs(x - i.cx) < i.hx && Math.abs(z - i.cz) < i.hz) return true
  }
  return false
}

function inThaiDich(x: number, z: number): boolean {
  return (
    Math.abs(x - ZONES.hoThaiDich.cx) < ZONES.hoThaiDich.hx - 6 &&
    Math.abs(z - ZONES.hoThaiDich.cz) < ZONES.hoThaiDich.hz + 1
  )
}

function inTinhTamWaterXZ(x: number, z: number): boolean {
  if (onTinhIsland(x, z)) return false
  const u = Math.abs(x - ZONES.hoTinhTam.cx) / ZONES.hoTinhTam.hx
  const v = Math.abs(z - ZONES.hoTinhTam.cz) / ZONES.hoTinhTam.hz
  return Math.max(u, v) < 0.9
}

function inLienTri(x: number, z: number): boolean {
  return (
    Math.abs(x - ZONES.aoLienTri.cx) < ZONES.aoLienTri.hx &&
    Math.abs(z - ZONES.aoLienTri.cz) < ZONES.aoLienTri.hz
  )
}

function inWaterBody(x: number, z: number): boolean {
  return inThaiDich(x, z) || inTinhTamWaterXZ(x, z) || inLienTri(x, z)
}

/** Thần đạo + mặt hồ — cây cạn không được đứng đây. */
function onThanDao(x: number, z: number): boolean {
  return Math.abs(x) < 9 && z > -220 && z < 175
}

function sampleLand(rng: () => number, fn: ZoneSampler): Placement {
  for (let i = 0; i < 12; i++) {
    const p = fn(rng)
    if (!inWaterBody(p.x, p.z) && !onThanDao(p.x, p.z)) return p
  }
  const p = fn(rng)
  if (onThanDao(p.x, p.z)) p.x += p.x >= 0 ? 16 : -16
  if (inThaiDich(p.x, p.z)) p.z = ZONES.hoThaiDich.cz + ZONES.hoThaiDich.hz + 14
  if (inTinhTamWaterXZ(p.x, p.z)) p.x = ZONES.hoTinhTam.cx + ZONES.hoTinhTam.hx + 6
  return p
}

/** Bờ hồ — trong vành, ngoài mặt nước lõi. */
function inTinhTamShore(rng: () => number): Placement {
  const z = ZONES.hoTinhTamShore
  for (let k = 0; k < 8; k++) {
    const p = inRect(rng, z)
    const u = Math.abs(p.x - z.cx) / ZONES.hoTinhTam.hx
    const v = Math.abs(p.z - z.cz) / ZONES.hoTinhTam.hz
    const r = Math.max(u, v)
    if (r > 0.82 && r < 1.08 && !onTinhIsland(p.x, p.z)) return p
  }
  return { x: z.cx + z.hx, y: 0, z: z.cz, rotY: 0, scale: 1 }
}

function inTinhTamWater(rng: () => number): Placement {
  for (let k = 0; k < 8; k++) {
    const p = inRect(rng, ZONES.hoTinhTam)
    if (!onTinhIsland(p.x, p.z)) {
      const u = Math.abs(p.x - ZONES.hoTinhTam.cx) / ZONES.hoTinhTam.hx
      const v = Math.abs(p.z - ZONES.hoTinhTam.cz) / ZONES.hoTinhTam.hz
      if (Math.max(u, v) < 0.88) return p
    }
  }
  return inRect(rng, ZONES.hoThaiDich)
}

function inRect(rng: () => number, z: RectZone): Placement {
  return {
    x: randRange(rng, z.cx - z.hx, z.cx + z.hx),
    y: z.y ?? 0,
    z: randRange(rng, z.cz - z.hz, z.cz + z.hz),
    rotY: rng() * Math.PI * 2,
    scale: randRange(rng, 0.82, 1.18),
  }
}

function inDisk(rng: () => number, z: DiskZone): Placement {
  const a = rng() * Math.PI * 2
  const r = Math.sqrt(rng()) * z.radius
  return {
    x: z.cx + Math.cos(a) * r,
    y: z.y ?? 0,
    z: z.cz + Math.sin(a) * r,
    rotY: rng() * Math.PI * 2,
    scale: randRange(rng, 0.85, 1.2),
  }
}

/** Điểm trên vành vuông giữa halfInner–halfOuter. */
function inSquareRing(rng: () => number, z: RingZone): Placement {
  const edge = (rng() * 4) | 0
  const t = rng()
  const outer = z.halfOuter
  const inner = z.halfInner
  const depth = randRange(rng, inner, outer)
  let x = 0
  let zz = 0
  if (edge === 0) {
    x = randRange(rng, -depth, depth)
    zz = depth * (t > 0.5 ? 1 : -1)
  } else if (edge === 1) {
    zz = randRange(rng, -depth, depth)
    x = depth * (t > 0.5 ? 1 : -1)
  } else if (edge === 2) {
    x = randRange(rng, -outer, outer)
    zz = randRange(rng, inner, outer) * (rng() > 0.5 ? 1 : -1)
  } else {
    zz = randRange(rng, -outer, outer)
    x = randRange(rng, inner, outer) * (rng() > 0.5 ? 1 : -1)
  }
  return {
    x,
    y: z.y ?? 0,
    z: zz,
    rotY: rng() * Math.PI * 2,
    scale: randRange(rng, 0.8, 1.25),
  }
}

type ZoneSampler = (rng: () => number) => Placement

function pickWeighted(rng: () => number, items: { w: number; fn: ZoneSampler }[]): Placement {
  let total = 0
  for (const it of items) total += it.w
  let r = rng() * total
  for (const it of items) {
    r -= it.w
    if (r <= 0) return it.fn(rng)
  }
  return items[items.length - 1]!.fn(rng)
}

const SPECIES_SAMPLERS: Record<VegetationSpeciesId, ZoneSampler> = {
  tree_tre: (rng) =>
    sampleLand(rng, (r) =>
      pickWeighted(r, [
        { w: 7, fn: (s) => inSquareRing(s, ZONES.moat) },
        { w: 2, fn: () => inTinhTamShore(rng) },
        { w: 1, fn: (s) => inRect(s, ZONES.coHa) },
      ]),
    ),

  tree_phuong_vi: (rng) =>
    sampleLand(rng, (r) =>
      pickWeighted(r, [
        { w: 4, fn: (s) => inDisk(s, ZONES.kyDai) },
        { w: 3, fn: (s) => inRect(s, ZONES.urbanSouth) },
        { w: 2, fn: (s) => inRect(s, ZONES.urbanEast) },
        { w: 1, fn: (s) => inRect(s, ZONES.urbanWest) },
      ]),
    ),

  tree_nhan: (rng) =>
    sampleLand(rng, (r) =>
      pickWeighted(r, [
        { w: 3, fn: (s) => inRect(s, ZONES.urbanSouth) },
        { w: 2, fn: (s) => inRect(s, ZONES.urbanEast) },
        { w: 2, fn: (s) => inRect(s, ZONES.urbanWest) },
        { w: 2, fn: (s) => inDisk(s, ZONES.kyDai) },
        { w: 1, fn: (s) => inRect(s, ZONES.thieuPhuong) },
      ]),
    ),

  tree_ngo_dong: (rng) =>
    sampleLand(rng, (r) =>
      pickWeighted(r, [
        { w: 4, fn: (s) => inRect(s, ZONES.axisEast) },
        { w: 4, fn: (s) => inRect(s, ZONES.axisWest) },
        { w: 1, fn: (s) => inDisk(s, { cx: 0, cz: -40, radius: 35, y: 0 }) },
      ]),
    ),

  tree_su_dai: (rng) =>
    sampleLand(rng, (r) =>
      pickWeighted(r, [
        { w: 4, fn: (s) => inRect(s, ZONES.thieuPhuong) },
        { w: 3, fn: (s) => inRect(s, ZONES.coHa) },
        { w: 2, fn: (s) => inDisk(s, ZONES.mieuCorner) },
        { w: 1, fn: (s) => inDisk(s, ZONES.kyDai) },
      ]),
    ),

  plant_sen: (rng) =>
    pickWeighted(rng, [
      { w: 6, fn: () => inTinhTamWater(rng) },
      { w: 3, fn: (r) => inRect(r, ZONES.hoThaiDich) },
      { w: 2, fn: (r) => inRect(r, ZONES.aoLienTri) },
    ]),

  plant_sung: (rng) =>
    pickWeighted(rng, [
      { w: 4, fn: () => inTinhTamWater(rng) },
      { w: 3, fn: (r) => inRect(r, ZONES.hoThaiDich) },
      { w: 2, fn: (r) => inSquareRing(r, { halfOuter: 1120, halfInner: 1090, y: 0.04 }) },
    ]),

  tree_thong: (rng) =>
    sampleLand(rng, (r) =>
      pickWeighted(r, [
        { w: 5, fn: (s) => inRect(s, ZONES.giaSon) },
        { w: 3, fn: (s) => inDisk(s, ZONES.mieuCorner) },
        { w: 2, fn: (s) => inRect(s, ZONES.coHa) },
      ]),
    ),
}

export type SpeciesPlacements = {
  id: VegetationSpeciesId
  /** LOD near (0/1) — gần gốc world. */
  near: Placement[]
  /** LOD far (2). */
  far: Placement[]
}

const NEAR_DIST = 380

/**
 * Sinh placements theo zone; chia near/far theo khoảng cách tới gốc (0,0).
 */
export function generatePlacements(density = 1): SpeciesPlacements[] {
  const d = Math.max(0.05, density)
  const out: SpeciesPlacements[] = []

  for (const id of SPECIES_ORDER) {
    const def = SPECIES[id]
    const count = Math.max(1, Math.round(def.baseCount * d))
    const rng = createRng(hashId(id) ^ Math.round(d * 1000))
    const sampler = SPECIES_SAMPLERS[id]
    const near: Placement[] = []
    const far: Placement[] = []
    const waterY = def.waterY

    for (let i = 0; i < count; i++) {
      const p = sampler(rng)
      if (waterY !== undefined) {
        p.y = waterY
        p.scale = randRange(rng, 0.75, 1.15)
      }
      const dist = Math.hypot(p.x, p.z)
      if (dist < NEAR_DIST) near.push(p)
      else far.push(p)
    }

    // Đảm bảo mỗi LOD bucket có ≥1 nếu tổng >1 — tránh InstancedMesh count=0.
    if (near.length === 0 && far.length > 0) {
      near.push(far.pop()!)
    }
    if (far.length === 0 && near.length > 1) {
      far.push(near.pop()!)
    }

    out.push({ id, near, far })
  }

  return out
}

function hashId(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function countInstances(placements: SpeciesPlacements[]): number {
  return placements.reduce((s, p) => s + p.near.length + p.far.length, 0)
}
