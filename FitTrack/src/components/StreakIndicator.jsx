import { useState, useEffect } from 'react'
import { Fire, Barbell, Target, Sparkle, Trophy } from '@phosphor-icons/react'
import { getCurrentStreak, getLast7Days } from '../services/streakService'

function StreakIndicator({ userId }) {
  const [streak, setStreak] = useState(0)
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const fetchStreak = async () => {
      try {
        const [streakData, daysData] = await Promise.all([
          getCurrentStreak(userId),
          getLast7Days(userId)
        ])

        setStreak(streakData.streak)
        setDays(daysData)
      } catch (error) {
        console.error('Error fetching streak:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStreak()
  }, [userId])

  if (loading) {
    return (
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '24px',
        color: 'var(--text-tertiary)'
      }}>
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          Chargement...
        </div>
      </div>
    )
  }

  // Renvoie { icon, text } : l'emoji de ponctuation devient une icone.
  const getMotivationMessage = () => {
    if (streak === 0) return { icon: Barbell, text: "Commence ton streak aujourd'hui !" }
    if (streak === 1) return { icon: Target, text: 'Premier jour, continue !' }
    if (streak < 7) return { icon: Fire, text: 'Continue comme ça !' }
    if (streak < 30) return { icon: Sparkle, text: 'Incroyable régularité !' }
    return { icon: Trophy, text: 'Tu es une machine !' }
  }

  return (
    <div className="glow-card glow-streak" style={{
      background: 'linear-gradient(160deg, #1C1C1C 0%, #121212 100%)',
      borderRadius: 'var(--r-lg)',
      padding: '20px',
      color: 'var(--text-primary)',
      boxShadow: '0 8px 28px rgba(0, 0, 0, 0.5)',
      animation: 'slideUp 0.4s ease-out'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Icône de flamme avec animation */}
        <div style={{
          width: '54px',
          height: '54px',
          flexShrink: 0,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)',
          background: streak > 0 ? 'rgba(212, 255, 63, 0.12)' : 'rgba(255, 255, 255, 0.04)',
          border: streak > 0 ? '1px solid var(--accent-line)' : '1px solid var(--border)',
          animation: streak > 0 ? 'flame 1.5s ease-in-out infinite' : 'none',
          filter: streak === 0 ? 'grayscale(100%) opacity(0.5)' : 'none'
        }}>
          <Fire size={26} />
        </div>

        {/* Streak info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            fontWeight: '700',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '4px'
          }}>
            Streak Actuel
          </div>
          <div style={{
            fontSize: '34px',
            fontWeight: '800',
            lineHeight: '1',
            letterSpacing: '-1.4px',
            marginBottom: '6px',
            color: streak > 0 ? 'var(--accent)' : 'var(--text-primary)',
            textShadow: streak > 0 ? '0 0 24px rgba(212, 255, 63, 0.35)' : 'none'
          }}>
            {streak} <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0' }}>
              {streak === 1 ? 'jour' : 'jours'}
            </span>
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontWeight: '600'
          }}>
            {(() => {
              const { icon: MotivationIcon, text } = getMotivationMessage()
              return (
                <>
                  <MotivationIcon
                    size={13}
                    style={{ verticalAlign: '-2px', marginRight: '5px', color: 'var(--accent)' }}
                  />
                  {text}
                </>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Mini calendrier des 7 derniers jours */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'space-between'
      }}>
        {days.map((day, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              textAlign: 'center'
            }}
          >
            <div style={{
              fontSize: '10px',
              color: 'var(--text-tertiary)',
              marginBottom: '6px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {day.dayName}
            </div>
            <div style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '12px',
              background: day.isActive
                ? 'var(--accent)'
                : 'rgba(255, 255, 255, 0.05)',
              color: day.isActive ? 'var(--ink)' : 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              fontWeight: '800',
              border: day.isToday
                ? '1.5px solid var(--accent)'
                : '1px solid var(--border)',
              boxShadow: day.isActive
                ? '0 0 14px rgba(212, 255, 63, 0.35)'
                : 'none',
              transition: 'all 0.3s ease',
              animation: day.isActive ? 'pop 0.3s ease-out' : 'none',
              animationDelay: `${index * 0.05}s`
            }}>
              {day.isActive ? '✓' : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Styles d'animation */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes flame {
          0%, 100% {
            transform: scale(1) rotate(-2deg);
          }
          50% {
            transform: scale(1.08) rotate(2deg);
          }
        }

        @keyframes pop {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default StreakIndicator
