import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Flame, TrendingUp } from 'lucide-react';

function Splash() {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        {/* Logo principal */}
        <div className="splash-logo">
          <div className="logo-circle">
            <Dumbbell size={64} strokeWidth={2.5} />
          </div>
          <div className="logo-pulse"></div>
        </div>

        {/* Nom de l'app */}
        <h1 className="splash-title">
          Fit<span>Track</span>
        </h1>

        {/* Slogan */}
        <p className="splash-tagline">
          Transforme ton corps, repousse tes limites
        </p>

        {/* Icônes animées */}
        <div className="splash-icons">
          <div className="splash-icon" style={{ animationDelay: '0.2s' }}>
            <Flame size={24} />
          </div>
          <div className="splash-icon" style={{ animationDelay: '0.4s' }}>
            <TrendingUp size={24} />
          </div>
          <div className="splash-icon" style={{ animationDelay: '0.6s' }}>
            <Dumbbell size={24} />
          </div>
        </div>

        {/* Loader */}
        <div className="splash-loader">
          <div className="loader-bar"></div>
        </div>

        {/* Version */}
        <div className="splash-version">
          Version 2.1.0
        </div>
      </div>

      {/* Particules décoratives */}
      <div className="splash-particles">
        <div className="particle" style={{ top: '10%', left: '15%', animationDelay: '0s' }}></div>
        <div className="particle" style={{ top: '20%', right: '20%', animationDelay: '1s' }}></div>
        <div className="particle" style={{ bottom: '15%', left: '25%', animationDelay: '2s' }}></div>
        <div className="particle" style={{ bottom: '25%', right: '15%', animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
}

export default Splash;
