import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveUserProfile } from '../services/profileService'
import '../index.css'

function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    height: '',
    current_weight: '',
    target_weight: '',
    fitness_goal: '',
    activity_level: '',
    dietary_preference: ''
  })
  const [loading, setLoading] = useState(false)

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await saveUserProfile(formData)
      navigate('/')
    } catch (error) {
      alert('Erreur lors de la sauvegarde du profil')
    } finally {
      setLoading(false)
    }
  }

  const fitnessGoals = [
    { value: 'lose_weight', label: 'Perte de poids', icon: '🔥', desc: 'Brûler les graisses' },
    { value: 'gain_muscle', label: 'Prise de masse', icon: '💪', desc: 'Gagner du muscle' },
    { value: 'maintain', label: 'Maintien', icon: '⚖️', desc: 'Stabiliser' },
    { value: 'recomp', label: 'Recomposition', icon: '⚡', desc: 'Transformer' }
  ]

  const activityLevels = [
    { value: 'sedentary', label: 'Sédentaire', icon: '🪑', desc: 'Peu ou pas d\'exercice' },
    { value: 'light', label: 'Léger', icon: '🚶', desc: '1-3 jours/semaine' },
    { value: 'moderate', label: 'Modéré', icon: '🏃', desc: '3-5 jours/semaine' },
    { value: 'active', label: 'Actif', icon: '🏋️', desc: '6-7 jours/semaine' },
    { value: 'very_active', label: 'Très actif', icon: '🔥', desc: 'Entraînement intensif' }
  ]

  const renderStep1 = () => (
    <div className="step-content">
      <h2 className="step-title">
        <span className="step-icon">📜</span>
        Faisons connaissance
      </h2>
      <p className="step-description">Parlez-nous un peu de vous</p>

      <div className="form-group">
        <label className="form-label">Prénom <span className="required">*</span></label>
        <input
          type="text"
          className="form-input"
          value={formData.first_name}
          onChange={(e) => updateField('first_name', e.target.value)}
          placeholder="Jean"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Nom <span className="required">*</span></label>
        <input
          type="text"
          className="form-input"
          value={formData.last_name}
          onChange={(e) => updateField('last_name', e.target.value)}
          placeholder="Dupont"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Date de naissance <span className="required">*</span></label>
        <input
          type="date"
          className="form-input"
          value={formData.date_of_birth}
          onChange={(e) => updateField('date_of_birth', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Genre <span className="required">*</span></label>
        <div className="gender-group">
          <div className="gender-option">
            <input
              type="radio"
              id="male"
              name="gender"
              value="male"
              checked={formData.gender === 'male'}
              onChange={(e) => updateField('gender', e.target.value)}
            />
            <label htmlFor="male" className="gender-label">
              Homme
            </label>
          </div>
          <div className="gender-option">
            <input
              type="radio"
              id="female"
              name="gender"
              value="female"
              checked={formData.gender === 'female'}
              onChange={(e) => updateField('gender', e.target.value)}
            />
            <label htmlFor="female" className="gender-label">
              Femme
            </label>
          </div>
          <div className="gender-option">
            <input
              type="radio"
              id="other"
              name="gender"
              value="other"
              checked={formData.gender === 'other'}
              onChange={(e) => updateField('gender', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="step-content">
      <h2 className="step-title">
        <span className="step-icon">📏</span>
        Vos mensurations
      </h2>
      <p className="step-description">Ces informations nous aident à personnaliser vos objectifs</p>

      <div className="form-group">
        <label className="form-label">Taille (cm) <span className="required">*</span></label>
        <input
          type="number"
          className="form-input"
          value={formData.height}
          onChange={(e) => updateField('height', e.target.value)}
          placeholder="175"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Poids actuel (kg) <span className="required">*</span></label>
        <input
          type="number"
          step="0.1"
          className="form-input"
          value={formData.current_weight}
          onChange={(e) => updateField('current_weight', e.target.value)}
          placeholder="70.0"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Poids cible (kg) <span className="required">*</span></label>
        <input
          type="number"
          step="0.1"
          className="form-input"
          value={formData.target_weight}
          onChange={(e) => updateField('target_weight', e.target.value)}
          placeholder="65.0"
        />
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="step-content">
      <h2 className="step-title">
        <span className="step-icon">🎯</span>
        Votre objectif
      </h2>
      <p className="step-description">Quel est votre objectif principal ?</p>

      <div className="goals-grid">
        {fitnessGoals.map(goal => (
          <div
            key={goal.value}
            className={`goal-card ${formData.fitness_goal === goal.value ? 'selected' : ''}`}
            onClick={() => updateField('fitness_goal', goal.value)}
          >
            <div className="goal-content">
              <span className="goal-icon">{goal.icon}</span>
              <div className="goal-label">{goal.label}</div>
              <div className="goal-desc">{goal.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="form-group">
        <label className="form-label">Niveau d'activité physique <span className="required">*</span></label>
        <div className="activity-list">
          {activityLevels.map(activity => (
            <div
              key={activity.value}
              className={`activity-item ${formData.activity_level === activity.value ? 'selected' : ''}`}
              onClick={() => updateField('activity_level', activity.value)}
            >
              <span className="activity-icon">{activity.icon}</span>
              <div className="activity-info">
                <div className="activity-name">{activity.label}</div>
                <div className="activity-desc">{activity.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="step-content">
      <h2 className="step-title">
        <span className="step-icon">✅</span>
        Récapitulatif
      </h2>
      <p className="step-description">Vérifiez vos informations avant de commencer</p>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-label">Nom complet</div>
          <div className="summary-value">{formData.first_name} {formData.last_name}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Mensurations</div>
          <div className="summary-value">{formData.height} cm • {formData.current_weight} kg → {formData.target_weight} kg</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Objectif</div>
          <div className="summary-value">
            {fitnessGoals.find(g => g.value === formData.fitness_goal)?.label}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Activité physique</div>
          <div className="summary-value">
            {activityLevels.find(a => a.value === formData.activity_level)?.label}
          </div>
        </div>
      </div>
    </div>
  )

  const progress = (step / 4) * 100

  return (
    <div className="onboarding-container">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="onboarding-card">
        <div className="onboarding-header">
          <div className="app-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <h1 className="app-title">FitnessTracker</h1>
          <p className="onboarding-subtitle">Configuration de votre profil</p>
        </div>

        <div className="progress-container">
          <div className="progress-text">
            <span>Étape {step} sur 4</span>
            <span>{Math.round(progress)}% completé</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="onboarding-content">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        <div className="onboarding-navigation">
          {step > 1 && (
            <button className="btn btn-secondary" onClick={prevStep}>
              ← Retour
            </button>
          )}
          {step < 4 ? (
            <button className="btn btn-primary" onClick={nextStep}>
              Continuer →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  ✨ Commencer
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Onboarding