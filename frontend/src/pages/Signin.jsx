import React, { useState, useEffect } from "react";
import "../styles/Signin.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();
  const location = useLocation();

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

  // Load Google Identity Services script
  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('REACT_APP_GOOGLE_CLIENT_ID not set - Google Sign-In disabled');
      return;
    }

    const existing = document.getElementById('google-identity-script');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.id = 'google-identity-script';
      script.onload = () => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse,
          });
          const btn = document.getElementById('google-button-signin');
          if (btn) {
            window.google.accounts.id.renderButton(btn, { 
              theme: 'outline', 
              size: 'large',
              width: '100%'
            });
          }
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleManualClickSignin = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google Sign-In not configured. Please contact support.');
      return;
    }
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google Sign-In library not loaded. Please refresh and try again.');
    }
  };

  async function handleGoogleResponse(response) {
    try {
      setLoading(true);
      const id_token = response?.credential;
      if (!id_token) throw new Error('No id_token received from Google');

      const data = await api.post('/api/auth/google', { id_token });
      const user = data.user;
      if (user) {
        if (user.isNewUser && !user.role) {
          localStorage.setItem('googleAuthNewUser', 'true');
          navigate('/signUp', { replace: true });
        } else {
          localStorage.setItem('role', user.role);
          const backTo = location.state?.from?.pathname || (user.role === 'client' ? '/client/overview' : '/freelancer/overview');
          navigate(backTo, { replace: true });
        }
      } else {
        throw new Error('Google sign-in failed');
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user } = await api.post("/api/auth/signin", { email, password });
      localStorage.setItem("role", user.role);

      const backTo =
        location.state?.from?.pathname ||
        (user.role === "client" ? "/client/overview" : "/freelancer/overview");

      navigate(backTo, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Sign-in failed. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
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

      {/* Signin Card */}
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue to your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              id="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="form-input"
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="social-signin">
          <div id="google-button-signin" className="google-signin-wrapper"></div>
          <button 
            onClick={handleGoogleManualClickSignin} 
            className="google-fallback-btn"
            type="button"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="auth-link">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
