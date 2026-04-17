import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { ReelFeed } from './components/ReelFeed'
import { TopBar } from './components/TopBar'
import { BottomSheet } from './components/BottomSheet'
import { useWindowSize } from './hooks/useWindowSize'
import type { Reel } from './types'

const API = 'http://localhost:3001'

export default function App() {
  const [reels, setReels] = useState<Reel[]>([])
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const { isMobile } = useWindowSize()

  useEffect(() => {
    if (import.meta.env.VITE_DEMO !== '1') return
    fetch(`${API}/api/demo`)
      .then((r) => r.json())
      .then((reel) => setReels([{
        ...reel,
        backgroundVideo: reel.backgroundVideo ? `${API}${reel.backgroundVideo}` : null,
      }]))
      .catch(console.error)
  }, [])

  const handleGenerate = async (url: string) => {
    setLoading(true)
    setError(null)
    setReels([])
    setSteps([])

    try {
      const res = await fetch(`${API}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!res.ok || !res.body) throw new Error(`Server error: ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const event = JSON.parse(line.slice(6))

          if (event.type === 'step') {
            setSteps((s) => [...s, event.message])
          } else if (event.type === 'done') {
            setReels(
              event.reels.map((r: Reel) => ({
                ...r,
                audioUrl: `${API}${r.audioUrl}`,
                backgroundVideo: r.backgroundVideo ? `${API}${r.backgroundVideo}` : null,
              })),
            )
            setLoading(false)
          } else if (event.type === 'error') {
            throw new Error(event.message)
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: '100dvh',
        background: '#0a0a0a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden',
      }}
    >
      {isMobile ? (
        <>
          <TopBar onOpenSheet={() => setSheetOpen(true)} loading={loading} />
          <div style={{ flex: 1, paddingTop: 56, overflow: 'hidden', display: 'flex' }}>
            <ReelFeed reels={reels} loading={loading} steps={steps} error={error} />
          </div>
          <BottomSheet
            isOpen={sheetOpen}
            onClose={() => setSheetOpen(false)}
            onGenerate={handleGenerate}
            loading={loading}
          />
        </>
      ) : (
        <>
          <Sidebar onGenerate={handleGenerate} loading={loading} reels={reels} />
          <ReelFeed reels={reels} loading={loading} steps={steps} error={error} />
        </>
      )}
    </div>
  )
}
