import { useState, useEffect } from 'react'
import { X, Plus, Search } from 'lucide-react'
import { getAllExercises, getMuscleGroupIcon } from '../services/exerciceService'

function AddExerciseModal({ isOpen, onClose, onAddExercise }) {
  const [exercises, setExercises] = useState([])
  const [filteredExercises, setFilteredExercises] = useState([])
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all')
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState('10-12')
  const [restSeconds, setRestSeconds] = useState(60)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const muscleGroups = ['all', 'Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Biceps', 'Triceps', 'Abdominaux']

  useEffect(() => {
    if (isOpen) {
      loadExercises()
    }
  }, [isOpen])

  useEffect(() => {
    filterExercises()
  }, [exercises, searchTerm, selectedMuscleGroup])

  const loadExercises = async () => {
    try {
      setLoading(true)
      const data = await getAllExercises()
      setExercises(data)
    } catch (error) {
      console.error('Erreur chargement exercices:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterExercises = () => {
    let filtered = exercises

    if (selectedMuscleGroup !== 'all') {
      filtered = filtered.filter(ex => ex.muscle_group === selectedMuscleGroup)
    }

    if (searchTerm) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredExercises(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedExercise) return

    setIsSubmitting(true)
    try {
      await onAddExercise(selectedExercise.id, sets, reps, restSeconds, notes)
      resetForm()
      onClose()
    } catch (error) {
      console.error('Erreur ajout exercice:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedExercise(null)
    setSearchTerm('')
    setSelectedMuscleGroup('all')
    setSets(3)
    setReps('10-12')
    setRestSeconds(60)
    setNotes('')
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ajouter un exercice</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {!selectedExercise ? (
              <>
                {/* Recherche */}
                <div className="form-group">
                  <div className="search-input">
                    <Search size={20} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Rechercher un exercice..."
                      className="input"
                    />
                  </div>
                </div>

                {/* Filtres groupes musculaires */}
                <div className="form-group">
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '16px'
                  }}>
                    {muscleGroups.map((group) => (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setSelectedMuscleGroup(group)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '20px',
                          border: 'none',
                          background: selectedMuscleGroup === group 
                            ? 'var(--primary)' 
                            : 'var(--surface-elevated)',
                          color: selectedMuscleGroup === group 
                            ? 'white' 
                            : 'var(--text-secondary)',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {group === 'all' ? 'Tous' : `${getMuscleGroupIcon(group)} ${group}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Liste des exercices */}
                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  marginTop: '16px'
                }}>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="spinner" style={{ margin: '0 auto' }} />
                    </div>
                  ) : filteredExercises.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: 'var(--text-secondary)'
                    }}>
                      Aucun exercice trouvé
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {filteredExercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          onClick={() => setSelectedExercise(exercise)}
                          style={{
                            padding: '16px',
                            borderRadius: '12px',
                            background: 'var(--surface-elevated)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'var(--surface-hover)'
                            e.currentTarget.style.transform = 'translateX(4px)'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'var(--surface-elevated)'
                            e.currentTarget.style.transform = 'translateX(0)'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{
                                fontSize: '16px',
                                fontWeight: '700',
                                marginBottom: '4px'
                              }}>
                                {exercise.name}
                              </div>
                              <div style={{
                                fontSize: '13px',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                gap: '12px'
                              }}>
                                <span>{getMuscleGroupIcon(exercise.muscle_group)} {exercise.muscle_group}</span>
                                {exercise.equipment && <span>• {exercise.equipment}</span>}
                              </div>
                            </div>
                            <div style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              background: 'var(--primary)',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: '700'
                            }}>
                              Sélectionner
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Exercice sélectionné */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'var(--surface-elevated)',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        marginBottom: '8px'
                      }}>
                        {selectedExercise.name}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)'
                      }}>
                        {getMuscleGroupIcon(selectedExercise.muscle_group)} {selectedExercise.muscle_group}
                        {selectedExercise.equipment && ` • ${selectedExercise.equipment}`}
                      </div>
                      {selectedExercise.description && (
                        <div style={{
                          marginTop: '8px',
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.5'
                        }}>
                          {selectedExercise.description}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedExercise(null)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--surface)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Configuration */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div className="form-group">
                    <label>Séries</label>
                    <input
                      type="number"
                      value={sets}
                      onChange={(e) => setSets(Number(e.target.value))}
                      min="1"
                      max="10"
                      className="input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Répétitions</label>
                    <input
                      type="text"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      placeholder="10-12"
                      className="input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Repos (sec)</label>
                    <input
                      type="number"
                      value={restSeconds}
                      onChange={(e) => setRestSeconds(Number(e.target.value))}
                      min="0"
                      step="15"
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes (optionnel)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Conseils d'exécution, progression..."
                    className="input"
                    rows="3"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            {selectedExercise && (
              <button
                type="submit"
                className="btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    Ajout...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Ajouter l'exercice
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddExerciseModal
