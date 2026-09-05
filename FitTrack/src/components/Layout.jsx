// src/components/Layout.jsx
import { Outlet } from 'react-router-dom';
import { House, ForkKnife, Barbell, User } from '@phosphor-icons/react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css'

function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: House, label: 'Accueil' },
    { path: '/nutrition', icon: ForkKnife, label: 'Nutrition' },
    { path: '/exercise', icon: Barbell, label: 'Exercice' },
    { path: '/profile', icon: User, label: 'Profil' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxWidth: '480px',
      margin: '0 auto',
      background: 'var(--bg)',
      position: 'relative'
    }}>
      {/* Contenu principal */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: '92px',
        background: 'var(--bg)',
        WebkitOverflowScrolling: 'touch'
      }}>
        <Outlet />
      </main>

      {/* Navigation bottom */}
      <nav className="bottom-nav">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <Icon size={22} />
              </span>
              <span className="nav-label">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Layout;
