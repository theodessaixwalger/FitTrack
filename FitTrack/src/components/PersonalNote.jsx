import { useState, useEffect } from 'react'
import { Edit2, Save, X } from 'lucide-react'
import { getUserNote, saveUserNote } from '../services/noteService'

function PersonalNote({ userId }) {
  const [note, setNote] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedNote, setEditedNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    loadNote()
  }, [userId])

  const loadNote = async () => {
    try {
      const data = await getUserNote(userId)
      const noteContent = data?.content || ''
      setNote(noteContent)
      setEditedNote(noteContent)
    } catch (error) {
      console.error('Erreur chargement note:', error)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedNote(note)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedNote(note)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await saveUserNote(userId, editedNote)
      setNote(editedNote)
      setIsEditing(false)
      
      // Afficher le message de confirmation
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 2000)
    } catch (error) {
      console.error('Erreur sauvegarde note:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">📝 Notes personnelles</h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            style={{
              background: 'transparent',
              border: '2px solid var(--border-light)',
              borderRadius: '12px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.color = 'var(--primary)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-light)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
          >
            <Edit2 size={16} />
            Modifier
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-body">
          {isEditing ? (
            <>
              <textarea
                value={editedNote}
                onChange={(e) => setEditedNote(e.target.value)}
                placeholder="Écrivez vos notes, objectifs, réflexions du jour..."
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '16px',
                  border: '2px solid var(--border-light)',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
              />
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '16px'
              }}>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'var(--primary)',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    opacity: isSaving ? 0.7 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isSaving) e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {isSaving ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid white',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                      }} />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Enregistrer
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: '2px solid var(--border-light)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    opacity: isSaving ? 0.5 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isSaving) {
                      e.currentTarget.style.borderColor = '#EF4444'
                      e.currentTarget.style.color = '#EF4444'
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  <X size={18} />
                  Annuler
                </button>
              </div>
            </>
          ) : (
            <div style={{
              minHeight: '100px',
              padding: '8px',
              color: note ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '15px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {note || 'Aucune note pour le moment. Cliquez sur "Modifier" pour ajouter vos pensées, objectifs ou réflexions du jour.'}
            </div>
          )}

          {showSaved && (
            <div style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#10B981',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
              zIndex: 1000,
              animation: 'slideUp 0.3s ease'
            }}>
              ✓ Note enregistrée avec succès
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PersonalNote
