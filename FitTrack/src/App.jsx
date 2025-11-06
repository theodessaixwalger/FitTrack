// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getUserProfile } from './services/profileService';
import MobileOnly from './components/MobileOnly';
import Layout from './components/Layout';
import Home from './pages/Home';
import Nutrition from './pages/Nutrition';
import Exercise from './pages/Exercise';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding'; // ✅ Import de la nouvelle page

// Composant de chargement réutilisable
function LoadingSpinner() {
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

// ✅ Nouveau : Composant pour protéger les routes et gérer l'onboarding
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    async function checkProfile() {
      if (user) {
        try {
          const userProfile = await getUserProfile();
          setProfile(userProfile);
        } catch (error) {
          console.error('Erreur chargement profil:', error);
        }
      }
      setCheckingProfile(false);
    }
    
    if (!loading) {
      checkProfile();
    }
  }, [user, loading]);

  // En cours de vérification de l'authentification ou du profil
  if (loading || checkingProfile) {
    return <LoadingSpinner />;
  }

  // Pas connecté → rediriger vers Auth
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Connecté mais pas de profil ou onboarding non terminé → rediriger vers Onboarding
  if (!profile || !profile.onboarding_completed) {
    return <Navigate to="/onboarding" />;
  }

  // Tout est OK → afficher la page demandée
  return children;
}

// Composant pour rediriger si déjà connecté
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <Navigate to="/" /> : children;
}

// ✅ Nouveau : Route d'onboarding (accessible uniquement si connecté)
function OnboardingRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Pas connecté → rediriger vers Auth
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Connecté → afficher l'onboarding
  return children;
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

            {/* ✅ Route d'onboarding */}
            <Route path="/onboarding" element={
              <OnboardingRoute>
                <Onboarding />
              </OnboardingRoute>
            } />

            {/* Routes protégées (nécessitent authentification + profil complété) */}
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
