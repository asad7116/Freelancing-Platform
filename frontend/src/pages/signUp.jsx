import React, { useState, useEffect, useCallback, useRef } from "react";
import "../styles/Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import ToggleButtons from "../components/Login_Toggle";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function SignUp() {
  const { t } = useLanguage();
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleMode, setIsGoogleMode] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const navigate = useNavigate();
  
  // Use ref to store the latest navigate for the callback
  const navigateRef = useRef(navigate);
  
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  // Mouse tracking for animated shapes
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Check if we're in Google auth mode
  useEffect(() => {
    const googleAuthMode = localStorage.getItem('googleAuthNewUser') === 'true';
    if (googleAuthMode) {
      setIsGoogleMode(true);
      localStorage.removeItem('googleAuthNewUser');
    } else {
      setIsGoogleMode(false);
    }
  }, []);

  // Google response handler using refs to avoid stale closure
  const handleGoogleResponse = useCallback(async (response) => {
    try {
      setLoading(true);
      setError("");
      const id_token = response?.credential;
      if (!id_token) throw new Error('No id_token received from Google');

      const data = await api.post('/api/auth/google', { id_token });
      const user = data.user;
      if (user) {
        if (user.isNewUser && !user.role) {
          localStorage.setItem('googleAuthNewUser', 'true');
          setIsGoogleMode(true);
          setRole('');
          setError('Please select your role (Buyer or Freelancer)');
          setLoading(false);
        } else {
          localStorage.setItem('role', user.role);
          const dest = user.role === 'client' ? '/client/overview' : '/freelancer/overview';
          navigateRef.current(dest, { replace: true });
        }
      } else {
        throw new Error('Google sign-up failed');
      }
    } catch (err) {
      console.error('Google sign-up error:', err);
      setError(err.message || 'Google sign-up failed');
      setLoading(false);
    }
  }, []);

  // Initialize Google button when library is loaded
  const initializeGoogleButton = useCallback(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleResponse,
      use_fedcm_for_prompt: false,
    });

    const btn = document.getElementById('google-button-signup');
    if (btn) {
      // Clear any existing button content
      btn.innerHTML = '';
      window.google.accounts.id.renderButton(btn, {
        theme: 'outline',
        size: 'large',
        width: 280,
        text: 'signup_with',
      });
    }
  }, [handleGoogleResponse]);

  // Load Google Identity Services script
  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('REACT_APP_GOOGLE_CLIENT_ID not set - Google Sign-In disabled');
      return;
    }

    const loadGoogleScript = () => {
      const existing = document.getElementById('google-identity-script');
      if (existing) {
        // Script already exists, check if Google is loaded
        if (window.google?.accounts?.id) {
          setGoogleLoaded(true);
        }
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.id = 'google-identity-script';
      script.onload = () => {
        setGoogleLoaded(true);
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  // Initialize button when Google is loaded or component mounts
  useEffect(() => {
    if (googleLoaded && !isGoogleMode) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(initializeGoogleButton, 100);
      return () => clearTimeout(timer);
    }
  }, [googleLoaded, isGoogleMode, initializeGoogleButton]);

  // Re-initialize if script was already loaded (e.g., navigation from another page)
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setGoogleLoaded(true);
    }
  }, []);

  function normalizeRole(label) {
    const v = String(label || "").trim().toLowerCase();
    if (["buyer", "client"].includes(v)) return "client";
    if (["seller", "freelancer", "provider"].includes(v)) return "freelancer";
    return "";
  }

  const backendRole = normalizeRole(role);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!backendRole) {
      setError("Please choose Buyer or Freelancer before continuing.");
      return;
    }

    if (!isGoogleMode && password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const isGoogleAuthNewUser = localStorage.getItem('googleAuthNewUser') === 'true';

      if (isGoogleAuthNewUser) {
        const response = await api.put("/api/auth/set-role", { role: backendRole });
        const { user } = response;

        localStorage.removeItem('googleAuthNewUser');
        if (user.role) {
          localStorage.setItem('role', user.role);
        } else {
          throw new Error('Failed to update role - server response missing role field');
        }

        setIsGoogleMode(false);
        const dest = user.role === 'client' ? '/client/overview' : '/freelancer/overview';
        window.location.href = dest;
      } else {
        const { user } = await api.post("/api/auth/signup", {
          name,
          email,
          password,
          role: backendRole,
        });

        localStorage.setItem("role", user.role);
        const dest = user.role === "client" ? "/client/overview" : "/freelancer/overview";
        navigate(dest, { replace: true });
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || "Sign-up failed. Try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Back Button */}
      <Link to="/" className="back-button">
        <ArrowLeft size={20} />
        <span>{t('auth.backToHome')}</span>
      </Link>

      {/* Animated gradient background */}
      <div className="gradient-bg"></div>

      {/* Floating animated shapes */}
      <div
        className="decorative-circle circle-1"
        style={{
          transform: `translate(${mousePosition.x / 20}px, ${mousePosition.y / 20}px)`
        }}
      ></div>
      <div
        className="decorative-circle circle-2"
        style={{
          transform: `translate(${-mousePosition.x / 15}px, ${mousePosition.y / 15}px)`
        }}
      ></div>
      <div
        className="decorative-circle circle-3"
        style={{
          transform: `translate(${mousePosition.x / 10}px, ${-mousePosition.y / 10}px)`
        }}
      ></div>
      <div
        className="decorative-cube cube-1"
        style={{
          transform: `translate(${mousePosition.x / 25}px, ${mousePosition.y / 25}px) rotateX(${mousePosition.y / 5}deg) rotateY(${mousePosition.x / 5}deg)`
        }}
      ></div>

      {/* Signup Card */}
      <div className="auth-card">
        <div className="auth-card-header">
          <Link to="/">
            <img src="/assets/logo/logo.png" alt="Tixe" className="auth-logo" />
          </Link>
          <h1 className="auth-title">{t('auth.createAccount')}</h1>
          <p className="auth-subtitle">{t('auth.joinPlatform')}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Role Selection - Always visible */}
          <div className="form-group">
            <ToggleButtons selected={role} onSelect={setRole} />
          </div>

          {/* Full signup form (hidden in Google mode) */}
          {!isGoogleMode && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  placeholder={t('auth.fullName')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  placeholder={t('auth.emailAddress')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.confirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group show-password-group">
                <label className="show-password-label">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />
                  <span>{t('auth.showPassword')}</span>
                </label>
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? t('auth.creatingAccount') : isGoogleMode ? t('auth.continue') : t('auth.signUp')}
          </button>
        </form>

        {!isGoogleMode && (
          <>
            <div className="divider">
              <span>{t('auth.or')}</span>
            </div>

            <div className="social-signin">
              <div id="google-button-signup" className="google-signin-wrapper"></div>
            </div>
          </>
        )}

        <div className="auth-footer">
          <p>
            {t('auth.alreadyHaveAccount')}{" "}
            <Link to="/signin" className="auth-link">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
