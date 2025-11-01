// src/components/Layout.jsx
import { Outlet } from 'react-router-dom';
import { Home, Apple, Dumbbell, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css'

function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/nutrition', icon: Apple, label: 'Nutrition' },
    { path: '/exercise', icon: Dumbbell, label: 'Exercice' },
    { path: '/profile', icon: User, label: 'Profil' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxWidth: '480px',
      margin: '0 auto',
      background: '#f5f5f5',
      position: 'relative'
    }}>
      {/* Contenu principal */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: '80px',
        WebkitOverflowScrolling: 'touch'
      }}>
        <Outlet />
      </main>

      {/* Navigation bottom */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '480px',
        margin: '0 auto',
        background: 'white',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000
      }}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                color: isActive ? 'var(--primary)' : '#999',
                padding: '5px 15px',
                borderRadius: '10px',
                minWidth: '60px',
                transition: 'all 0.2s ease',
                background: isActive ? 'rgba(255, 107, 53, 0.15)' : 'transparent'

              }}
            >
              <Icon size={24} />
              <span style={{
                fontSize: '12px',
                marginTop: '4px',
                fontWeight: 500
              }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Layout;
