import { useMemo, useSyncExternalStore } from 'react'

function getSnapshot() {
  return JSON.stringify({
    w: window.innerWidth,
    h: window.innerHeight,
  })
}

function subscribe(cb: () => void) {
  window.addEventListener('resize', cb)
  window.visualViewport?.addEventListener('resize', cb)
  return () => {
    window.removeEventListener('resize', cb)
    window.visualViewport?.removeEventListener('resize', cb)
  }
}

export function useWindowSize() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, () =>
    JSON.stringify({ w: 1280, h: 800 }),
  )
  return useMemo(() => {
    const { w, h } = JSON.parse(snap)
    return { width: w as number, height: h as number, isMobile: (w as number) < 768 }
  }, [snap])
}
