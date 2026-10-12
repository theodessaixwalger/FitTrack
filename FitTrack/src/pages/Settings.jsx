import { ArrowLeft, Globe, Bell, Trash, Lock, CaretRight, X } from '@phosphor-icons/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import {
  DEFAULT_NOTIFICATION_PREFS,
  isPushSupported,
  needsHomeScreenInstall,
  getCurrentSubscription,
  enablePush,
  disablePush,
  getNotificationPreferences,
  saveNotificationPreferences
} from '../services/pushService'

function Toggle({ checked, onChange, disabled = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      style={{
        width: '48px',
        height: '28px',
        borderRadius: '14px',
        border: 'none',
        background: checked ? 'var(--primary)' : '#ccc',
        position: 'relative',
        cursor: disabled ? 'wait' : 'pointer',
        opacity: disabled ? 0.6 : 1,
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
        left: checked ? '24px' : '4px',
        transition: 'all 0.3s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </button>
  )
}

function SettingRow({ title, description, children }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '2px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>
      {children}
    </div>
  )
}

function Settings() {
  const navigate = useNavigate()
  const location = useLocation()
  const [language, setLanguage] = useState('fr')
  const [notificationPrefs, setNotificationPrefs] = useState(DEFAULT_NOTIFICATION_PREFS)
  const [pushSupported] = useState(() => isPushSupported())
  const [pushNeedsInstall] = useState(() => needsHomeScreenInstall())
  const [pushPermission, setPushPermission] = useState(() => (isPushSupported() ? Notification.permission : 'default'))
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const [pushMessage, setPushMessage] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // Scroll to top when component mounts, ou vers la section demandée (#notifications)
  useEffect(() => {
    const target = location.hash ? document.getElementById(location.hash.slice(1)) : null
    if (target) {
      target.scrollIntoView({ behavior: 'instant', block: 'start' })
      return
    }
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location.hash])

  // Load settings from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr'
    setLanguage(savedLanguage)
  }, [])

  // Notifications : préférences (Supabase) et abonnement de cet appareil
  useEffect(() => {
    getNotificationPreferences()
      .then(setNotificationPrefs)
      .catch((error) => console.error('Erreur chargement préférences notifications:', error))

    getCurrentSubscription()
      .then((subscription) => setPushSubscribed(Boolean(subscription)))
      .catch((error) => console.error('Erreur lecture abonnement push:', error))
  }, [])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const handleNotificationToggle = async (key) => {
    const previous = notificationPrefs
    const newPrefs = { ...notificationPrefs, [key]: !notificationPrefs[key] }
    setNotificationPrefs(newPrefs)
    try {
      await saveNotificationPreferences({ [key]: newPrefs[key] })
    } catch (error) {
      console.error('Erreur sauvegarde préférences notifications:', error)
      setNotificationPrefs(previous)
      setPushMessage({ type: 'error', text: "Impossible d'enregistrer la préférence." })
    }
  }

  const handlePushToggle = async () => {
    setPushBusy(true)
    setPushMessage(null)
    try {
      if (pushSubscribed) {
        await disablePush()
        setPushSubscribed(false)
      } else {
        const { permission } = await enablePush()
        setPushPermission(permission)
        setPushSubscribed(permission === 'granted')
      }
    } catch (error) {
      console.error('Erreur activation notifications:', error)
      setPushMessage({ type: 'error', text: "Impossible d'activer les notifications sur cet appareil." })
    } finally {
      setPushBusy(false)
    }
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
      const keysToKeep = ['language']
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
          <ArrowLeft weight="bold" size={20} />
          Retour
        </button>
        <h1>Paramètres</h1>
        <p className="subtitle">Personnalisez votre expérience</p>
      </div>

      <div className="page-content">
        {/* Langue */}
        <div className="section">
          <h2 className="section-title">
            <Globe size={20} className="section-icon" style={{ marginRight: '8px' }} />
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
                background: language === 'fr' ? 'var(--accent-ghost)' : 'var(--surface-elevated)',
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
                background: language === 'en' ? 'var(--accent-ghost)' : 'var(--surface-elevated)',
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
        <div className="section" id="notifications" style={{ scrollMarginTop: '16px' }}>
          <h2 className="section-title">
            <Bell size={20} className="section-icon" style={{ marginRight: '8px' }} />
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
            {!pushSupported ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Ce navigateur ne gère pas les notifications push.
              </p>
            ) : pushNeedsInstall ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Sur iPhone, ajoutez d'abord FitTrack à l'écran d'accueil (bouton Partager puis
                « Sur l'écran d'accueil »), puis ouvrez l'app depuis son icône pour activer les notifications.
              </p>
            ) : pushPermission === 'denied' ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Les notifications sont bloquées pour FitTrack. Autorisez-les dans les réglages
                du navigateur ou du téléphone, puis revenez ici.
              </p>
            ) : (
              <>
                <SettingRow
                  title="Notifications push"
                  description={pushSubscribed ? 'Activées sur cet appareil' : 'Désactivées sur cet appareil'}
                >
                  <Toggle
                    checked={pushSubscribed}
                    onChange={handlePushToggle}
                    disabled={pushBusy}
                    label="Notifications push sur cet appareil"
                  />
                </SettingRow>
              </>
            )}

            {pushMessage && (
              <p style={{
                fontSize: '13px',
                color: pushMessage.type === 'error' ? 'var(--error)' : 'var(--success)'
              }}>
                {pushMessage.text}
              </p>
            )}

            <div style={{ height: '1px', background: 'var(--border-light)' }} />

            <SettingRow
              title="Rappels de repas"
              description="À 13h et 20h si le déjeuner ou le dîner n'est pas saisi"
            >
              <Toggle
                checked={notificationPrefs.meals_enabled}
                onChange={() => handleNotificationToggle('meals_enabled')}
                label="Rappels de repas"
              />
            </SettingRow>

            <div style={{ height: '1px', background: 'var(--border-light)' }} />

            <SettingRow
              title="Alertes de série"
              description="À 21h si rien n'est encore validé aujourd'hui"
            >
              <Toggle
                checked={notificationPrefs.streak_enabled}
                onChange={() => handleNotificationToggle('streak_enabled')}
                label="Alertes de série"
              />
            </SettingRow>
          </div>
        </div>

        {/* Sécurité */}
        <div className="section">
          <h2 className="section-title">
            <Lock size={20} className="section-icon" style={{ marginRight: '8px' }} />
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
            <CaretRight weight="bold" size={20} style={{ color: 'var(--text-tertiary)' }} />
          </button>
        </div>

        {/* Maintenance */}
        <div className="section">
          <h2 className="section-title">
            <Trash size={20} className="section-icon" style={{ marginRight: '8px' }} />
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
            <Trash size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
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
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
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
                <X weight="bold" size={24} />
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
                  background: 'rgba(255, 92, 92, 0.1)',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  color: 'var(--danger)'
                }}>
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div style={{
                  padding: '12px',
                  background: 'rgba(74, 222, 128, 0.1)',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  color: 'var(--success)'
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
                    color: 'var(--ink)',
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
