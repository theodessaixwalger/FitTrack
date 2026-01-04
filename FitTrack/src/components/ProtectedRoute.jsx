// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();



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

    return <Navigate to="/login" replace />;
  }

  // Tout est OK, afficher le contenu

  return children;
}

export default ProtectedRoute;
