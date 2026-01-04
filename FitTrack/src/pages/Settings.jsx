import { ArrowLeft, Globe, Bell, Trash2, Moon, Sun, Lock, ChevronRight, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

function Settings() {
  const navigate = useNavigate()
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('fr')
  const [notificationPrefs, setNotificationPrefs] = useState({
    meals: true,
    workouts: true,
    streak: true,
    weigh: false
  })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // Scroll to top when component mounts
  useEffect(() => {
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [])

  // Load settings from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    const savedLanguage = localStorage.getItem('language') || 'fr'
    const savedNotifications = JSON.parse(localStorage.getItem('notificationPrefs') || '{"meals":true,"workouts":true,"streak":true,"weigh":false}')
    
    setTheme(savedTheme)
    setLanguage(savedLanguage)
    setNotificationPrefs(savedNotifications)
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const handleNotificationToggle = (key) => {
    const newPrefs = { ...notificationPrefs, [key]: !notificationPrefs[key] }
    setNotificationPrefs(newPrefs)
    localStorage.setItem('notificationPrefs', JSON.stringify(newPrefs))
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    // Validation
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return
    }

    setChangingPassword(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) throw error

      setPasswordSuccess(true)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordSuccess(false)
      }, 2000)
    } catch (error) {
      setPasswordError(error.message || 'Erreur lors du changement de mot de passe')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleClearCache = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider le cache ? Cela peut améliorer les performances.')) {
      const keysToKeep = ['theme', 'language', 'notificationPrefs']
      const allKeys = Object.keys(localStorage)
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key)
        }
      })
      
      alert('Cache vidé avec succès !')
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
        <h1>Paramètres</h1>
        <p className="subtitle">Personnalisez votre expérience</p>
      </div>

      <div className="page-content">
        {/* Apparence */}
        <div className="section">
          <h2 className="section-title">Apparence</h2>
          
          <div style={{
            background: 'var(--surface)',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                  Mode {theme === 'light' ? 'clair' : 'sombre'}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Changer l'apparence de l'application
                </p>
              </div>
              <button
                onClick={toggleTheme}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '2px solid var(--border-light)',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  flexShrink: 0
                }}
              >
                {theme === 'light' ? (
                  <Sun size={24} style={{ color: '#FDB813' }} />
                ) : (
                  <Moon size={24} style={{ color: 'var(--primary)' }} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Langue */}
        <div className="section">
          <h2 className="section-title">
            <Globe size={20} style={{ marginRight: '8px' }} />
            Langue
          </h2>
          
          <div style={{
            background: 'var(--surface)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <button
              onClick={() => handleLanguageChange('fr')}
              style={{
                padding: '16px 20px',
                border: `2px solid ${language === 'fr' ? 'var(--primary)' : 'var(--border-light)'}`,
                borderRadius: '12px',
                background: 'white',
                color: language === 'fr' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '24px' }}>🇫🇷</span>
              Français
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              style={{
                padding: '16px 20px',
                border: `2px solid ${language === 'en' ? 'var(--primary)' : 'var(--border-light)'}`,
                borderRadius: '12px',
                background: 'white',
                color: language === 'en' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '24px' }}>🇬🇧</span>
              English
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="section">
          <h2 className="section-title">
            <Bell size={20} style={{ marginRight: '8px' }} />
            Notifications
          </h2>
          
          <div style={{
            background: 'var(--surface)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Repas */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '2px' }}>
                  Rappels de repas
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Notifications pour logger vos repas
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle('meals')}
                style={{
                  width: '48px',
                  height: '28px',
                  borderRadius: '14px',
                  border: 'none',
                  background: notificationPrefs.meals ? 'var(--primary)' : '#ccc',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '4px',
                  left: notificationPrefs.meals ? '24px' : '4px',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>

            <div style={{ height: '1px', background: 'var(--border-light)' }} />

            {/* Exercices */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '2px' }}>
                  Rappels d'exercices
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Notifications pour vos séances
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle('workouts')}
                style={{
                  width: '48px',
                  height: '28px',
                  borderRadius: '14px',
                  border: 'none',
                  background: notificationPrefs.workouts ? 'var(--primary)' : '#ccc',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '4px',
                  left: notificationPrefs.workouts ? '24px' : '4px',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>

            <div style={{ height: '1px', background: 'var(--border-light)' }} />

            {/* Streak */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '2px' }}>
                  Alertes de streak
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Rappels pour maintenir votre série
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle('streak')}
                style={{
                  width: '48px',
                  height: '28px',
                  borderRadius: '14px',
                  border: 'none',
                  background: notificationPrefs.streak ? 'var(--primary)' : '#ccc',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '4px',
                  left: notificationPrefs.streak ? '24px' : '4px',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>

            <div style={{ height: '1px', background: 'var(--border-light)' }} />

            {/* Pesée */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '2px' }}>
                  Rappels de pesée
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Notifications hebdomadaires
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle('weigh')}
                style={{
                  width: '48px',
                  height: '28px',
                  borderRadius: '14px',
                  border: 'none',
                  background: notificationPrefs.weigh ? 'var(--primary)' : '#ccc',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '4px',
                  left: notificationPrefs.weigh ? '24px' : '4px',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>
          </div>
        </div>

        {/* Sécurité */}
        <div className="section">
          <h2 className="section-title">
            <Lock size={20} style={{ marginRight: '8px' }} />
            Sécurité
          </h2>
          
          <button
            onClick={() => setShowPasswordModal(true)}
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
            <Lock size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                Changer le mot de passe
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Modifier votre mot de passe de connexion
              </div>
            </div>
            <ChevronRight size={20} style={{ color: 'var(--text-tertiary)' }} />
          </button>
        </div>

        {/* Maintenance */}
        <div className="section">
          <h2 className="section-title">
            <Trash2 size={20} style={{ marginRight: '8px' }} />
            Maintenance
          </h2>
          
          <button
            onClick={handleClearCache}
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
            <Trash2 size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                Vider le cache
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Améliorer les performances de l'application
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
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
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>
                Changer le mot de passe
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordError('')
                  setPasswordSuccess(false)
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text-secondary)'
                }}>
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid var(--border-light)',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontFamily: 'inherit'
                  }}
                  required
                  minLength={6}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text-secondary)'
                }}>
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid var(--border-light)',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>

              {passwordError && (
                <div style={{
                  padding: '12px',
                  background: '#fee',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  color: '#EF4444'
                }}>
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div style={{
                  padding: '12px',
                  background: '#d1fae5',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  color: '#10B981'
                }}>
                  ✓ Mot de passe modifié avec succès !
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordError('')
                    setPasswordSuccess(false)
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
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
                  type="submit"
                  disabled={changingPassword}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--primary)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: changingPassword ? 'not-allowed' : 'pointer',
                    opacity: changingPassword ? 0.6 : 1
                  }}
                >
                  {changingPassword ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
