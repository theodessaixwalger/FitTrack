// src/components/MobileOnly.jsx
import { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

function MobileOnly({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width <= 480);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return children; // Affiche l'app si mobile
  }

  // Affiche le message si desktop
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '40px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      color: 'white',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '60px 40px',
        borderRadius: '32px',
        maxWidth: '520px',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)',
        color: '#1A1A1A'
      }}>
        <div style={{ 
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(255, 107, 53, 0.3)'
          }}>
            <Smartphone size={36} color="white" strokeWidth={2.5} />
          </div>
        </div>

        <h1 style={{ 
          fontSize: '36px', 
          marginBottom: '12px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-1px'
        }}>
          FitTrack
        </h1>

        <div style={{
          width: '80px',
          height: '4px',
          background: 'linear-gradient(90deg, #FF6B35, #F7931E)',
          margin: '0 auto 24px',
          borderRadius: '2px'
        }}></div>

        <p style={{ 
          fontSize: '18px', 
          marginBottom: '32px',
          lineHeight: '1.6',
          color: '#6B7280',
          fontWeight: '500'
        }}>
          Cette application est conçue exclusivement pour les appareils mobiles
        </p>

        <div style={{
          background: '#F8F9FA',
          padding: '24px',
          borderRadius: '20px',
          marginBottom: '32px',
          border: '1px solid #E5E7EB'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Smartphone size={24} color="white" />
            </div>
            <h3 style={{ 
              fontSize: '18px',
              marginBottom: '0',
              fontWeight: '700',
              color: '#1A1A1A'
            }}>
              Pour accéder à FitTrack
            </h3>
          </div>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '15px',
            lineHeight: '2',
            color: '#6B7280',
            textAlign: 'left',
            fontWeight: '500'
          }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                width: '6px', 
                height: '6px', 
                background: '#FF6B35', 
                borderRadius: '50%',
                flexShrink: 0
              }}></span>
              Ouvrez cette app sur votre smartphone
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                width: '6px', 
                height: '6px', 
                background: '#FF6B35', 
                borderRadius: '50%',
                flexShrink: 0
              }}></span>
              Ou utilisez le mode développeur (F12)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                width: '6px', 
                height: '6px', 
                background: '#FF6B35', 
                borderRadius: '50%',
                flexShrink: 0
              }}></span>
              Activez le mode responsive (≤ 480px)
            </li>
          </ul>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '32px'
        }}>
          {[
            { icon: Smartphone, label: 'Mobile', color: '#FF6B35' },
            { icon: Tablet, label: 'Tablette', color: '#4ECDC4' },
            { icon: Monitor, label: 'Desktop', color: '#E74C3C', disabled: true }
          ].map((item, i) => (
            <div key={i} style={{
              background: item.disabled ? '#F3F4F6' : '#FFFFFF',
              padding: '16px 12px',
              borderRadius: '16px',
              border: `2px solid ${item.disabled ? '#E5E7EB' : item.color}`,
              opacity: item.disabled ? 0.5 : 1
            }}>
              <item.icon size={24} color={item.color} style={{ marginBottom: '8px' }} />
              <div style={{ 
                fontSize: '13px', 
                fontWeight: '700',
                color: '#1A1A1A'
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          padding: '20px',
          background: '#FFF5F2',
          borderRadius: '16px',
          border: '2px solid #FFE5DD',
          fontSize: '13px',
          color: '#6B7280',
          lineHeight: '1.6',
          fontWeight: '500'
        }}>
          <div style={{ fontWeight: '700', color: '#FF6B35', marginBottom: '8px', fontSize: '14px' }}>
            💡 Raccourci développeur
          </div>
          <div>
            Appuyez sur <kbd style={{
              background: '#FFFFFF',
              padding: '4px 10px',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: '700',
              color: '#FF6B35',
              border: '1px solid #FFE5DD',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>F12</kbd> puis <kbd style={{
              background: '#FFFFFF',
              padding: '4px 10px',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: '700',
              color: '#FF6B35',
              border: '1px solid #FFE5DD',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>Ctrl + Shift + M</kbd>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '32px',
        fontSize: '14px',
        opacity: '0.9',
        fontWeight: '500',
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '12px 24px',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <div>Largeur actuelle : <strong>{windowWidth}px</strong></div>
        <div>Largeur requise : <strong>≤ 480px</strong></div>
      </div>
    </div>
  );
}

export default MobileOnly;
