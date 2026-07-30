import { useCallback, useMemo, useRef, useState } from 'react'

export type AssetWeights = Record<string, number>

export type UseAssetProgressOptions = {
  /** Trọng số từng bucket (mặc định 1). Tổng sẽ được normalize. */
  weights?: AssetWeights
  /** Giá trị khởi tạo 0..1 (vd. resume). */
  initial?: number
}

export type AssetProgressApi = {
  /** 0..1 — weighted average của các mark. */
  progress: number
  /** Đánh dấu bucket đã tải `fraction` (0..1). */
  mark: (key: string, fraction?: number) => void
  /** Ghi đè progress thủ công (bỏ qua weights). */
  setManual: (value: number) => void
  /** Xóa marks + về initial. */
  reset: () => void
  /** true khi mọi weight đã mark ≥ 1 (hoặc manual ≥ 1). */
  done: boolean
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0
  return Math.min(1, Math.max(0, n))
}

function computeWeighted(
  marks: Record<string, number>,
  weights: AssetWeights | undefined,
): number {
  const keys = weights && Object.keys(weights).length > 0 ? Object.keys(weights) : Object.keys(marks)
  if (keys.length === 0) return 0

  let sumW = 0
  let sum = 0
  for (const key of keys) {
    const w = weights?.[key] ?? 1
    if (w <= 0) continue
    sumW += w
    sum += w * clamp01(marks[key] ?? 0)
  }
  if (sumW <= 0) return 0
  return clamp01(sum / sumW)
}

/**
 * Optional progress tracker — Suspense / manual weights.
 *
 * Ví dụ:
 * ```ts
 * const { progress, mark } = useAssetProgress({
 *   weights: { scene: 3, audio: 1, textures: 2 },
 * })
 * // trong loader: mark('textures', 0.5)
 * ```
 */
export function useAssetProgress(options: UseAssetProgressOptions = {}): AssetProgressApi {
  const { weights, initial = 0 } = options
  const weightsRef = useRef(weights)
  weightsRef.current = weights

  const [marks, setMarks] = useState<Record<string, number>>({})
  const [manual, setManualState] = useState<number | null>(initial > 0 ? clamp01(initial) : null)

  const mark = useCallback((key: string, fraction = 1) => {
    const next = clamp01(fraction)
    setManualState(null)
    setMarks((prev) => {
      if (prev[key] === next) return prev
      return { ...prev, [key]: next }
    })
  }, [])

  const setManual = useCallback((value: number) => {
    setManualState(clamp01(value))
  }, [])

  const reset = useCallback(() => {
    setMarks({})
    setManualState(initial > 0 ? clamp01(initial) : null)
  }, [initial])

  const progress = useMemo(() => {
    if (manual !== null) return manual
    return computeWeighted(marks, weightsRef.current)
  }, [marks, manual])

  const done = progress >= 0.999

  return { progress, mark, setManual, reset, done }
}
