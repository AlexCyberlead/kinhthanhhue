import { COSTUME_IDS } from './colors'

export const COSTUME_ATLAS_SIZE = 1024

/** Grid 4×4 → cell 256px. 14 costumes occupy first 14 slots. */
export const COSTUME_GRID_COLS = 4
export const COSTUME_GRID_ROWS = 4
export const COSTUME_CELL_PX = COSTUME_ATLAS_SIZE / COSTUME_GRID_COLS

export type CostumeRect = { u: number; v: number; w: number; h: number }

/**
 * UV rects — `{ u, v }` = góc dưới-trái trong UV 0–1 (OpenGL / Three flipY).
 * `w`, `h` = kích thước UV của cell.
 */
function buildRects(): Record<string, CostumeRect> {
  const w = 1 / COSTUME_GRID_COLS
  const h = 1 / COSTUME_GRID_ROWS
  const rects: Record<string, CostumeRect> = {}

  COSTUME_IDS.forEach((id, i) => {
    const col = i % COSTUME_GRID_COLS
    const row = Math.floor(i / COSTUME_GRID_COLS)
    rects[id] = {
      u: col * w,
      v: 1 - (row + 1) * h,
      w,
      h,
    }
  })

  return rects
}

export const COSTUME_RECTS: Record<string, CostumeRect> = buildRects()

/** Pixel bounds trên canvas (origin top-left) cho paint. */
export function costumeCellPx(index: number): {
  x: number
  y: number
  size: number
} {
  const col = index % COSTUME_GRID_COLS
  const row = Math.floor(index / COSTUME_GRID_COLS)
  return {
    x: col * COSTUME_CELL_PX,
    y: row * COSTUME_CELL_PX,
    size: COSTUME_CELL_PX,
  }
}
