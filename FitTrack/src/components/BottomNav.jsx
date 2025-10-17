import { Link, useLocation } from 'react-router-dom';
import { Home, Utensils, Dumbbell, User } from 'lucide-react';

function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/nutrition', icon: Utensils, label: 'Nutrition' },
    { path: '/exercise', icon: Dumbbell, label: 'Exercices' },
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
            <Icon size={24} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default BottomNav;
