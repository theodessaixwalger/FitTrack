import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TrendingDown, TrendingUp, Scale } from 'lucide-react';

function ProgressChart({ data, targetWeight }) {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ current: 0, change: 0, trend: 'neutral' });

  useEffect(() => {
    if (data && data.length > 0) {
      const formatted = data.map(item => ({
        date: format(parseISO(item.recorded_at), 'dd MMM', { locale: fr }),
        fullDate: format(parseISO(item.recorded_at), 'dd MMMM yyyy', { locale: fr }),
        value: item.weight,
        target: targetWeight
      }));

      setChartData(formatted);

      // Calculer les statistiques
      if (formatted.length >= 2) {
        const current = formatted[formatted.length - 1].value;
        const previous = formatted[0].value;
        const change = current - previous;
        const trend = change < 0 ? 'down' : change > 0 ? 'up' : 'neutral';
        
        setStats({ current, change, trend });
      }
    }
  }, [data, targetWeight]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          padding: '12px 16px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: 'none'
        }}>
          <p style={{ 
            fontSize: '13px', 
            fontWeight: '600', 
            color: 'var(--text-secondary)',
            marginBottom: '4px' 
          }}>
            {payload[0].payload.fullDate}
          </p>
          <p style={{ 
            fontSize: '16px', 
            fontWeight: '800', 
            color: 'var(--primary)',
            margin: 0
          }}>
            {payload[0].value} kg
          </p>
          {payload[0].payload.target && (
            <p style={{ 
              fontSize: '12px', 
              color: 'var(--text-tertiary)',
              marginTop: '4px',
              marginBottom: 0
            }}>
              Objectif: {payload[0].payload.target} kg
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        <Scale size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
        <p style={{ fontWeight: '600', marginBottom: '4px' }}>
          Aucune donnée disponible
        </p>
        <p style={{ fontSize: '14px' }}>
          Commencez à enregistrer votre poids pour voir l'évolution
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Statistiques */}
      {stats.change !== 0 && (
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          padding: '16px',
          background: 'var(--bg-secondary)',
          borderRadius: '12px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '13px', 
              color: 'var(--text-secondary)',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Poids actuel
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: '800',
              color: 'var(--text-primary)'
            }}>
              {stats.current.toFixed(1)} kg
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '13px', 
              color: 'var(--text-secondary)',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Évolution
            </div>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {stats.trend === 'down' ? (
                <>
                  <TrendingDown size={20} color="var(--success)" />
                  <span style={{ 
                    fontSize: '20px', 
                    fontWeight: '800',
                    color: 'var(--success)'
                  }}>
                    {Math.abs(stats.change).toFixed(1)} kg
                  </span>
                </>
              ) : (
                <>
                  <TrendingUp size={20} color="var(--danger)" />
                  <span style={{ 
                    fontSize: '20px', 
                    fontWeight: '800',
                    color: 'var(--danger)'
                  }}>
                    +{stats.change.toFixed(1)} kg
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Graphique */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#999"
            style={{ fontSize: '12px', fontWeight: '600' }}
          />
          <YAxis 
            stroke="#999"
            style={{ fontSize: '12px', fontWeight: '600' }}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip content={<CustomTooltip />} />
          {targetWeight && (
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#4ECDC4" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Objectif"
            />
          )}
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#FF6B35" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorWeight)"
            name="Poids"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProgressChart;
