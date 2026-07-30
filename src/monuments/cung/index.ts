import type { MonumentModule } from '../../core/types/MonumentModule'
import { cungDienTho } from './cungDienTho'
import { cungTruongSanh } from './cungTruongSanh'
import { dienPhungTien } from './dienPhungTien'

/**
 * WAVE B / B7 — Cung Diên Thọ + Cung Trường Sanh + Điện Phụng Tiên.
 * Ngói thanh lưu ly (cung Thái hậu / không trục dũng đạo).
 */
export const cungModules: MonumentModule[] = [cungDienTho, cungTruongSanh, dienPhungTien]

export { cungDienTho, cungTruongSanh, dienPhungTien }
export { buildCungComplex } from './buildCungComplex'
export { countDrawCalls } from './countDrawCalls'
