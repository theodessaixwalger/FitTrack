import { Activity, Flame, Droplet, Moon, TrendingUp, Plus, Award, Target } from 'lucide-react';

function Home() {
  const today = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Bonjour, Alex! 👋</h1>
        <p className="subtitle">{today}</p>
      </div>

      <div className="page-content">
        {/* Hero Card - Calories */}
        <div className="hero-card">
          <div className="label">Calories aujourd'hui</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="value">1,847</span>
            <span className="unit">/ 2,200 kcal</span>
          </div>
          <div style={{ marginTop: '24px' }}>
            <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="progress-fill" style={{ 
                width: '84%',
                background: 'rgba(255,255,255,0.9)' 
              }}></div>
            </div>
            <div style={{ 
              marginTop: '12px', 
              fontSize: '14px', 
              opacity: '0.9',
              fontWeight: '600'
            }}>
              Plus que 353 kcal pour atteindre votre objectif 🎯
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#FF6B35' }}>
              <Flame size={24} />
            </div>
            <div className="stat-value">287</div>
            <div className="stat-label">Calories brûlées</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#4ECDC4' }}>
              <Droplet size={24} />
            </div>
            <div className="stat-value">1.8L</div>
            <div className="stat-label">Eau bue</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#2ECC71' }}>
              <Activity size={24} />
            </div>
            <div className="stat-value">8,547</div>
            <div className="stat-label">Pas</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#667EEA' }}>
              <Moon size={24} />
            </div>
            <div className="stat-value">7.2h</div>
            <div className="stat-label">Sommeil</div>
          </div>
        </div>

        {/* Progression des objectifs */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Objectifs du jour</h2>
            <span className="section-link">Tout voir</span>
          </div>

          <div className="progress-card">
            <div className="progress-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Target size={20} />
                </div>
                <span className="progress-label">Protéines</span>
              </div>
              <span className="progress-value">142g / 160g</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '89%' }}></div>
            </div>
          </div>

          <div className="progress-card">
            <div className="progress-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #4ECDC4 0%, #44A9A3 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Activity size={20} />
                </div>
                <span className="progress-label">Activité</span>
              </div>
              <span className="progress-value">42min / 60min</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ 
                width: '70%',
                background: 'linear-gradient(90deg, #4ECDC4, #44A9A3)'
              }}></div>
            </div>
          </div>

          <div className="progress-card">
            <div className="progress-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Droplet size={20} />
                </div>
                <span className="progress-label">Hydratation</span>
              </div>
              <span className="progress-value">1.8L / 2.5L</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ 
                width: '72%',
                background: 'linear-gradient(90deg, #2ECC71, #27AE60)'
              }}></div>
            </div>
          </div>
        </div>

        {/* Activités récentes */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Activités récentes</h2>
            <span className="section-link">Historique</span>
          </div>

          <div className="list-item">
            <div className="list-item-left">
              <div className="list-item-icon" style={{ 
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                color: 'white'
              }}>
                <Activity size={20} />
              </div>
              <div className="list-item-info">
                <h3>Entraînement HIIT</h3>
                <p>Il y a 2 heures • 28 minutes</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="list-item-value">315</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>kcal</div>
            </div>
          </div>

          <div className="list-item">
            <div className="list-item-left">
              <div className="list-item-icon" style={{ 
                background: 'linear-gradient(135deg, #4ECDC4 0%, #44A9A3 100%)',
                color: 'white'
              }}>
                🥗
              </div>
              <div className="list-item-info">
                <h3>Salade Caesar au poulet</h3>
                <p>Déjeuner • 13:30</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="list-item-value">485</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>kcal</div>
            </div>
          </div>

          <div className="list-item">
            <div className="list-item-left">
              <div className="list-item-icon" style={{ 
                background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                color: 'white'
              }}>
                <TrendingUp size={20} />
              </div>
              <div className="list-item-info">
                <h3>Nouvelle étape franchie!</h3>
                <p>Badge débloq: "10k pas en un jour"</p>
              </div>
            </div>
            <span className="badge badge-success">
              <Award size={14} style={{ marginRight: '4px' }} />
              +50 XP
            </span>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="section">
          <h2 className="section-title" style={{ marginBottom: '16px' }}>Actions rapides</h2>
          
          <button className="btn">
            <Plus size={20} />
            Ajouter un repas
          </button>

          <button className="btn btn-outline">
            <Activity size={20} />
            Commencer un entraînement
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
