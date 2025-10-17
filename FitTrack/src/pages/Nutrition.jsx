import { Plus, TrendingUp, Flame, Apple, Coffee, Utensils, Moon } from 'lucide-react';

function Nutrition() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Nutrition</h1>
        <p className="subtitle">Suivez votre alimentation quotidienne</p>
      </div>

      <div className="page-content">
        {/* Résumé calorique */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)', border: 'none', marginBottom: '24px' }}>
          <div className="card-body" style={{ color: 'white' }}>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: '14px', opacity: '0.9', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Calories consommées
              </div>
              <div style={{ fontSize: '56px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-2px' }}>
                1,847
              </div>
              <div style={{ fontSize: '16px', opacity: '0.9', fontWeight: '500' }}>
                Objectif: 2,200 kcal
              </div>
              
              <div style={{ marginTop: '24px', marginBottom: '16px' }}>
                <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.2)', height: '12px' }}>
                  <div className="progress-fill" style={{ 
                    width: '84%',
                    background: 'rgba(255,255,255,0.9)',
                    height: '12px'
                  }}></div>
                </div>
              </div>

              <div style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.2)',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <TrendingUp size={16} />
                Encore 353 kcal disponibles
              </div>
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="section">
          <h2 className="section-title" style={{ marginBottom: '16px' }}>Macronutriments</h2>
          
          <div className="macros-grid">
            <div className="macro-item">
              <div className="macro-circle" style={{ 
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                color: 'white',
                fontSize: '18px',
                fontWeight: '800'
              }}>
                142g
              </div>
              <div className="macro-value">89%</div>
              <div className="macro-label">Protéines</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', fontWeight: '500' }}>
                160g objectif
              </div>
            </div>

            <div className="macro-item">
              <div className="macro-circle" style={{ 
                background: 'linear-gradient(135deg, #4ECDC4 0%, #44A9A3 100%)',
                color: 'white',
                fontSize: '18px',
                fontWeight: '800'
              }}>
                68g
              </div>
              <div className="macro-value">85%</div>
              <div className="macro-label">Lipides</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', fontWeight: '500' }}>
                80g objectif
              </div>
            </div>

            <div className="macro-item">
              <div className="macro-circle" style={{ 
                background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
                color: 'white',
                fontSize: '18px',
                fontWeight: '800'
              }}>
                195g
              </div>
              <div className="macro-value">78%</div>
              <div className="macro-label">Glucides</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', fontWeight: '500' }}>
                250g objectif
              </div>
            </div>
          </div>
        </div>

        {/* Repas du jour */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Repas d'aujourd'hui</h2>
            <span className="section-link">+ Ajouter</span>
          </div>

          {/* Petit déjeuner */}
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    <Coffee size={24} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>Petit déjeuner</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>08:30 • 3 aliments</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>425</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>kcal</div>
                </div>
              </div>

              <div style={{ 
                background: 'var(--bg-secondary)', 
                padding: '12px 16px', 
                borderRadius: '12px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>🥐 Croissant au beurre</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>280 kcal</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  P: 6g • L: 15g • G: 30g
                </div>
              </div>

              <div style={{ 
                background: 'var(--bg-secondary)', 
                padding: '12px 16px', 
                borderRadius: '12px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>☕ Café latte</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>95 kcal</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  P: 6g • L: 4g • G: 10g
                </div>
              </div>

              <div style={{ 
                background: 'var(--bg-secondary)', 
                padding: '12px 16px', 
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>🍊 Jus d'orange frais</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>50 kcal</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  P: 1g • L: 0g • G: 12g
                </div>
              </div>
            </div>
          </div>

          {/* Déjeuner */}
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #4ECDC4 0%, #44A9A3 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    <Utensils size={24} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>Déjeuner</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>13:30 • 4 aliments</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>687</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>kcal</div>
                </div>
              </div>

              <div style={{ 
                background: 'var(--bg-secondary)', 
                padding: '12px 16px', 
                borderRadius: '12px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>🥗 Salade Caesar poulet</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>485 kcal</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  P: 42g • L: 28g • G: 15g
                </div>
              </div>

              <div style={{ 
                background: 'var(--bg-secondary)', 
                padding: '12px 16px', 
                borderRadius: '12px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>🍞 Pain complet (2 tranches)</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>140 kcal</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  P: 6g • L: 2g • G: 26g
                </div>
              </div>

              <div style={{ 
                background: 'var(--bg-secondary)', 
                padding: '12px 16px', 
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>💧 Eau pétillante</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>0 kcal</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  P: 0g • L: 0g • G: 0g
                </div>
              </div>
            </div>
          </div>

          {/* Collation */}
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    <Apple size={24} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>Collation</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>16:45 • 2 aliments</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>235</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>kcal</div>
                </div>
              </div>

              <div style={{ 
                background: 'var(--bg-secondary)', 
                padding: '12px 16px', 
                borderRadius: '12px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>🍎 Pomme rouge</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>95 kcal</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  P: 0.5g • L: 0.3g • G: 25g
                </div>
              </div>

              <div style={{ 
                background: 'var(--bg-secondary)', 
                padding: '12px 16px', 
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>🥜 Amandes (30g)</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>170 kcal</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  P: 6g • L: 15g • G: 6g
                </div>
              </div>
            </div>
          </div>

          {/* Dîner - À venir */}
          <div className="card" style={{ border: '2px dashed var(--border)' }}>
            <div className="card-body" style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Moon size={28} color="var(--text-tertiary)" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Dîner
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: '500' }}>
                Aucun aliment ajouté
              </p>
              <button className="btn btn-outline btn-small">
                <Plus size={16} />
                Ajouter le dîner
              </button>
            </div>
          </div>
        </div>

        {/* Bouton d'action */}
        <button className="btn" style={{ marginTop: '8px' }}>
          <Plus size={20} />
          Ajouter un repas
        </button>
      </div>
    </div>
  );
}

export default Nutrition;
