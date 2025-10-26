import { Plus, Activity, TrendingUp, Flame, Target, Award } from 'lucide-react'
import { useNutrition } from '../context/NutritionContext'
import { useNavigate } from 'react-router-dom'
import PersonalNote from '../components/PersonalNote'

function Home() {
  const { 
    dailyNutrition, 
    loading, 
    calorieGoal, 
    proteinGoal, 
    carbsGoal, 
    fatsGoal,
    calculateProgress,
    getRemainingCalories 
  } = useNutrition()
  
  const navigate = useNavigate()
  const userId = 'user-demo' // À remplacer par l'ID réel de l'utilisateur connecté

  if (loading) {
    return (
      <div className="page">
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid var(--border-light)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <div style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
            Chargement...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Bonjour, Théo 👋</h1>
          <p className="subtitle">Prêt à atteindre tes objectifs aujourd'hui ?</p>
        </div>
      </div>

      <div className="page-content">
        {/* Hero Card - Calories */}
        <div className="hero-card">
          <div className="label">Calories aujourd'hui</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="value">{Math.round(dailyNutrition.calories)}</span>
            <span className="unit">/ {calorieGoal.toLocaleString()} kcal</span>
          </div>
          <div style={{ marginTop: '24px' }}>
            <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="progress-fill" style={{ 
                width: `${calculateProgress()}%`,
                background: 'rgba(255,255,255,0.9)',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
            <div style={{ 
              marginTop: '12px', 
              fontSize: '14px', 
              opacity: '0.9',
              fontWeight: '600'
            }}>
              {dailyNutrition.calories < calorieGoal 
                ? `Plus que ${Math.round(getRemainingCalories())} kcal pour atteindre votre objectif 🎯`
                : `Objectif atteint ! 🎉`
              }
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="section">
          <h2 className="section-title">Macronutriments</h2>
          <div className="macros-grid">
            <div className="macro-item">
              <div className="macro-circle" style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{Math.round(dailyNutrition.proteins)}g</div>
                  <div style={{ fontSize: '11px', opacity: '0.9', fontWeight: '600' }}>Protéines</div>
                </div>
              </div>
              <div className="macro-value">{Math.round(dailyNutrition.proteins)} / {proteinGoal}g</div>
            </div>
            <div className="macro-item">
              <div className="macro-circle" style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #44A9A3 100%)' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{Math.round(dailyNutrition.carbs)}g</div>
                  <div style={{ fontSize: '11px', opacity: '0.9', fontWeight: '600' }}>Glucides</div>
                </div>
              </div>
              <div className="macro-value">{Math.round(dailyNutrition.carbs)} / {carbsGoal}g</div>
            </div>
            <div className="macro-item">
              <div className="macro-circle" style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{Math.round(dailyNutrition.fats)}g</div>
                  <div style={{ fontSize: '11px', opacity: '0.9', fontWeight: '600' }}>Lipides</div>
                </div>
              </div>
              <div className="macro-value">{Math.round(dailyNutrition.fats)} / {fatsGoal}g</div>
            </div>
          </div>
        </div>

        {/* Notes personnelles */}
        <PersonalNote userId={userId} />
      </div>
    </div>
  )
}

export default Home
