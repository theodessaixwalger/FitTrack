import { User, Target, Award, TrendingUp, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Crown, Flame, Calendar, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const fullName = user?.user_metadata?.full_name || 'Utilisateur';
  const email = user?.email || '';
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase();

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
            <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>87</div>
            <div style={{ fontSize: '12px', opacity: '0.9', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Séries</div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>15</div>
            <div style={{ fontSize: '12px', opacity: '0.9', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jours</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>1.4kg</div>
            <div style={{ fontSize: '12px', opacity: '0.9', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gagnés</div>
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
                  <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>Prise de masse</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    Objectif : 70kg
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '700' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Poids actuel</span>
                  <span style={{ color: 'var(--primary)' }}>62.4 kg</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '27%' }}></div>
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
                <span>Plus que 7.6 kg pour atteindre votre objectif !</span>
              </div>
            </div>
          </div>
        </div>

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
    </div>
  );
}

export default Profile;
