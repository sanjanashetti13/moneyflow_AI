import { useEffect } from 'react'

/**
 * useClickOutside - A hook to detect clicks outside of a specified element.
 */
export function useClickOutside(ref, handler, mouseEvent = 'mousedown') {
  useEffect(() => {
    const listener = (event) => {
      const el = ref?.current
      const target = event.target

      if (!el || !target || el.contains(target)) {
        return
      }

      handler(event)
    }

    document.addEventListener(mouseEvent, listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener(mouseEvent, listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler, mouseEvent])
}
