import React, { useState, useEffect, useCallback, useRef } from "react";
import "../styles/Signin.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { ArrowLeft } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  
  // Use ref to store the latest navigate and location for the callback
  const navigateRef = useRef(navigate);
  const locationRef = useRef(location);
  
  useEffect(() => {
    navigateRef.current = navigate;
    locationRef.current = location;
  }, [navigate, location]);

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
          navigateRef.current('/signUp', { replace: true });
        } else {
          localStorage.setItem('role', user.role);
          const backTo = locationRef.current.state?.from?.pathname || (user.role === 'client' ? '/client/overview' : '/freelancer/overview');
          navigateRef.current(backTo, { replace: true });
        }
      } else {
        throw new Error('Google sign-in failed');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Google sign-in failed');
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

    const btn = document.getElementById('google-button-signin');
    if (btn) {
      // Clear any existing button content
      btn.innerHTML = '';
      window.google.accounts.id.renderButton(btn, {
        theme: 'outline',
        size: 'large',
        width: 280,
        text: 'signin_with',
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
    if (googleLoaded) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(initializeGoogleButton, 100);
      return () => clearTimeout(timer);
    }
  }, [googleLoaded, initializeGoogleButton]);

  // Re-initialize if script was already loaded (e.g., navigation from another page)
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setGoogleLoaded(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/signin", { email, password });
      
      if (!response || !response.user) {
        throw new Error("Invalid response from server");
      }
      
      const { user } = response;
      localStorage.setItem("role", user.role);

      const backTo =
        location.state?.from?.pathname ||
        (user.role === "client" ? "/client/overview" : "/freelancer/overview");

      navigate(backTo, { replace: true });
    } catch (err) {
      const msg = err.message || "Sign-in failed. Try again.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Back Button */}
      <Link to="/" className="back-button">
        <ArrowLeft size={20} />
        <span>Back to Home</span>
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

      {/* Signin Card */}
      <div className="auth-card">
        <div className="auth-card-header">
          <Link to="/">
            <img src="/assets/logo/logo.png" alt="Tixe" className="auth-logo" />
          </Link>
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
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              <span>Show Password</span>
            </label>
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
