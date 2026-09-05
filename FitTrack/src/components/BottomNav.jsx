import { Link, useLocation } from 'react-router-dom';
import { House, ForkKnife, Barbell, User } from '@phosphor-icons/react';

function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: House, label: 'Accueil' },
    { path: '/nutrition', icon: ForkKnife, label: 'Nutrition' },
    { path: '/exercise', icon: Barbell, label: 'Exercices' },
    { path: '/profile', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <Icon size={22} />
            </span>
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default BottomNav;
