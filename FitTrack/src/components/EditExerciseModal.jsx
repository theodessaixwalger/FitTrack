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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modifier - {exercise.exercise_name}</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Séries */}
            <div className="form-group">
              <label style={{ marginBottom: '12px', display: 'block', fontWeight: '600' }}>
                Séries ({sets.length})
              </label>
              
              {sets.map((set, index) => (
                <div key={set.id || index} style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginBottom: '12px',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'var(--surface-elevated)',
                  borderRadius: '12px'
                }}>
                  <span style={{ 
                    width: '30px', 
                    fontWeight: '700',
                    color: 'var(--text-secondary)',
                    fontSize: '14px'
                  }}>
                    #{index + 1}
                  </span>
                  
                  <div style={{ flex: '0 0 100px' }}>
                    <input
                      type="number"
                      placeholder="Reps"
                      value={set.reps}
                      onChange={(e) => updateSet(index, 'reps', e.target.value)}
                      className="input"
                      min="1"
                      required
                      style={{ textAlign: 'center' }}
                    />
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', textAlign: 'center' }}>
                      Reps
                    </div>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      placeholder="Poids"
                      value={set.weight}
                      onChange={(e) => updateSet(index, 'weight', e.target.value)}
                      className="input"
                      step="0.05"
                      min="0"
                      style={{ textAlign: 'center' }}
                    />
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', textAlign: 'center' }}>
                      Poids
                    </div>
                  </div>
                  
                  <select
                    value={set.weight_unit}
                    onChange={(e) => updateSet(index, 'weight_unit', e.target.value)}
                    className="input"
                    style={{ width: '70px' }}
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                  
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
                    <X size={18} />
                  </button>
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
