// src/components/EditMacrosModal.jsx
import { useState, useEffect } from 'react'
import { X, Fire } from '@phosphor-icons/react'

function EditMacrosModal({ isOpen, onClose, currentGoals, onSave }) {
  const [goals, setGoals] = useState(currentGoals)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setGoals(currentGoals)
  }, [currentGoals, isOpen])

  const handleChange = (field, value) => {
    const numValue = parseInt(value) || 0
    setGoals(prev => ({ ...prev, [field]: numValue }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(goals)
      onClose()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '1px solid var(--border-light)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface)'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '800',
            color: 'var(--text-primary)'
          }}>
            Modifier les objectifs
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--background)',
              border: '2px solid var(--border-light)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.color = 'var(--primary)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-light)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            <X weight="bold" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ 
          padding: '24px',
          background: 'var(--background)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Calories */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                <Fire size={15} style={{ verticalAlign: '-2px', marginRight: '5px', color: 'var(--m-cal)' }} />
                Calories (kcal)
              </label>
              <input
                type="number"
                value={goals.calorieGoal}
                onChange={(e) => handleChange('calorieGoal', e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid var(--border-light)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--m-cal)'
                  e.target.style.boxShadow = '0 0 0 3px var(--m-cal-halo)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-light)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Protéines */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                🥩 Protéines (g)
              </label>
              <input
                type="number"
                value={goals.proteinGoal}
                onChange={(e) => handleChange('proteinGoal', e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid var(--border-light)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--m-pro)'
                  e.target.style.boxShadow = '0 0 0 3px var(--m-pro-halo)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-light)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Glucides */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                🍞 Glucides (g)
              </label>
              <input
                type="number"
                value={goals.carbsGoal}
                onChange={(e) => handleChange('carbsGoal', e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid var(--border-light)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--m-car)'
                  e.target.style.boxShadow = '0 0 0 3px var(--m-car-halo)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-light)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Lipides */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                🥑 Lipides (g)
              </label>
              <input
                type="number"
                value={goals.fatsGoal}
                onChange={(e) => handleChange('fatsGoal', e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid var(--border-light)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--m-fat)'
                  e.target.style.boxShadow = '0 0 0 3px var(--m-fat-halo)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-light)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{
            marginTop: '24px',
            display: 'flex',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                border: '2px solid var(--border-light)',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--background)'
                e.currentTarget.style.borderColor = 'var(--text-secondary)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--surface)'
                e.currentTarget.style.borderColor = 'var(--border-light)'
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: '14px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                background: saving 
                  ? 'var(--border-light)' 
                  : 'var(--accent)',
                color: saving ? 'var(--text-secondary)' : 'var(--ink)',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: saving 
                  ? 'none' 
                  : 'var(--glow-accent)'
              }}
              onMouseOver={(e) => {
                if (!saving) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 0 34px rgba(212, 255, 63, 0.32)'
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                if (!saving) {
                  e.currentTarget.style.boxShadow = 'var(--glow-accent)'
                }
              }}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditMacrosModal
