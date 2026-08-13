import type { MonumentModule } from '../../core/types/MonumentModule'
import { phuNoiVu } from './phuNoiVu'

export { phuNoiVu, buildPhuNoiVu } from './phuNoiVu'

export const hoangThanhModules: MonumentModule[] = [phuNoiVu]
