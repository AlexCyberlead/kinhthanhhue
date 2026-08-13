import * as THREE from 'three'

export type Season = 'xuan' | 'ha' | 'thu' | 'dong'

const _sun = new THREE.Vector3()
const _moon = new THREE.Vector3()

/** Hue ≈ 16.5°N — stylized solar orbit (1 unit direction). */
export function sunDirectionFromTime(timeOfDay: number, out = _sun): THREE.Vector3 {
  const t = ((timeOfDay % 24) + 24) % 24
  // a=0 sunrise (E), π/2 noon (zenith), π sunset (W), 3π/2 midnight (nadir)
  const a = (t / 24) * Math.PI * 2 - Math.PI / 2
  const x = Math.cos(a)
  const y = Math.sin(a)
  const z = Math.max(0, y) * 0.28 // slight south bias when elevated (+Z = Nam)
  return out.set(x, y, z).normalize()
}

export function moonDirectionFromTime(timeOfDay: number, out = _moon): THREE.Vector3 {
  return sunDirectionFromTime(timeOfDay, out).multiplyScalar(-1)
}

/** 1 = full day, 0 = full night. Soft edges around sunrise/sunset. */
export function dayFactor(timeOfDay: number): number {
  const y = sunDirectionFromTime(timeOfDay).y
  return THREE.MathUtils.smoothstep(y, -0.05, 0.22)
}

export function isNight(timeOfDay: number): boolean {
  return dayFactor(timeOfDay) < 0.35
}

export function twilightFactor(timeOfDay: number): number {
  const y = sunDirectionFromTime(timeOfDay).y
  // peak near horizon crossings
  const nearHorizon = 1 - Math.min(1, Math.abs(y) / 0.35)
  return THREE.MathUtils.clamp(nearHorizon, 0, 1) * (1 - Math.abs(dayFactor(timeOfDay) - 0.5) * 0.5)
}

const SEASON_TINT: Record<Season, THREE.Color> = {
  xuan: new THREE.Color('#e8f2e4'),
  ha: new THREE.Color('#fff1d6'),
  thu: new THREE.Color('#f0e6d8'),
  dong: new THREE.Color('#d5e0ea'),
}

export type SkyPalette = {
  zenith: THREE.Color
  horizon: THREE.Color
  ground: THREE.Color
  fog: THREE.Color
  sunColor: THREE.Color
  moonColor: THREE.Color
  sunIntensity: number
  moonIntensity: number
  ambientIntensity: number
  hemiSky: THREE.Color
  hemiGround: THREE.Color
  hemiIntensity: number
  exposure: number
  cloudOpacity: number
  starOpacity: number
  turbidity: number
  fogDensity: number
}

const _zenith = new THREE.Color()
const _horizon = new THREE.Color()
const _ground = new THREE.Color()
const _fog = new THREE.Color()
const _sunCol = new THREE.Color()
const _moonCol = new THREE.Color()
const _hemiSky = new THREE.Color()
const _hemiGround = new THREE.Color()

export function computeSkyPalette(
  timeOfDay: number,
  season: Season,
  raining: boolean,
): SkyPalette {
  const day = dayFactor(timeOfDay)
  const twilight = twilightFactor(timeOfDay)
  const night = 1 - day

  // Day blues → golden twilight → deep night
  _zenith.set('#6eb6ff').lerp(new THREE.Color('#0a1020'), night)
  _zenith.lerp(new THREE.Color('#ff7a3c'), twilight * 0.55 * (1 - night * 0.3))

  _horizon.set('#c8dff5').lerp(new THREE.Color('#050810'), night)
  _horizon.lerp(new THREE.Color('#ffb070'), twilight * 0.75)

  _ground.set('#8a7a62').lerp(new THREE.Color('#1a1814'), night)

  if (raining) {
    _zenith.lerp(new THREE.Color('#6A737A'), 0.55 * day + 0.2)
    _horizon.lerp(new THREE.Color('#4A5258'), 0.5 * day + 0.25)
  }

  // Season tint (subtle)
  const tint = SEASON_TINT[season]
  _zenith.lerp(tint, 0.08 * day)
  _horizon.lerp(tint, 0.12 * day)

  // Dusty ground-tinted fog — not a white wash over the citadel.
  _fog.copy(_horizon).lerp(_ground, 0.42).lerp(_zenith, 0.1)
  _fog.multiplyScalar(0.78)
  if (raining) _fog.lerp(new THREE.Color('#6e7478'), 0.4)

  _sunCol.set('#fff1c8').lerp(new THREE.Color('#ff8a3a'), twilight)
  _moonCol.set('#c8d4e8')

  // 10:00 default: hard key so version-1 normals (ngói / cột / gạch) read.
  const sunIntensity = THREE.MathUtils.lerp(0.05, raining ? 0.62 : 1.85, day)
  const moonIntensity = THREE.MathUtils.lerp(0.28, 0.02, day)
  const ambientIntensity = THREE.MathUtils.lerp(0.05, raining ? 0.16 : 0.14, day)
  const hemiIntensity = THREE.MathUtils.lerp(0.06, raining ? 0.2 : 0.26, day)
  const fogDensity = raining
    ? THREE.MathUtils.lerp(0.00012, 0.00028, day)
    : THREE.MathUtils.lerp(0.00008, 0.00016, day)

  _hemiSky.copy(_zenith).lerp(new THREE.Color('#cfe4ff'), day * 0.4)
  _hemiGround.copy(_ground)

  const cloudOpacity = raining
    ? THREE.MathUtils.lerp(0.08, 0.22, day)
    : THREE.MathUtils.lerp(0.15, 0.72, day)

  const starOpacity = (1 - THREE.MathUtils.smoothstep(day, 0.05, 0.45)) * (raining ? 0.25 : 1)

  const turbidity = raining ? 12 : THREE.MathUtils.lerp(2, 8, twilight)

  return {
    zenith: _zenith.clone(),
    horizon: _horizon.clone(),
    ground: _ground.clone(),
    fog: _fog.clone(),
    sunColor: _sunCol.clone(),
    moonColor: _moonCol.clone(),
    sunIntensity,
    moonIntensity,
    ambientIntensity,
    hemiSky: _hemiSky.clone(),
    hemiGround: _hemiGround.clone(),
    hemiIntensity,
    exposure: THREE.MathUtils.lerp(0.55, raining ? 0.82 : 0.98, day),
    cloudOpacity,
    starOpacity,
    turbidity,
    fogDensity,
  }
}
