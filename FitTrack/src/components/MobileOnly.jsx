// src/components/MobileOnly.jsx
import { useState, useEffect } from 'react';
import { DeviceMobile, DeviceTablet, Monitor, Lightbulb } from '@phosphor-icons/react';

const DEVICES = [
  { icon: DeviceMobile, label: 'Mobile' },
  { icon: DeviceTablet, label: 'Tablette' },
  { icon: Monitor, label: 'Desktop', disabled: true }
];

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
    <div className="mobile-only">
      <div className="mobile-only-card glow-card glow-accent">
        <img src="/icon-192.png" alt="" className="mobile-only-logo" width="88" height="88" />

        <h1>FitTrack</h1>
        <p className="mobile-only-lead">
          Cette application est conçue exclusivement pour les appareils mobiles
        </p>

        <div className="mobile-only-steps">
          <h3>
            <DeviceMobile size={20} />
            Pour accéder à FitTrack
          </h3>
          <ul>
            <li>Ouvrez cette app sur votre smartphone</li>
            <li>Ou utilisez le mode développeur (F12)</li>
            <li>Activez le mode responsive (≤ 480px)</li>
          </ul>
        </div>

        <div className="mobile-only-devices">
          {DEVICES.map((device) => {
            const Icon = device.icon;
            return (
              <div key={device.label} className={device.disabled ? 'is-disabled' : ''}>
                <Icon size={24} />
                <span>{device.label}</span>
              </div>
            );
          })}
        </div>

        <div className="mobile-only-tip">
          <div className="mobile-only-tip-title">
            <Lightbulb size={16} />
            Raccourci développeur
          </div>
          <div>
            Appuyez sur <kbd>F12</kbd> puis <kbd>Ctrl + Shift + M</kbd>
          </div>
        </div>
      </div>

      <div className="mobile-only-width">
        <div>Largeur actuelle : <strong>{windowWidth}px</strong></div>
        <div>Largeur requise : <strong>≤ 480px</strong></div>
      </div>
    </div>
  );
}

export default MobileOnly;
