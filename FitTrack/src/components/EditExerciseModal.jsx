import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'

function EditExerciseModal({ isOpen, onClose, exercise, onSave }) {
  const [sets, setSets] = useState([])
  const [deletedSetIds, setDeletedSetIds] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Charger les sets quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && exercise) {
      // Copier les sets existants
      setSets(exercise.sets && exercise.sets.length > 0 
        ? [...exercise.sets] 
        : [{ reps: '', weight: '', weight_unit: 'kg' }]
      )
      setDeletedSetIds([])
    }
  }, [isOpen, exercise])

  const addSet = () => {
    setSets([...sets, { reps: '', weight: '', weight_unit: 'kg' }])
  }

  const removeSet = (index) => {
    const setToRemove = sets[index]
    
    // Si le set a un ID, le marquer pour suppression
    if (setToRemove.id) {
      setDeletedSetIds([...deletedSetIds, setToRemove.id])
    }
    
    // Retirer le set de la liste
    setSets(sets.filter((_, i) => i !== index))
  }

  const updateSet = (index, field, value) => {
    const newSets = [...sets]
    newSets[index][field] = value
    setSets(newSets)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Valider que tous les sets ont des reps
    const validSets = sets.filter(set => set.reps && set.reps > 0)
    if (validSets.length === 0) {
      alert('Veuillez renseigner au moins une série avec des répétitions')
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(exercise.id, validSets, deletedSetIds)
      onClose()
    } catch (error) {
      console.error('Erreur modification exercice:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !exercise) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h2>Modifier - {exercise.exercise_name}</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
            {/* Séries */}
            <div className="form-group">
              <label style={{ marginBottom: '12px', display: 'block', fontWeight: '600' }}>
                Séries ({sets.length})
              </label>
              
              {sets.map((set, index) => (
                <div key={set.id || index} style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '12px', 
                  marginBottom: '16px',
                  padding: '16px',
                  background: 'var(--surface-elevated)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)'
                }}>
                  {/* En-tête avec numéro et bouton supprimer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontWeight: '700',
                      color: 'var(--primary)',
                      fontSize: '16px'
                    }}>
                      Série #{index + 1}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => removeSet(index)}
                      disabled={sets.length === 1}
                      style={{
                        background: sets.length === 1 ? 'var(--surface)' : 'transparent',
                        border: 'none',
                        color: sets.length === 1 ? 'var(--text-secondary)' : '#EF4444',
                        cursor: sets.length === 1 ? 'not-allowed' : 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: sets.length === 1 ? 0.5 : 1
                      }}
                      title="Supprimer cette série"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Inputs en colonne pour mobile */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Répétitions */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '13px', 
                        fontWeight: '600',
                        marginBottom: '6px',
                        color: 'var(--text-secondary)'
                      }}>
                        Répétitions
                      </label>
                      <input
                        type="number"
                        placeholder="Reps"
                        value={set.reps}
                        onChange={(e) => updateSet(index, 'reps', e.target.value)}
                        className="input"
                        min="1"
                        required
                        style={{ 
                          width: '100%',
                          fontSize: '16px',
                          padding: '12px',
                          textAlign: 'center'
                        }}
                      />
                    </div>

                    {/* Poids et unité */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '13px', 
                          fontWeight: '600',
                          marginBottom: '6px',
                          color: 'var(--text-secondary)'
                        }}>
                          Poids
                        </label>
                        <input
                          type="number"
                          placeholder="Poids"
                          value={set.weight}
                          onChange={(e) => updateSet(index, 'weight', e.target.value)}
                          className="input"
                          step="0.05"
                          min="0"
                          style={{ 
                            width: '100%',
                            fontSize: '16px',
                            padding: '12px',
                            textAlign: 'center'
                          }}
                        />
                      </div>
                      
                      <div style={{ width: '90px' }}>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '13px', 
                          fontWeight: '600',
                          marginBottom: '6px',
                          color: 'var(--text-secondary)'
                        }}>
                          Unité
                        </label>
                        <select
                          value={set.weight_unit}
                          onChange={(e) => updateSet(index, 'weight_unit', e.target.value)}
                          className="input"
                          style={{ 
                            width: '100%',
                            fontSize: '16px',
                            padding: '12px'
                          }}
                        >
                          <option value="kg">kg</option>
                          <option value="lbs">lbs</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addSet}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px dashed var(--border)',
                  background: 'transparent',
                  color: 'var(--primary)',
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
                <Plus size={20} />
                Ajouter une série
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditExerciseModal
