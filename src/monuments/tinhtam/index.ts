import type { MonumentModule } from '../../core/types/MonumentModule'
import { hoTinhTam } from './hoTinhTam'

export { hoTinhTam } from './hoTinhTam'
export { buildTinhTam } from './buildTinhTam'
export { TINH_TAM_LAKE, ISLANDS } from './constants'

export const tinhTamModules: MonumentModule[] = [hoTinhTam]
