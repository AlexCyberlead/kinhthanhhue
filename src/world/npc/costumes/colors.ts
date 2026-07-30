/**
 * Primary outfit HEX — stylized game palette từ docs/research/nature_people.md.
 * 12 bắt buộc + 2 bonus (hoàng hậu, nhạc công) khớp C4 NpcCostumeId.
 */
export const OUTFIT_COLORS: Record<string, string> = {
  npc_vua: '#E8B923',
  npc_quan_van: '#5B2C6F',
  npc_quan_vo: '#8B1E1E',
  npc_ve_binh: '#C62828',
  npc_thai_giam: '#2C3E50',
  npc_cung_nu: '#A67C52',
  npc_hau: '#6D4C41',
  npc_tang_si: '#8D6E41',
  npc_dan_ngu_than: '#3E2723',
  npc_non_la: '#6D4C41',
  npc_tay_su: '#1B2838',
  npc_tourist: '#2196F3',
  npc_hoang_hau: '#9C1B2E',
  npc_nhac_cong: '#1565C0',
}

/** Atlas paint palette (primary / trim / accent / secondary fabric). */
export const OUTFIT_PALETTES: Record<
  string,
  { primary: string; trim: string; accent: string; secondary: string }
> = {
  npc_vua: {
    primary: '#E8B923',
    trim: '#1A4B8C',
    accent: '#D4AF37',
    secondary: '#F5F5F0',
  },
  npc_quan_van: {
    primary: '#5B2C6F',
    trim: '#C9A227',
    accent: '#1A1A1A',
    secondary: '#2E6B4F',
  },
  npc_quan_vo: {
    primary: '#8B1E1E',
    trim: '#B87333',
    accent: '#D4AF37',
    secondary: '#222222',
  },
  npc_ve_binh: {
    primary: '#C62828',
    trim: '#2E7D32',
    accent: '#E6C84A',
    secondary: '#1A1A1A',
  },
  npc_thai_giam: {
    primary: '#2C3E50',
    trim: '#111111',
    accent: '#5D4037',
    secondary: '#3D4F5F',
  },
  npc_cung_nu: {
    primary: '#A67C52',
    trim: '#F5F0E6',
    accent: '#C2185B',
    secondary: '#D7CCC8',
  },
  npc_hau: {
    primary: '#6D4C41',
    trim: '#E8DCC8',
    accent: '#3E2723',
    secondary: '#8D6E63',
  },
  npc_tang_si: {
    primary: '#8D6E41',
    trim: '#2B2B2B',
    accent: '#F5F5DC',
    secondary: '#7A7A72',
  },
  npc_dan_ngu_than: {
    primary: '#3E2723',
    trim: '#F5F0E6',
    accent: '#1A1A1A',
    secondary: '#A1887F',
  },
  npc_non_la: {
    primary: '#6D4C41',
    trim: '#E8D5A3',
    accent: '#C4A574',
    secondary: '#EDE6D9',
  },
  npc_tay_su: {
    primary: '#1B2838',
    trim: '#FFFFFF',
    accent: '#8B0000',
    secondary: '#2C2C2C',
  },
  npc_tourist: {
    primary: '#2196F3',
    trim: '#FFFFFF',
    accent: '#FF7043',
    secondary: '#37474F',
  },
  npc_hoang_hau: {
    primary: '#9C1B2E',
    trim: '#D4AF37',
    accent: '#C62828',
    secondary: '#F8E7C9',
  },
  npc_nhac_cong: {
    primary: '#1565C0',
    trim: '#111111',
    accent: '#6A1B9A',
    secondary: '#6A1B9A',
  },
}

/**
 * C4 `costumeResolve` overlay — shape khớp NpcCostumePalette
 * (primary / secondary / accent / skin / hat).
 */
export const COSTUME_PALETTES: Record<
  string,
  {
    primary: string
    secondary: string
    accent: string
    skin?: string
    hat?: string
  }
> = {
  npc_vua: {
    primary: '#E8B923',
    secondary: '#1A4B8C',
    accent: '#D4AF37',
    skin: '#F5F5F0',
    hat: '#1A4B8C',
  },
  npc_quan_van: {
    primary: '#5B2C6F',
    secondary: '#2E6B4F',
    accent: '#C9A227',
    skin: '#E8C4A8',
    hat: '#1A1A1A',
  },
  npc_quan_vo: {
    primary: '#8B1E1E',
    secondary: '#6B2D2D',
    accent: '#D4AF37',
    skin: '#E8C4A8',
    hat: '#222222',
  },
  npc_ve_binh: {
    primary: '#C62828',
    secondary: '#2E7D32',
    accent: '#E6C84A',
    skin: '#E8C4A8',
    hat: '#E6C84A',
  },
  npc_thai_giam: {
    primary: '#2C3E50',
    secondary: '#3D4F5F',
    accent: '#111111',
    skin: '#E8C4A8',
    hat: '#111111',
  },
  npc_cung_nu: {
    primary: '#A67C52',
    secondary: '#F5F0E6',
    accent: '#C2185B',
    skin: '#E8C4A8',
    hat: '#1A1A1A',
  },
  npc_hau: {
    primary: '#6D4C41',
    secondary: '#E8DCC8',
    accent: '#3E2723',
    skin: '#E8C4A8',
    hat: '#3E2723',
  },
  npc_tang_si: {
    primary: '#8D6E41',
    secondary: '#7A7A72',
    accent: '#F5F5DC',
    skin: '#E8C4A8',
    hat: '#2B2B2B',
  },
  npc_dan_ngu_than: {
    primary: '#3E2723',
    secondary: '#F5F0E6',
    accent: '#1A1A1A',
    skin: '#E8C4A8',
    hat: '#1A1A1A',
  },
  npc_non_la: {
    primary: '#6D4C41',
    secondary: '#EDE6D9',
    accent: '#C4A574',
    skin: '#E8C4A8',
    hat: '#E8D5A3',
  },
  npc_tay_su: {
    primary: '#1B2838',
    secondary: '#F5F5F5',
    accent: '#8B0000',
    skin: '#E8C4A8',
    hat: '#2C2C2C',
  },
  npc_tourist: {
    primary: '#2196F3',
    secondary: '#37474F',
    accent: '#FFEB3B',
    skin: '#E8C4A8',
    hat: '#FFEB3B',
  },
  npc_hoang_hau: {
    primary: '#9C1B2E',
    secondary: '#F8E7C9',
    accent: '#D4AF37',
    skin: '#E8C4A8',
    hat: '#C62828',
  },
  npc_nhac_cong: {
    primary: '#1565C0',
    secondary: '#6A1B9A',
    accent: '#111111',
    skin: '#E8C4A8',
    hat: '#111111',
  },
}

export const COSTUME_IDS = Object.keys(OUTFIT_COLORS) as readonly string[]
