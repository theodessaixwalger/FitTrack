// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  console.log('🛡️ ProtectedRoute:', { user: !!user, loading });

  // ⚠️ CRITIQUE : Si loading est true, on attend
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div>Chargement...</div>
      </div>
    );
  }

  // Si pas d'utilisateur, rediriger vers login
  if (!user) {
    console.log('❌ Pas d\'utilisateur, redirect vers /login');
    return <Navigate to="/login" replace />;
  }

  // Tout est OK, afficher le contenu
  console.log('✅ Utilisateur OK, affichage du contenu');
  return children;
}

export default ProtectedRoute;
