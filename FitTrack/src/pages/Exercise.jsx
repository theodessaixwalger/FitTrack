import { Dumbbell, TrendingUp, Plus, Play, Award, Calendar } from 'lucide-react';

function Exercise() {
  const muscleGroups = [
    { name: 'Pectoraux', emoji: '💪', exercises: 12, color: '#FF6B35' },
    { name: 'Dos', emoji: '🦾', exercises: 15, color: '#4ECDC4' },
    { name: 'Épaules', emoji: '🏋️', exercises: 10, color: '#2ECC71' },
    { name: 'Biceps', emoji: '💪', exercises: 8, color: '#667EEA' },
    { name: 'Triceps', emoji: '🔨', exercises: 8, color: '#F39C12' },
    { name: 'Jambes', emoji: '🦵', exercises: 18, color: '#E74C3C' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Exercices</h1>
        <p className="subtitle">Planifiez vos entraînements</p>
      </div>

      <div className="page-content">
        {/* Carte d'entraînement actif */}
        <div className="hero-card" style={{ 
          background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div className="label">Programme en cours</div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                Push Day
              </h2>
              <p style={{ fontSize: '14px', opacity: '0.9', fontWeight: '500' }}>
                5 exercices • 45-60 min
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Dumbbell size={28} />
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
              <span>Progression</span>
              <span>3/5 exercices</span>
            </div>
            <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.2)', height: '10px' }}>
              <div className="progress-fill" style={{ 
                width: '60%',
                background: 'rgba(255,255,255,0.9)',
                height: '10px'
              }}></div>
            </div>
          </div>

          <button className="btn" style={{ 
            marginTop: '20px', 
            background: 'white', 
            color: '#667EEA',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <Play size={20} />
            Reprendre l'entraînement
          </button>
        </div>

        {/* Stats de la semaine */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#FF6B35' }}>
              <Dumbbell size={24} />
            </div>
            <div className="stat-value">12</div>
            <div className="stat-label">Séances</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#4ECDC4' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-value">+15%</div>
            <div className="stat-label">Force</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#2ECC71' }}>
              <Calendar size={24} />
            </div>
            <div className="stat-value">8.2h</div>
            <div className="stat-label">Temps total</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#667EEA' }}>
              <Award size={24} />
            </div>
            <div className="stat-value">47</div>
            <div className="stat-label">Records</div>
          </div>
        </div>

        {/* Groupes musculaires */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Groupes musculaires</h2>
            <span className="section-link">Tous</span>
          </div>

          <div className="category-grid">
            {muscleGroups.map((group, index) => (
              <div key={index} className="category-card">
                <div className="category-icon-wrapper" style={{ fontSize: '40px' }}>
                  {group.emoji}
                </div>
                <div className="category-name">{group.name}</div>
                <div className="category-count">{group.exercises} exercices</div>
              </div>
            ))}
          </div>
        </div>

        {/* Programmes recommandés */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Programmes recommandés</h2>
            <span className="section-link">Explorer</span>
          </div>

          <div className="card">
            <div style={{
              height: '140px',
              background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              borderRadius: '20px 20px 0 0'
            }}>
              🔥
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span className="badge badge-warning">Intermédiaire</span>
                <span className="badge badge-primary">5 semaines</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.3px' }}>
                Programme Force & Volume
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5', fontWeight: '500' }}>
                Développez votre force et votre masse musculaire avec ce programme complet de 5 semaines
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  4 séances/semaine • 60 min
                </div>
                <button className="btn btn-small" style={{ width: 'auto' }}>
                  Commencer
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{
              height: '140px',
              background: 'linear-gradient(135deg, #4ECDC4 0%, #44A9A3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              borderRadius: '20px 20px 0 0'
            }}>
              ⚡
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span className="badge badge-success">Débutant</span>
                <span className="badge badge-primary">3 semaines</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.3px' }}>
                HIIT Cardio Intensif
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5', fontWeight: '500' }}>
                Brûlez des calories rapidement avec ces séances de HIIT courtes mais intenses
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  3 séances/semaine • 25 min
                </div>
                <button className="btn btn-small" style={{ width: 'auto' }}>
                  Commencer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Exercices récents */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Exercices récents</h2>
            <span className="section-link">Historique</span>
          </div>

          <div className="list-item">
            <div className="list-item-left">
              <div className="list-item-icon" style={{ 
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                color: 'white'
              }}>
                💪
              </div>
              <div className="list-item-info">
                <h3>Développé couché</h3>
                <p>Pectoraux • Hier</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="list-item-value">80kg</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>4×8 reps</div>
            </div>
          </div>

          <div className="list-item">
            <div className="list-item-left">
              <div className="list-item-icon" style={{ 
                background: 'linear-gradient(135deg, #4ECDC4 0%, #44A9A3 100%)',
                color: 'white'
              }}>
                🦾
              </div>
              <div className="list-item-info">
                <h3>Tractions</h3>
                <p>Dos • Hier</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="list-item-value">+10kg</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>3×10 reps</div>
            </div>
          </div>

          <div className="list-item">
            <div className="list-item-left">
              <div className="list-item-icon" style={{ 
                background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
                color: 'white'
              }}>
                🏋️
              </div>
              <div className="list-item-info">
                <h3>Développé militaire</h3>
                <p>Épaules • Il y a 2 jours</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="list-item-value">45kg</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>4×10 reps</div>
            </div>
          </div>
        </div>

        {/* Bouton d'action */}
        <button className="btn">
          <Plus size={20} />
          Créer un entraînement personnalisé
        </button>
      </div>
    </div>
  );
}

export default Exercise;
