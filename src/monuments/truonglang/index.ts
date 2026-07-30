import type { MonumentModule } from '../../core/types/MonumentModule'
import { truongLang } from './truongLang'
import { buildTruongLang, layoutForLod, collectColumnPositions } from './buildTruongLang'
import { countDrawCalls, estimateTris, countColumnInstances } from './geometry'

export { truongLang, buildTruongLang, layoutForLod, collectColumnPositions }
export { countDrawCalls, estimateTris, countColumnInstances }

export const truongLangModules: MonumentModule[] = [truongLang]
