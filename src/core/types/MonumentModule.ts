import type * as THREE from 'three'

/**
 * Contract mọi công trình phải implement.
 * Sub-agent KHÔNG được tự chế signature khác.
 */
export interface MonumentModule {
  id: string
  displayName: { vi: string; en: string }
  build(lod: 0 | 1 | 2): THREE.Group
  /** Vị trí world space (mét). Gốc (0,0,0) = tâm sân Đại Triều Nghi. +Z = Nam. */
  anchor: [number, number, number]
  rotationY: number
  boundingRadius: number
  poi: { vi: string; en: string; year?: string }
}
