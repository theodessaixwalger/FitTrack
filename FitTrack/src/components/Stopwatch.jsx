import { useState, useEffect, useRef } from 'react'
import { Play, Pause, ArrowCounterClockwise, Timer, Minus } from '@phosphor-icons/react'

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

  const accentColor = '#D4FF3F'

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
      <div
        className="glow-card glow-accent"
        style={{
          background: 'var(--gradient-surface)',
          borderRadius: 'var(--r-lg)',
          padding: '16px 18px',
          boxShadow: 'var(--shadow-xl)',
          backdropFilter: 'blur(20px)',
          // Le halo par defaut (280px) ecraserait un panneau de 190px.
          '--card-halo-size': '170px',
          minWidth: '190px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
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
            <Timer size={14} color="var(--text-tertiary)" />
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Chrono
            </span>
          </div>
          {/* Icone Phosphor au lieu du caractere tiret cadratin */}
          <button
            onClick={() => setCollapsed(true)}
            className="icon-btn icon-btn-ghost"
            style={{ width: '26px', height: '26px' }}
            title="Réduire"
          >
            <Minus weight="bold" size={14} />
          </button>
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {running && (
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--accent)',
              flexShrink: 0,
              animation: 'pulse-dot 1.2s ease-in-out infinite',
            }} />
          )}
          <div style={{
            fontFamily: '"SF Mono", "Fira Code", "Courier New", monospace',
            fontSize: elapsed >= 3600000 ? '22px' : '28px',
            fontWeight: '800',
            // Le chiffre passe a l'accent quand ca tourne : meme logique
            // que les autres valeurs cles de l'app.
            color: running ? 'var(--accent)' : 'var(--text-primary)',
            textShadow: running ? '0 0 20px rgba(212, 255, 63, 0.3)' : 'none',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '2px',
            transition: 'color 0.25s ease',
          }}>
            {format(elapsed)}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Reset */}
          <button
            onClick={reset}
            className="icon-btn icon-btn-ghost"
            style={{ width: '42px', height: '42px' }}
            title="Réinitialiser"
          >
            <ArrowCounterClockwise size={17} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s ease',
              // Les deux branches du ternaire d'origine etaient identiques :
              // le bouton ne signalait pas son etat. Arret = CTA lime plein
              // (demarrer), en cours = pilule lime discrete (mettre en pause).
              background: running ? 'var(--accent-ghost)' : 'var(--accent)',
              border: running ? '1px solid var(--accent-line)' : '1px solid transparent',
              color: running ? 'var(--accent)' : 'var(--ink)',
              boxShadow: running ? 'none' : 'var(--glow-accent)',
            }}
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
