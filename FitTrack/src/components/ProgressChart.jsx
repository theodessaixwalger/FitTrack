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
import { TrendDown, TrendUp, ChartLine } from '@phosphor-icons/react';

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
          background: 'var(--surface-elevated)',
          padding: '11px 14px',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--accent-line)'
        }}>
          <p style={{
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            marginBottom: '5px'
          }}>
            {payload[0].payload.fullDate}
          </p>
          <p style={{
            fontSize: '20px',
            fontWeight: '800',
            color: 'var(--accent)',
            letterSpacing: '-0.5px',
            fontVariantNumeric: 'tabular-nums',
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
        color: 'var(--text-tertiary)'
      }}>
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          background: 'var(--accent-ghost)',
          border: '1px solid var(--accent-line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: 'var(--accent)'
        }}>
          <ChartLine size={32} />
        </div>
        <p style={{ fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
          Aucune donnée disponible
        </p>
        <p style={{ fontSize: '13px' }}>
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
          background: 'var(--surface-sunken)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)'
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
                  <TrendDown size={20} color="var(--success)" />
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
                  <TrendUp size={20} color="var(--danger)" />
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
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -12, bottom: 4 }}>
          <defs>
            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.38} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grille horizontale seule : moins de bruit sous la courbe */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontWeight: 600 }}
            dy={6}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontWeight: 600 }}
            domain={['dataMin - 2', 'dataMax + 2']}
            width={44}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'var(--accent-line)', strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          {targetWeight && (
            <Line
              type="monotone"
              dataKey="target"
              stroke="var(--text-tertiary)"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              strokeLinecap="round"
              dot={false}
              activeDot={false}
              name="Objectif"
              isAnimationActive={false}
            />
          )}

          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--accent)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fillOpacity={1}
            fill="url(#colorWeight)"
            name="Poids"
            dot={{ r: 4, fill: 'var(--accent)', stroke: 'var(--bg)', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: 'var(--accent)', stroke: 'var(--bg)', strokeWidth: 3 }}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProgressChart;
