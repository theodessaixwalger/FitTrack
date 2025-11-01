// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MobileOnly from './components/MobileOnly';
import Layout from './components/Layout';
import Home from './pages/Home';
import Nutrition from './pages/Nutrition';
import Exercise from './pages/Exercise';
import Profile from './pages/Profile';
import Auth from './pages/Auth';

// Composant pour protéger les routes
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f0f23'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #1a1a2e',
          borderTop: '5px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" />;
}

// Composant pour rediriger si déjà connecté
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f0f23'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #1a1a2e',
          borderTop: '5px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return user ? <Navigate to="/" /> : children;
}

function App() {
  return (
    <MobileOnly>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Route publique */}
            <Route path="/auth" element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } />

            {/* Routes protégées */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Home />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/exercise" element={<Exercise />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </MobileOnly>
  );
}

export default App;
