interface Props {
  onOpenSheet: () => void
  loading: boolean
}

export function TopBar({ onOpenSheet, loading }: Props) {
  return (
    <header style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: 56,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      background: 'rgba(10,10,10,0.88)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <span style={{
        fontSize: 20,
        fontWeight: 900,
        letterSpacing: -1,
        background: 'linear-gradient(135deg, #ff3cac, #784ba0, #2b86c5)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        DOC REELS
      </span>
      <button
        onClick={onOpenSheet}
        disabled={loading}
        style={{
          width: 40, height: 40,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #ff3cac, #2b86c5)',
          color: 'white',
          fontSize: 22,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        +
      </button>
    </header>
  )
}
