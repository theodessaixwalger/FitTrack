import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { getDayName } from '../services/exerciceService'

function AddDayModal({ isOpen, onClose, onAddDay, existingDays }) {
  const [selectedDay, setSelectedDay] = useState(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const daysOfWeek = [
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' },
    { value: 0, label: 'Dimanche' },
  ]

  const availableDays = daysOfWeek.filter(day => 
    !existingDays?.some(d => d.day_of_week === day.value)
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await onAddDay(selectedDay, name, description)
      setName('')
      setDescription('')
      setSelectedDay(availableDays[0]?.value || 1)
      onClose()
    } catch (error) {
      console.error('Erreur ajout jour:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  if (availableDays.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Ajouter un jour</h2>
            <button className="modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className="modal-body">
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              Tous les jours de la semaine sont déjà utilisés dans ce programme.
            </p>
          </div>
          <div className="modal-footer">
            <button onClick={onClose} className="btn">
              Fermer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ajouter un jour d'entraînement</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Jour de la semaine</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                className="input"
              >
                {availableDays.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Nom de la séance</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Push Day, Leg Day..."
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label>Description (optionnel)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez cette séance..."
                className="input"
                rows="3"
                style={{ resize: 'vertical' }}
              />
            </div>
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
            <button
              type="submit"
              className="btn"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  Ajout...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Ajouter le jour
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDayModal
