import { useEffect, useRef, type MutableRefObject } from 'react'

export type KeyState = {
  forward: boolean
  back: boolean
  left: boolean
  right: boolean
  up: boolean
  down: boolean
  sprint: boolean
}

const EMPTY: KeyState = {
  forward: false,
  back: false,
  left: false,
  right: false,
  up: false,
  down: false,
  sprint: false,
}

function applyCode(state: KeyState, code: string, pressed: boolean) {
  switch (code) {
    case 'KeyW':
    case 'ArrowUp':
      state.forward = pressed
      break
    case 'KeyS':
    case 'ArrowDown':
      state.back = pressed
      break
    case 'KeyA':
    case 'ArrowLeft':
      state.left = pressed
      break
    case 'KeyD':
    case 'ArrowRight':
      state.right = pressed
      break
    case 'KeyQ':
      state.down = pressed
      break
    case 'KeyE':
      state.up = pressed
      break
    case 'ShiftLeft':
    case 'ShiftRight':
      state.sprint = pressed
      break
    default:
      break
  }
}

/** Mutable WASD/QE/Shift key bag — safe to read in useFrame. */
export function useMovementKeys(enabled: boolean): MutableRefObject<KeyState> {
  const keys = useRef<KeyState>({ ...EMPTY })

  useEffect(() => {
    if (!enabled) {
      Object.assign(keys.current, EMPTY)
      return
    }

    const onDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      applyCode(keys.current, e.code, true)
    }
    const onUp = (e: KeyboardEvent) => {
      applyCode(keys.current, e.code, false)
    }
    const clear = () => Object.assign(keys.current, EMPTY)

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', clear)
      clear()
    }
  }, [enabled])

  return keys
}
