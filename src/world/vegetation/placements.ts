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
  /** Hai bên trục thần đạo (Ngọ Môn → Thái Hòa). */
  axisEast: { cx: 38, cz: 40, hx: 22, hz: 110, y: 0 } satisfies RectZone,
  axisWest: { cx: -38, cz: 40, hx: 22, hz: 110, y: 0 } satisfies RectZone,
  /** Vườn Thiệu Phương (Đông nội đình) — ước lượng. */
  thieuPhuong: { cx: 140, cz: -210, hx: 70, hz: 55, y: 0 } satisfies RectZone,
  /** Vườn Cơ Hạ (Tây) — ước lượng. */
  coHa: { cx: -150, cz: -230, hx: 65, hz: 50, y: 0 } satisfies RectZone,
  /** Hồ Thái Dịch (trước Ngọ Môn / sân triều). */
  hoThaiDich: { cx: 0, cz: 55, hx: 70, hz: 28, y: 0.05 } satisfies RectZone,
  /** Hồ Tịnh Tâm — NE ngoài Hoàng thành (ước lượng). */
  hoTinhTam: { cx: 220, cz: -520, hx: 110, hz: 75, y: 0.05 } satisfies RectZone,
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
    pickWeighted(rng, [
      { w: 7, fn: (r) => inSquareRing(r, ZONES.moat) },
      { w: 2, fn: (r) => inRect(r, ZONES.hoTinhTam) },
      { w: 1, fn: (r) => inRect(r, ZONES.coHa) },
    ]),

  tree_phuong_vi: (rng) =>
    pickWeighted(rng, [
      { w: 4, fn: (r) => inDisk(r, ZONES.kyDai) },
      { w: 3, fn: (r) => inRect(r, ZONES.urbanSouth) },
      { w: 2, fn: (r) => inRect(r, ZONES.urbanEast) },
      { w: 1, fn: (r) => inRect(r, ZONES.urbanWest) },
    ]),

  tree_nhan: (rng) =>
    pickWeighted(rng, [
      { w: 3, fn: (r) => inRect(r, ZONES.urbanSouth) },
      { w: 2, fn: (r) => inRect(r, ZONES.urbanEast) },
      { w: 2, fn: (r) => inRect(r, ZONES.urbanWest) },
      { w: 2, fn: (r) => inDisk(r, ZONES.kyDai) },
      { w: 1, fn: (r) => inRect(r, ZONES.thieuPhuong) },
    ]),

  tree_ngo_dong: (rng) =>
    pickWeighted(rng, [
      { w: 4, fn: (r) => inRect(r, ZONES.axisEast) },
      { w: 4, fn: (r) => inRect(r, ZONES.axisWest) },
      { w: 1, fn: (r) => inDisk(r, { cx: 0, cz: -40, radius: 35, y: 0 }) },
    ]),

  tree_su_dai: (rng) =>
    pickWeighted(rng, [
      { w: 4, fn: (r) => inRect(r, ZONES.thieuPhuong) },
      { w: 3, fn: (r) => inRect(r, ZONES.coHa) },
      { w: 2, fn: (r) => inDisk(r, ZONES.mieuCorner) },
      { w: 1, fn: (r) => inDisk(r, ZONES.kyDai) },
    ]),

  plant_sen: (rng) =>
    pickWeighted(rng, [
      { w: 6, fn: (r) => inRect(r, ZONES.hoTinhTam) },
      { w: 3, fn: (r) => inRect(r, ZONES.hoThaiDich) },
      { w: 2, fn: (r) => inRect(r, ZONES.aoLienTri) },
    ]),

  plant_sung: (rng) =>
    pickWeighted(rng, [
      { w: 4, fn: (r) => inRect(r, { ...ZONES.hoTinhTam, hx: 120, hz: 85 }) },
      { w: 3, fn: (r) => inRect(r, ZONES.hoThaiDich) },
      { w: 2, fn: (r) => inSquareRing(r, { halfOuter: 1120, halfInner: 1090, y: 0.04 }) },
    ]),

  tree_thong: (rng) =>
    pickWeighted(rng, [
      { w: 5, fn: (r) => inRect(r, ZONES.giaSon) },
      { w: 3, fn: (r) => inDisk(r, ZONES.mieuCorner) },
      { w: 2, fn: (r) => inRect(r, ZONES.coHa) },
    ]),
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
