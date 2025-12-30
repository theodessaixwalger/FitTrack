// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Inscription SIMPLIFIÉE
  const signUp = async (email, password, fullName) => {
    try {
      console.log('📝 Inscription avec:', email);
      
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

      console.log('✅ Inscription réussie:', data);
      return { data, error: null };
      
    } catch (error) {
      console.error('❌ Erreur signUp:', error);
      return { data: null, error: { message: 'Erreur lors de l\'inscription' } };
    }
  };

  // Connexion SIMPLIFIÉE
  const signIn = async (email, password) => {
    try {
      console.log('🔐 Tentative de connexion avec:', email);
      
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

      console.log('✅ Connexion réussie:', data);
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
