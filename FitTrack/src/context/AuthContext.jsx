// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { isAuthRetryableFetchError } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

// Au lancement depuis l'écran d'accueil (app fermée depuis plus d'une heure),
// le jeton a expiré et Supabase doit le renouveler. Si le réseau n'est pas encore
// prêt, ce renouvellement échoue et getSession() renvoie « pas de session » alors
// que l'utilisateur est bien connecté : on réessaie au lieu d'afficher la connexion.
const SESSION_RETRY_DELAYS_MS = [300, 600, 1200, 2400];

async function restoreSession() {
  for (let attempt = 0; ; attempt++) {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (session || !isAuthRetryableFetchError(error) || attempt >= SESSION_RETRY_DELAYS_MS.length) {
      return session;
    }
    await new Promise((resolve) => setTimeout(resolve, SESSION_RETRY_DELAYS_MS[attempt]));
  }
}

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    restoreSession().then((session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // La session initiale est gérée par restoreSession() (avec ses nouvelles tentatives)
      if (event === 'INITIAL_SESSION') return;
      setUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // Inscription SIMPLIFIÉE
  const signUp = async (email, password, fullName) => {
    try {

      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('❌ Erreur Supabase signUp:', error);
        return { data: null, error };
      }


      return { data, error: null };
      
    } catch (error) {
      console.error('❌ Erreur signUp:', error);
      return { data: null, error: { message: 'Erreur lors de l\'inscription' } };
    }
  };

  // Connexion SIMPLIFIÉE
  const signIn = async (email, password) => {
    try {

      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('❌ Erreur Supabase signIn:', error);
        // Retourner l'erreur originale pour permettre la détection du type d'erreur
        return { 
          data: null, 
          error: error // Retourne l'objet error complet de Supabase
        };
      }


      return { data, error: null };
      
    } catch (error) {
      console.error('❌ Erreur signIn:', error);
      return { data: null, error: { message: 'Erreur lors de la connexion' } };
    }
  };

  // Déconnexion
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erreur signOut:', error);
        return { error };
      }
      return { error: null };
    } catch (error) {
      console.error('❌ Erreur signOut:', error);
      return { error };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
