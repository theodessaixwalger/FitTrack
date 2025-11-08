import { useState, useEffect } from 'react';
import { User, Target, Award, TrendingUp, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Crown, Flame, Calendar, Activity, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../services/profileService';

function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
      setEditData({
        first_name: data?.first_name || '',
        last_name: data?.last_name || '',
        date_of_birth: data?.date_of_birth || '',
        height: data?.height || '',
        current_weight: data?.current_weight || '',
        target_weight: data?.target_weight || '',
        fitness_goal: data?.fitness_goal || '',
        activity_level: data?.activity_level || ''
      });
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (profile) {
      setEditData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        date_of_birth: profile.date_of_birth || '',
        height: profile.height || '',
        current_weight: profile.current_weight || '',
        target_weight: profile.target_weight || '',
        fitness_goal: profile.fitness_goal || '',
        activity_level: profile.activity_level || ''
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(editData);
      await loadProfile();
      setShowModal(false);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const fullName = profile 
    ? `${profile.first_name} ${profile.last_name}` 
    : user?.user_metadata?.full_name || 'Utilisateur';
  const email = user?.email || '';
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase();

  // Calculer les statistiques
  const currentWeight = profile?.current_weight || 0;
  const targetWeight = profile?.target_weight || 0;
  const weightDiff = currentWeight - targetWeight;
  const progressPercent = targetWeight > 0 
    ? Math.min(100, Math.max(0, ((currentWeight - targetWeight) / targetWeight) * 100))
    : 0;

  // Mapper les objectifs
  const fitnessGoalLabels = {
    'lose_weight': 'Perte de poids',
    'gain_muscle': 'Prise de masse',
    'maintain': 'Maintien',
    'get_fit': 'Remise en forme'
  };

  const goalLabel = profile?.fitness_goal 
    ? fitnessGoalLabels[profile.fitness_goal] 
    : 'Non défini';

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header" style={{ 
        background: 'var(--gradient-primary)',
        color: 'white',
        borderBottom: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            fontWeight: '800',
            color: '#FF6B35',
            border: '4px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: '6px' }}>{fullName}</h1>
            <p style={{ opacity: '0.9', fontSize: '14px', fontWeight: '500' }}>{email}</p>
          </div>
          <button 
            onClick={handleOpenModal}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <Edit2 size={20} />
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginTop: '20px',
          padding: '20px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
              {profile?.height || '-'}
            </div>
            <div style={{ fontSize: '12px', opacity: '0.9', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Taille (cm)
            </div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
              {profile?.current_weight || '-'}
            </div>
            <div style={{ fontSize: '12px', opacity: '0.9', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Poids (kg)
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
              {profile?.target_weight || '-'}
            </div>
            <div style={{ fontSize: '12px', opacity: '0.9', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Objectif (kg)
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Abonnement Premium */}
        <div className="card" style={{ 
          background: 'var(--gradient-primary-light)',
          border: 'none',
          color: 'white'
        }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Crown size={24} />
                  <span style={{ fontSize: '16px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Premium
                  </span>
                </div>
                <p style={{ fontSize: '14px', opacity: '0.9', fontWeight: '500', lineHeight: '1.5' }}>
                  Accès illimité à tous les programmes et fonctionnalités avancées
                </p>
              </div>
            </div>
            <button className="btn" style={{ 
              background: 'white', 
              color: 'var(--primary-light)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              Passer à Premium
            </button>
          </div>
        </div>

        {/* Objectifs */}
        {profile && (
          <div className="section">
            <h2 className="section-title">Mes objectifs</h2>

            <div className="card">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Target size={28} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>
                      {goalLabel}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                      Objectif : {targetWeight} kg
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '700' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Poids actuel</span>
                    <span style={{ color: 'var(--primary)' }}>{currentWeight} kg</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ 
                      width: `${Math.abs(progressPercent)}%` 
                    }}></div>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '8px',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)'
                }}>
                  <span>🎯</span>
                  <span>
                    {profile.fitness_goal === 'gain_muscle' 
                      ? `Plus que ${Math.abs(weightDiff).toFixed(1)} kg pour atteindre votre objectif !`
                      : `Plus que ${Math.abs(weightDiff).toFixed(1)} kg à perdre !`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paramètres */}
        <div className="section">
          <h2 className="section-title">Paramètres</h2>

          <div className="card">
            <div className="card-body" style={{ padding: '0' }}>
              <div className="menu-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <Settings size={20} />
                  </div>
                  <span>Paramètres généraux</span>
                </div>
                <ChevronRight size={20} color="var(--text-tertiary)" />
              </div>

              <div className="menu-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--secondary)'
                  }}>
                    <Bell size={20} />
                  </div>
                  <span>Notifications</span>
                </div>
                <ChevronRight size={20} color="var(--text-tertiary)" />
              </div>

              <div className="menu-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--success)'
                  }}>
                    <Shield size={20} />
                  </div>
                  <span>Confidentialité</span>
                </div>
                <ChevronRight size={20} color="var(--text-tertiary)" />
              </div>

              <div className="menu-item" style={{ borderBottom: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--warning)'
                  }}>
                    <HelpCircle size={20} />
                  </div>
                  <span>Aide & Support</span>
                </div>
                <ChevronRight size={20} color="var(--text-tertiary)" />
              </div>
            </div>
          </div>
        </div>

        {/* Déconnexion */}
        <button 
          onClick={handleLogout}
          className="btn btn-outline" 
          style={{ 
            color: 'var(--danger)', 
            borderColor: 'var(--danger)',
            marginBottom: '20px'
          }}
        >
          <LogOut size={20} />
          Se déconnecter
        </button>

        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          fontSize: '13px', 
          color: 'var(--text-tertiary)',
          fontWeight: '500'
        }}>
          Version 2.1.0 • FitTrack © 2025
        </div>
      </div>

      {/* Modal de modification */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Modifier mon profil</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            <div className="edit-modal-body">
              <div className="form-group">
                <label className="form-label">Prénom</label>
                <input
                  type="text"
                  name="first_name"
                  value={editData.first_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nom</label>
                <input
                  type="text"
                  name="last_name"
                  value={editData.last_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date de naissance</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={editData.date_of_birth}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Taille (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={editData.height}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Poids actuel (kg)</label>
                <input
                  type="number"
                  name="current_weight"
                  value={editData.current_weight}
                  onChange={handleChange}
                  className="form-input"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Poids objectif (kg)</label>
                <input
                  type="number"
                  name="target_weight"
                  value={editData.target_weight}
                  onChange={handleChange}
                  className="form-input"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Objectif fitness</label>
                <select
                  name="fitness_goal"
                  value={editData.fitness_goal}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Sélectionner...</option>
                  <option value="lose_weight">Perte de poids</option>
                  <option value="gain_muscle">Prise de masse</option>
                  <option value="maintain">Maintien</option>
                  <option value="get_fit">Remise en forme</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Niveau d'activité</label>
                <select
                  name="activity_level"
                  value={editData.activity_level}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Sélectionner...</option>
                  <option value="sedentary">Sédentaire</option>
                  <option value="light">Légèrement actif</option>
                  <option value="moderate">Modérément actif</option>
                  <option value="very_active">Très actif</option>
                  <option value="extra_active">Extrêmement actif</option>
                </select>
              </div>
            </div>

            <div className="edit-modal-footer">
              <button 
                onClick={handleCloseModal}
                className="btn btn-outline"
                disabled={saving}
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
