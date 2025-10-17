import { User, Target, Award, TrendingUp, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Crown, Flame, Calendar, Activity } from 'lucide-react';

function Profile() {
  return (
    <div className="page">
      <div className="page-header" style={{ 
        background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
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
            color: '#667EEA',
            border: '4px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}>
            AK
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: '6px' }}>Alex Karim</h1>
            <p style={{ opacity: '0.9', fontSize: '14px', fontWeight: '500' }}>alex.karim@email.com</p>
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
            <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>2.4kg</div>
            <div style={{ fontSize: '12px', opacity: '0.9', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Perdus</div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Abonnement Premium */}
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #F7931E 0%, #FF6B35 100%)',
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
              color: '#FF6B35',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              Passer à Premium
            </button>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="section">
          <h2 className="section-title">Mes statistiques</h2>
          
          <div className="card">
            <div className="card-body" style={{ padding: '0' }}>
              <div className="list-item" style={{ borderRadius: '0' }}>
                <div className="list-item-left">
                  <div className="list-item-icon" style={{ 
                    background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                    color: 'white'
                  }}>
                    <Flame size={20} />
                  </div>
                  <div className="list-item-info">
                    <h3>Calories brûlées</h3>
                    <p>Cette semaine</p>
                  </div>
                </div>
                <div className="list-item-value">2,847</div>
              </div>

              <div className="list-item" style={{ borderRadius: '0' }}>
                <div className="list-item-left">
                  <div className="list-item-icon" style={{ 
                    background: 'linear-gradient(135deg, #4ECDC4 0%, #44A9A3 100%)',
                    color: 'white'
                  }}>
                    <Activity size={20} />
                  </div>
                  <div className="list-item-info">
                    <h3>Temps d'entraînement</h3>
                    <p>Cette semaine</p>
                  </div>
                </div>
                <div className="list-item-value">5.2h</div>
              </div>

              <div className="list-item" style={{ borderRadius: '0' }}>
                <div className="list-item-left">
                  <div className="list-item-icon" style={{ 
                    background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
                    color: 'white'
                  }}>
                    <Calendar size={20} />
                  </div>
                  <div className="list-item-info">
                    <h3>Série actuelle</h3>
                    <p>Jours consécutifs</p>
                  </div>
                </div>
                <div className="list-item-value">15 🔥</div>
              </div>

              <div className="list-item" style={{ borderRadius: '0', borderBottom: 'none' }}>
                <div className="list-item-left">
                  <div className="list-item-icon" style={{ 
                    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                    color: 'white'
                  }}>
                    <TrendingUp size={20} />
                  </div>
                  <div className="list-item-info">
                    <h3>Progression moyenne</h3>
                    <p>Ce mois-ci</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="list-item-value" style={{ color: 'var(--success)' }}>+12%</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>↑ 3% vs mois dernier</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges et récompenses */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Mes badges</h2>
            <span className="section-link">Tous (24)</span>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '12px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
              aspectRatio: '1',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '32px',
              boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
              position: 'relative'
            }}>
              🔥
              <div style={{
                position: 'absolute',
                bottom: '6px',
                fontSize: '10px',
                fontWeight: '800',
                background: 'rgba(0,0,0,0.2)',
                padding: '2px 8px',
                borderRadius: '8px'
              }}>
                15j
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #4ECDC4 0%, #44A9A3 100%)',
              aspectRatio: '1',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '32px',
              boxShadow: '0 4px 12px rgba(78, 205, 196, 0.3)'
            }}>
              💪
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
              aspectRatio: '1',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '32px',
              boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
            }}>
              🏆
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
              aspectRatio: '1',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '32px',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              ⭐
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              aspectRatio: '1',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '32px',
              border: '2px dashed var(--border)'
            }}>
              🔒
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              aspectRatio: '1',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '32px',
              border: '2px dashed var(--border)'
            }}>
              🔒
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              aspectRatio: '1',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '32px',
              border: '2px dashed var(--border)'
            }}>
              🔒
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              aspectRatio: '1',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '32px',
              border: '2px dashed var(--border)'
            }}>
              🔒
            </div>
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
                  <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>Perte de poids</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    Objectif : 80kg
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '700' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Poids actuel</span>
                  <span style={{ color: 'var(--primary)' }}>82.4 kg</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '77%' }}></div>
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
                <span>Plus que 2.4 kg pour atteindre votre objectif !</span>
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
        <button className="btn btn-outline" style={{ 
          color: 'var(--danger)', 
          borderColor: 'var(--danger)',
          marginBottom: '20px'
        }}>
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
          Version 2.1.0 • FitTrack © 2024
        </div>
      </div>
    </div>
  );
}

export default Profile;
