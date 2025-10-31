import { useState } from 'react'
import { X, Plus } from 'lucide-react'

function CreateProgramModal({ isOpen, onClose, onCreateProgram }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState('#667EEA')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const colors = [
    { value: '#667EEA', label: 'Violet' },
    { value: '#4ECDC4', label: 'Turquoise' },
    { value: '#FF6B35', label: 'Orange' },
    { value: '#F093FB', label: 'Rose' },
    { value: '#FF6B6B', label: 'Rouge' },
    { value: '#4ECDC4', label: 'Vert' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await onCreateProgram(name, description, selectedColor)
      setName('')
      setDescription('')
      setSelectedColor('#667EEA')
      onClose()
    } catch (error) {
      console.error('Erreur création programme:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Créer un programme</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nom du programme</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Programme Full Body"
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label>Description (optionnel)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre programme..."
                className="input"
                rows="3"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label>Couleur du programme</label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '12px',
                marginTop: '8px'
              }}>
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: selectedColor === color.value ? '3px solid ' + color.value : '2px solid var(--border-light)',
                      background: color.value,
                      color: 'white',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: selectedColor === color.value ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    {color.label}
                  </button>
                ))}
              </div>
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
                  Création...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Créer le programme
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProgramModal
