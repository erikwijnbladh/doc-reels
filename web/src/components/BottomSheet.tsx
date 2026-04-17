import { useEffect, useState } from 'react'
import '../mobile.css'
import { looksLikeDocs } from '../utils/urlValidation'

interface Props {
  isOpen: boolean
  onClose: () => void
  onGenerate: (url: string) => void
  loading: boolean
}

export function BottomSheet({ isOpen, onClose, onGenerate, loading }: Props) {
  const [url, setUrl] = useState('')
  const [warn, setWarn] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sheet-open')
    } else {
      document.body.classList.remove('sheet-open')
    }
    return () => document.body.classList.remove('sheet-open')
  }, [isOpen])

  const submit = () => {
    if (loading || !url.trim()) return
    if (!looksLikeDocs(url.trim())) { setWarn(true); return }
    setWarn(false)
    onGenerate(url.trim())
    onClose()
  }

  return (
    <>
      <div className={`bottom-sheet-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`bottom-sheet-panel ${isOpen ? 'open' : ''}`}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', margin: '0 auto 20px' }} />

        <p style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
          Paste a docs URL
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={url}
            onChange={(e) => { setUrl(e.target.value); setWarn(false) }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="https://docs.something.com..."
            autoFocus={isOpen}
            style={{
              flex: 1, padding: '11px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#eee', fontSize: 14, outline: 'none',
            }}
          />
          <button
            onClick={submit}
            disabled={loading || !url.trim()}
            style={{
              padding: '0 18px', borderRadius: 12, border: 'none',
              background: loading || !url.trim() ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #ff3cac, #2b86c5)',
              color: 'white', fontSize: 16, fontWeight: 700,
              cursor: loading || !url.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⟳' : '→'}
          </button>
        </div>

        {warn && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#ff6b6b', background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.2)', borderRadius: 8, padding: '8px 12px' }}>
            ⚠️ Doesn't look like a docs URL.{' '}
            <span onClick={() => { setWarn(false); onGenerate(url.trim()); onClose() }} style={{ textDecoration: 'underline', cursor: 'pointer', color: '#ff9999' }}>
              Go anyway
            </span>
          </div>
        )}
      </div>
    </>
  )
}
