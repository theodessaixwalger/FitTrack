import { ArrowLeft, Shield, Lock, Eye, Trash2, Download, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

function Privacy() {
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Scroll to top when component mounts - target the Layout's main element
  useEffect(() => {
    // The scrollable element is the <main> in Layout.jsx
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'instant' })
    }
    
    // Backup with setTimeout
    setTimeout(() => {
      if (mainElement) {
        mainElement.scrollTo({ top: 0, behavior: 'instant' })
      }
    }, 0)
  }, [])

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      // Supprimer toutes les données de l'utilisateur
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Supprimer les données dans l'ordre (à cause des foreign keys)
        await supabase.from('exercise_sets').delete().eq('user_id', user.id)
        await supabase.from('day_exercises').delete().eq('user_id', user.id)
        await supabase.from('program_days').delete().eq('user_id', user.id)
        await supabase.from('workout_programs').delete().eq('user_id', user.id)
        await supabase.from('meal_foods').delete().eq('user_id', user.id)
        await supabase.from('meals').delete().eq('user_id', user.id)
        await supabase.from('user_activity').delete().eq('user_id', user.id)
        await supabase.from('weight_logs').delete().eq('user_id', user.id)
        await supabase.from('personal_notes').delete().eq('user_id', user.id)
        await supabase.from('profiles').delete().eq('id', user.id)
        
        // Supprimer le compte
        await supabase.auth.admin.deleteUser(user.id)
        
        // Déconnexion
        await supabase.auth.signOut()
        navigate('/auth')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Erreur lors de la suppression du compte')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleExportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Récupérer toutes les données
        const [profile, programs, meals, weights, notes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('workout_programs').select('*').eq('user_id', user.id),
          supabase.from('meals').select('*').eq('user_id', user.id),
          supabase.from('weight_logs').select('*').eq('user_id', user.id),
          supabase.from('personal_notes').select('*').eq('user_id', user.id)
        ])

        const exportData = {
          profile: profile.data,
          programs: programs.data,
          meals: meals.data,
          weights: weights.data,
          notes: notes.data,
          exportDate: new Date().toISOString()
        }

        // Télécharger en JSON
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `fittrack-data-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Erreur lors de l\'export des données')
    }
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <button
          onClick={() => navigate('/profile')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '16px'
          }}
        >
          <ArrowLeft size={20} />
          Retour
        </button>
        <h1>Confidentialité & Sécurité</h1>
        <p className="subtitle">Gérez vos données et votre compte</p>
      </div>

      <div className="page-content">
        {/* Informations sur les données */}
        <div className="section">
          <h2 className="section-title">
            <Shield size={20} style={{ marginRight: '8px' }} />
            Vos Données
          </h2>
          
          <div style={{
            background: 'var(--surface)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
              Données collectées
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                Informations de profil (nom, email, objectifs)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                Programmes d'entraînement et exercices
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                Repas et nutrition
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                Poids et progression
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                Notes personnelles
              </li>
            </ul>
          </div>

          <div style={{
            background: 'var(--surface)',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
              Utilisation des données
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Vos données sont utilisées uniquement pour vous fournir les fonctionnalités de l'application. 
              Elles ne sont jamais partagées avec des tiers et restent privées.
            </p>
          </div>
        </div>

        {/* Sécurité */}
        <div className="section">
          <h2 className="section-title">
            <Lock size={20} style={{ marginRight: '8px' }} />
            Sécurité
          </h2>
          
          <div style={{
            background: 'var(--surface)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Shield size={24} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                  Chiffrement des données
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Toutes vos données sont chiffrées et sécurisées
                </p>
              </div>
            </div>
            
            <div style={{ 
              height: '1px', 
              background: 'var(--border-light)',
              margin: '4px 0'
            }} />
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Eye size={24} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                  Données privées
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Seul vous pouvez voir vos données personnelles
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="section">
          <h2 className="section-title">Actions</h2>
          
          {/* Export des données */}
          <button
            onClick={handleExportData}
            style={{
              width: '100%',
              padding: '20px',
              background: 'var(--surface)',
              border: '2px solid var(--border-light)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-light)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <Download size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                Exporter mes données
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Télécharger toutes vos données au format JSON
              </div>
            </div>
          </button>

          {/* Supprimer le compte */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              width: '100%',
              padding: '20px',
              background: 'var(--surface)',
              border: '2px solid #fee',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#EF4444'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#fee'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <Trash2 size={24} style={{ color: '#EF4444', flexShrink: 0 }} />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', color: '#EF4444' }}>
                Supprimer mon compte
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Cette action est irréversible
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#fee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertCircle size={24} style={{ color: '#EF4444' }} />
            </div>
            
            <h3 style={{
              fontSize: '20px',
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: '12px'
            }}>
              Supprimer le compte ?
            </h3>
            
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              Cette action est <strong>irréversible</strong>. Toutes vos données seront définitivement supprimées.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--surface)',
                  border: '2px solid var(--border-light)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#EF4444',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.6 : 1
                }}
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Privacy
