import { useRef, useState } from 'react'
import type { Reel } from '../types'
import { ReelCard, REEL_W, REEL_H } from './ReelCard'
import { GeneratingLoader } from './GeneratingLoader'
import { useWindowSize } from '../hooks/useWindowSize'

const TOP_BAR = 56

interface Props {
  reels: Reel[]
  loading: boolean
  steps: string[]
  error: string | null
}

export function ReelFeed({ reels, loading, error }: Props) {
  const feedRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const { width, height, isMobile } = useWindowSize()

  const scale = isMobile
    ? Math.min(width / REEL_W, (height - TOP_BAR) / REEL_H)
    : 1

  const itemHeight = isMobile ? height - TOP_BAR : height

  const onScroll = () => {
    const el = feedRef.current
    if (!el) return
    setActiveIndex(Math.round(el.scrollTop / itemHeight))
  }

  const goTo = (index: number) => {
    const el = feedRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(index, reels.length - 1))
    el.scrollTo({ top: clamped * itemHeight, behavior: 'smooth' })
    setActiveIndex(clamped)
  }

  if (loading) {
    return (
      <div style={centerStyle}>
        <GeneratingLoader />
      </div>
    )
  }

  if (error) {
    return (
      <div style={centerStyle}>
        <p style={{ fontWeight: 700, color: '#ff4444' }}>Error</p>
        <p style={{ fontSize: 13, marginTop: 6, color: '#666' }}>{error}</p>
      </div>
    )
  }

  if (reels.length === 0) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#333', fontSize: 14 }}>
          {isMobile ? 'tap + to generate reels' : '← paste a docs URL to generate reels'}
        </p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <div
        ref={feedRef}
        onScroll={onScroll}
        style={{
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
        }}
      >
        {reels.map((reel, i) => (
          <div
            key={reel.id}
            style={{
              height: itemHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scrollSnapAlign: 'start',
            }}
          >
            <ReelCard reel={reel} playing={i === activeIndex} scale={scale} />
          </div>
        ))}
      </div>

      {/* Arrows — right side on desktop, bottom-center on mobile */}
      <div style={isMobile ? arrowsMobile : arrowsDesktop}>
        <button onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0} style={arrowBtn(activeIndex === 0, isMobile)}>↑</button>
        <button onClick={() => goTo(activeIndex + 1)} disabled={activeIndex === reels.length - 1} style={arrowBtn(activeIndex === reels.length - 1, isMobile)}>↓</button>
      </div>
    </div>
  )
}

const centerStyle: React.CSSProperties = {
  flex: 1, display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
}

const arrowsDesktop: React.CSSProperties = {
  position: 'absolute', right: 24, top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex', flexDirection: 'column', gap: 10, zIndex: 20,
}

const arrowsMobile: React.CSSProperties = {
  position: 'absolute', bottom: 28, left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex', flexDirection: 'row', gap: 16, zIndex: 20,
}

const arrowBtn = (disabled: boolean, isMobile: boolean): React.CSSProperties => ({
  width: isMobile ? 52 : 42,
  height: isMobile ? 52 : 42,
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.1)',
  background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.12)',
  color: disabled ? '#333' : '#fff',
  fontSize: isMobile ? 22 : 18,
  cursor: disabled ? 'not-allowed' : 'pointer',
  backdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.15s',
})
