import { useState, useEffect } from 'react'
import { X, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import { getExerciseHistory, suggestWeightIncrease } from '../services/exerciceService'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function ExerciseHistoryModal({ isOpen, onClose, userId, exerciseName }) {
  const [history, setHistory] = useState([])
  const [displayLimit, setDisplayLimit] = useState(5)
  const [stats, setStats] = useState({ max: 0, min: 0, avg: 0, trend: 0 })
  const [suggestion, setSuggestion] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && userId && exerciseName) {
      loadHistory()
    }
  }, [isOpen, userId, exerciseName])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const data = await getExerciseHistory(userId, exerciseName, 50)
      setHistory(data)
      calculateStats(data)
      
      // Charger la suggestion intelligente
      const suggestionData = await suggestWeightIncrease(userId, exerciseName)
      setSuggestion(suggestionData)
    } catch (error) {
      console.error('Erreur chargement historique:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    if (data.length === 0) return
    
    const weights = data.map(d => parseFloat(d.weight))
    const max = Math.max(...weights)
    const min = Math.min(...weights)
    const avg = weights.reduce((a, b) => a + b, 0) / weights.length
    
    // Calculer la tendance (derniers 3 vs précédents 3)
    if (weights.length >= 6) {
      const recent = weights.slice(0, 3).reduce((a, b) => a + b, 0) / 3
      const previous = weights.slice(3, 6).reduce((a, b) => a + b, 0) / 3
      const trend = ((recent - previous) / previous) * 100
      setStats({ max, min, avg, trend })
    } else {
      setStats({ max, min, avg, trend: 0 })
    }
  }

  if (!isOpen) return null

  const displayedHistory = history.slice(0, displayLimit)
  const hasMore = history.length > displayLimit

  const chartData = history.slice(0, 20).map(h => ({
    date: new Date(h.performed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    weight: parseFloat(h.weight)
  })).reverse()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "900px",
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto"
        }}
      >
        <div className="modal-header">
          <h2>📊 Historique - {exerciseName}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "24px" }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner" />
              <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Chargement...</p>
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
                Aucun historique pour cet exercice
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Ajoutez des poids lors de vos entraînements pour voir votre progression
              </p>
            </div>
          ) : (
            <>
              {/* Statistiques */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div className="stat-card" style={{ padding: '20px' }}>
                  <div className="stat-label">Max</div>
                  <div className="stat-value" style={{ fontSize: '28px' }}>{stats.max} kg</div>
                </div>
                <div className="stat-card" style={{ padding: '20px' }}>
                  <div className="stat-label">Min</div>
                  <div className="stat-value" style={{ fontSize: '28px' }}>{stats.min} kg</div>
                </div>
                <div className="stat-card" style={{ padding: '20px' }}>
                  <div className="stat-label">Moyenne</div>
                  <div className="stat-value" style={{ fontSize: '28px' }}>{stats.avg.toFixed(1)} kg</div>
                </div>
                <div className="stat-card" style={{ padding: '20px' }}>
                  <div className="stat-label">Tendance</div>
                  <div className="stat-value" style={{ color: stats.trend >= 0 ? 'var(--success)' : 'var(--error)', fontSize: '28px' }}>
                    {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Suggestion intelligente */}
              {suggestion && (
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: `${suggestion.color}15`,
                  border: `2px solid ${suggestion.color}`,
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                    <TrendingUp size={24} color={suggestion.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px', color: suggestion.color }}>
                        Suggestion : {suggestion.weight} {suggestion.unit}
                      </div>
                      <div style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}>
                        {suggestion.reason}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        gap: '16px', 
                        fontSize: '12px', 
                        color: 'var(--text-secondary)',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border)'
                      }}>
                        <span>📊 Taux de réussite : {suggestion.successRate.toFixed(0)}%</span>
                        <span>📈 Tendance : {suggestion.trend >= 0 ? '+' : ''}{suggestion.trend.toFixed(1)}%</span>
                        <span>🎯 Basé sur {suggestion.sessionsAnalyzed} séances</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Graphique */}
              {chartData.length > 0 && (
                <div style={{ marginBottom: "32px" }}>
                  <h3 style={{ marginBottom: "20px", fontSize: "18px", fontWeight: "700" }}>Évolution du poids</h3>
                  <div style={{ 
                    padding: "24px", 
                    borderRadius: "16px", 
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border)"
                  }}>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="var(--text-secondary)"
                          style={{ fontSize: '13px' }}
                          tick={{ fill: 'var(--text-secondary)' }}
                        />
                        <YAxis 
                          stroke="var(--text-secondary)"
                          style={{ fontSize: '13px' }}
                          tick={{ fill: 'var(--text-secondary)' }}
                          width={50}
                        />
                        <Tooltip 
                          contentStyle={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '12px'
                          }}
                          labelStyle={{ fontWeight: '600', marginBottom: '4px' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="var(--primary)" 
                          strokeWidth={3}
                          dot={{ fill: 'var(--primary)', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Liste de l'historique */}
              <div>
                <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '700' }}>
                  Historique des séances ({history.length} total{history.length > 1 ? 'es' : ''})
                </h3>
                {displayedHistory.map((entry, index) => (
                  <div key={entry.id} style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: index === 0 ? 'var(--surface-elevated)' : 'transparent',
                    border: index === 0 ? '2px solid var(--primary)' : '1px solid var(--border)',
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {new Date(entry.performed_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                        {index === 0 && (
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'var(--primary)',
                            color: 'white',
                            fontWeight: '700'
                          }}>
                            DERNIER
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {entry.sets} séries × {entry.reps} reps
                      </div>
                      {entry.notes && (
                        <div style={{ 
                          fontSize: '13px', 
                          color: 'var(--text-secondary)', 
                          marginTop: '8px',
                          fontStyle: 'italic'
                        }}>
                          💬 {entry.notes}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '800', 
                        color: index === 0 ? 'var(--primary)' : 'var(--text-primary)'
                      }}>
                        {entry.weight} {entry.weight_unit}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Bouton "Voir plus" */}
                {hasMore && (
                  <button
                    onClick={() => setDisplayLimit(prev => prev + 10)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px dashed var(--border)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginTop: '8px'
                    }}
                  >
                    <ChevronDown size={20} />
                    Voir plus ({history.length - displayLimit} restantes)
                  </button>
                )}

                {displayLimit > 5 && (
                  <button
                    onClick={() => setDisplayLimit(5)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px dashed var(--border)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginTop: '8px'
                    }}
                  >
                    <ChevronUp size={20} />
                    Voir moins
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExerciseHistoryModal
