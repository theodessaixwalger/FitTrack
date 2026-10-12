// src/pages/Auth.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Envelope, Lock, User, Eye, EyeSlash, WarningCircle, CheckCircle } from '@phosphor-icons/react';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const switchMode = (login) => {
    setIsLogin(login);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    if (!isLogin && !fullName) {
      setError('Veuillez entrer votre nom complet');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Connexion
        const { data, error } = await signIn(email, password);
        if (error) {
          // Vérifier si c'est une erreur d'email non confirmé
          if (error.message.includes('Email not confirmed') ||
              error.message.includes('email_not_confirmed') ||
              error.code === 'email_not_confirmed') {
            setError('Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception.');
          } else if (error.message.includes('Invalid login credentials')) {
            setError('Email ou mot de passe incorrect.');
          } else {
            setError(error.message);
          }
        } else if (data) {
          navigate('/');
        }
      } else {
        // Inscription
        const { data, error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message);
        } else if (data) {
          setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
          setTimeout(() => {
            setIsLogin(true);
            setSuccess('');
          }, 3000);
        }
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Marque */}
        <div className="auth-brand">
          <img src="/icon-192.png" alt="" className="auth-logo" width="80" height="80" />
          <h1>FitTrack</h1>
          <p>{isLogin ? 'Bon retour parmi nous !' : 'Créez votre compte'}</p>
        </div>

        <div className="auth-card glow-card glow-accent">
          {/* Connexion / Inscription */}
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              className={isLogin ? 'is-active' : ''}
              onClick={() => switchMode(true)}
            >
              Connexion
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              className={!isLogin ? 'is-active' : ''}
              onClick={() => switchMode(false)}
            >
              Inscription
            </button>
          </div>

          {/* Messages d'erreur/succès */}
          {error && (
            <div className="auth-alert is-error" role="alert">
              <WarningCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-alert is-success" role="status">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            {/* Pseudo (inscription uniquement) */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="auth-name">Pseudo</label>
                <div className="auth-field">
                  <User size={20} className="auth-field-icon" />
                  <input
                    id="auth-name"
                    type="text"
                    className="input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Votre pseudo"
                    autoComplete="nickname"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label htmlFor="auth-email">Email</label>
              <div className="auth-field">
                <Envelope size={20} className="auth-field-icon" />
                <input
                  id="auth-email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="form-group">
              <label htmlFor="auth-password">Mot de passe</label>
              <div className="auth-field">
                <Lock size={20} className="auth-field-icon" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input has-action"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="auth-field-action"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Bouton submit */}
            <button type="submit" className="btn auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner auth-spinner" />
                  Chargement...
                </>
              ) : (isLogin ? 'Se connecter' : 'S\'inscrire')}
            </button>
          </form>
        </div>

        {/* Lien pour changer de mode */}
        <button
          type="button"
          className="auth-switch"
          onClick={() => switchMode(!isLogin)}
        >
          {isLogin ? (
            <>Pas encore de compte ? <strong>Inscrivez-vous</strong></>
          ) : (
            <>Déjà un compte ? <strong>Connectez-vous</strong></>
          )}
        </button>
      </div>
    </div>
  );
}

export default Auth;
