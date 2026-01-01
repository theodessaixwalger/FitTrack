import { useState, useEffect } from 'react'
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
        background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', opacity: 0.7 }}>
          Chargement...
        </div>
      </div>
    )
  }

  const getMotivationMessage = () => {
    if (streak === 0) return "Commence ton streak aujourd'hui ! 💪"
    if (streak === 1) return "Premier jour, continue ! 🎯"
    if (streak < 7) return "Continue comme ça ! 🔥"
    if (streak < 30) return "Incroyable régularité ! 🌟"
    return "Tu es une machine ! 🏆"
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '20px',
      color: 'white',
      boxShadow: '0 8px 24px rgba(255, 107, 53, 0.25)',
      animation: 'slideUp 0.4s ease-out'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Icône de flamme avec animation */}
        <div style={{
          fontSize: '48px',
          animation: streak > 0 ? 'flame 1.5s ease-in-out infinite' : 'none',
          filter: streak === 0 ? 'grayscale(100%) opacity(0.5)' : 'none'
        }}>
          🔥
        </div>

        {/* Streak info */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            opacity: 0.9,
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            Streak Actuel
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '800',
            lineHeight: '1',
            marginBottom: '8px'
          }}>
            {streak} {streak === 1 ? 'jour' : 'jours'}
          </div>
          <div style={{
            fontSize: '13px',
            opacity: 0.85,
            fontWeight: '500'
          }}>
            {getMotivationMessage()}
          </div>
        </div>
      </div>

      {/* Mini calendrier des 7 derniers jours */}
      <div style={{
        display: 'flex',
        gap: '8px',
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
              fontSize: '11px',
              opacity: 0.8,
              marginBottom: '6px',
              fontWeight: '600'
            }}>
              {day.dayName}
            </div>
            <div style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '12px',
              background: day.isActive 
                ? 'rgba(255, 255, 255, 0.95)' 
                : 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              border: day.isToday ? '2px solid white' : 'none',
              boxShadow: day.isToday ? '0 0 0 2px rgba(255, 255, 255, 0.3)' : 'none',
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
            transform: scale(1.1) rotate(2deg);
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
