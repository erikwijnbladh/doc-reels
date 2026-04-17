import { useState } from 'react'
import type { Reel } from '../types'
import { looksLikeDocs } from '../utils/urlValidation'

interface Props {
  onGenerate: (url: string) => void
  loading: boolean
  reels: Reel[]
}

export function Sidebar({ onGenerate, loading, reels }: Props) {
  const [url, setUrl] = useState('')
  const [warn, setWarn] = useState(false)

  const submit = () => {
    if (loading || !url.trim()) return
    if (!looksLikeDocs(url.trim())) {
      setWarn(true)
      return
    }
    setWarn(false)
    onGenerate(url.trim())
  }

  return (
    <div
      style={{
        width: 280,
        flexShrink: 0,
        padding: '28px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        background: '#0d0d0d',
      }}
    >
      {/* Logo */}
      <div>
        <h1
          style={{
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: -2,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #ff3cac, #784ba0, #2b86c5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          DOC REELS
        </h1>
        <p style={{ fontSize: 11, color: '#555', marginTop: 5, letterSpacing: 0.5 }}>
          🧠 brain rot your way to enlightenment
        </p>
      </div>

      {/* URL input */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={url}
          onChange={(e) => { setUrl(e.target.value); setWarn(false) }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="paste docs URL..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            outline: 'none',
            fontSize: 13,
            color: '#eee',
          }}
        />
        <button
          onClick={submit}
          disabled={loading || !url.trim()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: 'none',
            background: loading || !url.trim()
              ? 'rgba(255,255,255,0.08)'
              : 'linear-gradient(135deg, #ff3cac, #2b86c5)',
            color: 'white',
            fontSize: 18,
            cursor: loading || !url.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
        >
          {loading ? '⟳' : '→'}
        </button>
      </div>

      {/* Not a docs URL warning */}
      {warn && (
        <div style={{
          fontSize: 12,
          color: '#ff6b6b',
          background: 'rgba(255,100,100,0.08)',
          border: '1px solid rgba(255,100,100,0.2)',
          borderRadius: 8,
          padding: '8px 12px',
          marginTop: -12,
        }}>
          ⚠️ That doesn't look like a docs URL. Still want to try?{' '}
          <span
            onClick={() => { setWarn(false); onGenerate(url.trim()) }}
            style={{ textDecoration: 'underline', cursor: 'pointer', color: '#ff9999' }}
          >
            Go anyway
          </span>
        </div>
      )}

      {/* Generated reel list */}
      {reels.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Generated
          </p>
          {reels.map((reel, i) => (
            <div
              key={reel.id}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                fontSize: 12,
                fontWeight: 500,
                color: '#aaa',
              }}
            >
              <span style={{ color: '#555', marginRight: 6 }}>{i + 1}.</span>
              {reel.title}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
