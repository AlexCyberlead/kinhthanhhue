/**
 * Procedural AudioBuffers — no external media URLs.
 * Short loops / one-shots via oscillators, noise, and additive partials.
 */

function writeSilence(data: Float32Array, start: number, end: number) {
  for (let i = start; i < end; i++) data[i] = 0
}

function softClip(x: number): number {
  return Math.tanh(x)
}

/** Soft pentatonic ambient (nhã nhạc-ish) — ~6s seamless-ish loop. */
export function createAmbientBuffer(ctx: AudioContext): AudioBuffer {
  const duration = 6
  const sr = ctx.sampleRate
  const n = Math.floor(sr * duration)
  const buf = ctx.createBuffer(2, n, sr)
  const L = buf.getChannelData(0)
  const R = buf.getChannelData(1)
  // Hue court music flavor: C4–D4–E4–G4–A4 + fifth below
  const freqs = [261.63, 293.66, 329.63, 392.0, 440.0, 196.0]
  const phases = freqs.map(() => Math.random() * Math.PI * 2)

  for (let i = 0; i < n; i++) {
    const t = i / sr
    // Slow amplitude breathing + crossfade edges for loop
    const edge = Math.min(t / 0.4, (duration - t) / 0.4, 1)
    const breath = 0.55 + 0.45 * Math.sin(t * Math.PI * 2 * 0.08)
    let sample = 0
    for (let h = 0; h < freqs.length; h++) {
      const wobble = 1 + 0.003 * Math.sin(t * (0.2 + h * 0.07))
      const amp = (h === 5 ? 0.12 : 0.07) / (1 + h * 0.15)
      sample += Math.sin(phases[h]! + Math.PI * 2 * freqs[h]! * wobble * t) * amp
      // Soft fifth harmonic on mid tones
      if (h < 3) {
        sample += Math.sin(phases[h]! + Math.PI * 2 * freqs[h]! * 2 * t) * amp * 0.15
      }
    }
    sample = softClip(sample * breath * edge * 0.55)
    const width = 0.12 * Math.sin(t * 0.35)
    L[i] = sample * (1 - width)
    R[i] = sample * (1 + width)
  }
  return buf
}

/** Temple bell — metallic decaying partials (~2.5s). */
export function createBellBuffer(ctx: AudioContext): AudioBuffer {
  const duration = 2.5
  const sr = ctx.sampleRate
  const n = Math.floor(sr * duration)
  const buf = ctx.createBuffer(1, n, sr)
  const data = buf.getChannelData(0)
  // Inharmonic partials typical of bronze bells
  const partials = [
    { f: 220, a: 1.0, d: 1.8 },
    { f: 440 * 1.002, a: 0.55, d: 1.4 },
    { f: 550, a: 0.35, d: 1.1 },
    { f: 880 * 1.01, a: 0.22, d: 0.9 },
    { f: 1320, a: 0.12, d: 0.6 },
    { f: 1760, a: 0.06, d: 0.4 },
  ]

  for (let i = 0; i < n; i++) {
    const t = i / sr
    let sample = 0
    for (const p of partials) {
      const env = Math.exp(-t / p.d)
      sample += Math.sin(Math.PI * 2 * p.f * t) * p.a * env
    }
    // Strike transient
    const strike = Math.exp(-t * 80) * (Math.random() * 2 - 1) * 0.35
    data[i] = softClip((sample * 0.35 + strike) * Math.min(1, t * 200))
  }
  return buf
}

/** Bird chirp train — short FM sweeps (~1.2s loop). */
export function createBirdBuffer(ctx: AudioContext): AudioBuffer {
  const duration = 1.2
  const sr = ctx.sampleRate
  const n = Math.floor(sr * duration)
  const buf = ctx.createBuffer(1, n, sr)
  const data = buf.getChannelData(0)
  writeSilence(data, 0, n)

  const chirps = [
    { start: 0.05, len: 0.12, f0: 2800, f1: 4200 },
    { start: 0.22, len: 0.09, f0: 3200, f1: 4800 },
    { start: 0.55, len: 0.14, f0: 2400, f1: 3600 },
    { start: 0.85, len: 0.08, f0: 3600, f1: 5200 },
  ]

  for (const c of chirps) {
    const i0 = Math.floor(c.start * sr)
    const len = Math.floor(c.len * sr)
    for (let i = 0; i < len; i++) {
      const u = i / len
      const env = Math.sin(Math.PI * u) ** 1.4
      const f = c.f0 + (c.f1 - c.f0) * u
      const t = i / sr
      const fm = Math.sin(Math.PI * 2 * 40 * t) * 80
      data[i0 + i]! += Math.sin(Math.PI * 2 * (f + fm) * t) * env * 0.28
    }
  }
  return buf
}

/** Filtered rain noise loop (~2s). */
export function createRainBuffer(ctx: AudioContext): AudioBuffer {
  const duration = 2
  const sr = ctx.sampleRate
  const n = Math.floor(sr * duration)
  const buf = ctx.createBuffer(2, n, sr)
  const L = buf.getChannelData(0)
  const R = buf.getChannelData(1)

  // One-pole low-pass on white noise + stereo decorrelation
  let lpL = 0
  let lpR = 0
  const a = 0.12
  for (let i = 0; i < n; i++) {
    const t = i / sr
    const edge = Math.min(t / 0.15, (duration - t) / 0.15, 1)
    const nL = Math.random() * 2 - 1
    const nR = Math.random() * 2 - 1
    lpL += a * (nL - lpL)
    lpR += a * (nR - lpR)
    // Occasional droplet clicks
    const drop =
      Math.random() < 0.002 ? (Math.random() * 2 - 1) * Math.exp(-((i % 40) / 8)) * 0.4 : 0
    L[i] = softClip((lpL * 0.55 + drop) * edge * 0.45)
    R[i] = softClip((lpR * 0.55 + drop * 0.7) * edge * 0.45)
  }
  return buf
}

/** Soft footstep thud (~0.18s). */
export function createFootstepBuffer(ctx: AudioContext): AudioBuffer {
  const duration = 0.18
  const sr = ctx.sampleRate
  const n = Math.floor(sr * duration)
  const buf = ctx.createBuffer(1, n, sr)
  const data = buf.getChannelData(0)
  let lp = 0
  for (let i = 0; i < n; i++) {
    const t = i / sr
    const env = Math.exp(-t * 28) * (1 - t / duration)
    const noise = Math.random() * 2 - 1
    lp += 0.25 * (noise - lp)
    const body = Math.sin(Math.PI * 2 * 90 * t) * Math.exp(-t * 35) * 0.5
    data[i] = softClip((lp * 0.7 + body) * env * 0.9)
  }
  return buf
}
