import { useState, useEffect } from 'react'
import { PencilSimple, FloppyDisk, X } from '@phosphor-icons/react'
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
        <h2 className="section-title">Notes personnelles</h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            style={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-strong)',
              borderRadius: '999px',
              padding: '7px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-line)'
              e.currentTarget.style.color = 'var(--accent)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            <PencilSimple size={14} />
            Modifier
          </button>
        )}
      </div>

      <div className="card glow-card">
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
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--r-md)',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  background: 'var(--surface-sunken)',
                  color: 'var(--text-primary)',
                  transition: 'border-color 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-strong)'}
              />
              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '16px'
              }}>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: '13px 24px',
                    borderRadius: 'var(--r-md)',
                    border: 'none',
                    background: 'var(--accent)',
                    color: 'var(--ink)',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 0 24px rgba(212, 255, 63, 0.2)',
                    opacity: isSaving ? 0.6 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isSaving) e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {isSaving ? (
                    <>
                      <div style={{
                        width: '15px',
                        height: '15px',
                        border: '2px solid rgba(13, 13, 13, 0.25)',
                        borderTopColor: 'var(--ink)',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                      }} />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FloppyDisk size={17} />
                      Enregistrer
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  style={{
                    padding: '13px 22px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--surface-elevated)',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
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
                      e.currentTarget.style.borderColor = 'var(--danger)'
                      e.currentTarget.style.color = 'var(--danger)'
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-strong)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  <X weight="bold" size={17} />
                  Annuler
                </button>
              </div>
            </>
          ) : (
            <div style={{
              minHeight: '90px',
              color: note ? 'var(--text-primary)' : 'var(--text-tertiary)',
              fontSize: '14px',
              lineHeight: '1.65',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {note || 'Aucune note pour le moment. Cliquez sur "Modifier" pour ajouter vos pensées, objectifs ou réflexions du jour.'}
            </div>
          )}

          {showSaved && (
            <div style={{
              position: 'fixed',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--accent)',
              color: 'var(--ink)',
              padding: '12px 22px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: '800',
              boxShadow: '0 8px 28px rgba(212, 255, 63, 0.3)',
              zIndex: 1000,
              whiteSpace: 'nowrap',
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
