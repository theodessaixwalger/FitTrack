import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Timer } from 'lucide-react'

function Stopwatch() {
  const [elapsed, setElapsed] = useState(0)       // ms
  const [running, setRunning] = useState(false)
  const [collapsed, setCollapsed] = useState(true)
  const intervalRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - elapsed
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startRef.current)
      }, 50)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const togglePlay = () => setRunning(r => !r)

  const reset = () => {
    setRunning(false)
    setElapsed(0)
  }

  const format = (ms) => {
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    const c = Math.floor((ms % 1000) / 10)
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(c).padStart(2, '0')}`
  }

  const accentColor = '#FF6B35'

  if (collapsed) {
    return (
      <div
        onClick={() => setCollapsed(false)}
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '16px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--surface)',
          border: `2px solid ${accentColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 4px ${accentColor}22`,
          zIndex: 900,
          transition: 'all 0.3s ease',
          animation: 'fadeInUp 0.3s ease-out',
        }}
        title="Ouvrir le chronomètre"
      >
        <Timer size={22} color={accentColor} />
        {running && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#6EE7B7',
            animation: 'pulse-dot 1.2s ease-in-out infinite',
          }} />
        )}
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      right: '16px',
      zIndex: 900,
      animation: 'fadeInUp 0.3s ease-out',
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: '20px',
        padding: '16px 20px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        minWidth: '180px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Timer size={14} color="var(--text-secondary)" />
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Chrono
            </span>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '2px',
              display: 'flex',
              lineHeight: 1,
              borderRadius: '6px',
              fontSize: '16px',
            }}
            title="Réduire"
          >
            —
          </button>
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {running && (
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#FF6B35',
              flexShrink: 0,
              animation: 'pulse-dot 1.2s ease-in-out infinite',
            }} />
          )}
          <div style={{
            fontFamily: '"SF Mono", "Fira Code", "Courier New", monospace',
            fontSize: elapsed >= 3600000 ? '22px' : '28px',
            fontWeight: '800',
            color: 'var(--text-primary)',
            letterSpacing: '2px',
          }}>
            {format(elapsed)}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Reset */}
          <button
            onClick={reset}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--surface-elevated)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'var(--surface-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            title="Réinitialiser"
          >
            <RotateCcw size={16} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              border: 'none',
              background: running
                ? 'var(--gradient-primary)'
                : 'var(--gradient-primary)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(255,107,53,0.4)',
              transition: 'all 0.25s ease',
              transform: 'scale(1)',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.08)' }}
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)' }}
            title={running ? 'Pause' : 'Démarrer'}
          >
            {running ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '2px' }} />}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  )
}

export default Stopwatch
