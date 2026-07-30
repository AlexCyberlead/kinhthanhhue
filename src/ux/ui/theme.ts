/** Huế imperial palette — son / vàng / vôi (khớp WORLD.colors). */
export const HUE = {
  son: '#8B1A1A',
  sonDeep: '#5C1010',
  vang: '#C9A227',
  vangSoft: '#D4A017',
  voi: '#E8DCC8',
  ink: '#1a1410',
  inkSoft: 'rgba(26, 20, 16, 0.78)',
  stone: '#6E6E68',
} as const

export const panelClass =
  'pointer-events-auto rounded-md border border-[#C9A227]/35 bg-[#1a1410]/78 text-[#E8DCC8] shadow-md backdrop-blur-sm'

export const chipBase =
  'rounded px-2 py-1 text-[11px] tracking-wide transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]'

export const chipIdle = `${chipBase} border border-transparent text-[#E8DCC8]/70 hover:border-[#C9A227]/40 hover:text-[#E8DCC8]`

export const chipActive = `${chipBase} border border-[#C9A227]/70 bg-[#8B1A1A]/55 text-[#E8DCC8]`
