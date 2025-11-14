import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import "../styles/Signin.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UX states (no CSS class changes)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Load Google Identity Services script
  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('REACT_APP_GOOGLE_CLIENT_ID not set - Google Sign-In disabled');
      return;
    }

    // Load script if not already loaded
    const existing = document.getElementById('google-identity-script');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.id = 'google-identity-script';
      script.onload = () => {
        console.log('✅ Google Identity script loaded');
        if (window.google && window.google.accounts && window.google.accounts.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse,
          });
          console.log('✅ Google Identity initialized');
          // Render button into the container
          const btn = document.getElementById('google-button-signin');
          if (btn) {
            window.google.accounts.id.renderButton(btn, { 
              theme: 'outline', 
              size: 'large',
              width: '100%'
            });
            console.log('✅ Google button rendered');
          }
        }
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google Identity script');
      };
      document.body.appendChild(script);
    }
  }, []);

  // Fallback: if Google button doesn't render, use this manual handler
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
      console.log('📨 Google response received');
      setLoading(true);
      const id_token = response?.credential;
      if (!id_token) throw new Error('No id_token received from Google');

      console.log('🔒 Sending token to backend...');
      const data = await api.post('/api/auth/google', { id_token });
      const user = data.user;
      if (user) {
        console.log('✅ User authenticated:', user);
        
        // If new user has no role yet, redirect to signup to select role
        if (user.isNewUser && !user.role) {
          console.log('📋 New user - redirecting to signup for role selection');
          localStorage.setItem('googleAuthNewUser', 'true');
          navigate('/signUp', { replace: true });
        } else {
          // Existing user or already has role
          localStorage.setItem('role', user.role);
          const backTo = location.state?.from?.pathname || (user.role === 'client' ? '/client/overview' : '/freelancer/overview');
          navigate(backTo, { replace: true });
        }
      } else {
        throw new Error('Google sign-in failed');
      }
    } catch (err) {
      console.error('❌ Google sign-in error:', err);
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

      // TEMP: keep RequireRole working for now
      localStorage.setItem("role", user.role);

      // if we came from a protected page, go back there; else by role
      const backTo =
        location.state?.from?.pathname ||
        (user.role === "client" ? "/client/overview" : "/freelancer/overview");

      navigate(backTo, { replace: true });
    } catch (err) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <PageHeader title="Sign In" />
      <div className="signin-container">
        <div className="signin-box">
          {/* Left - Form */}
          <div className="signin-form">
            <h2>Sign In</h2>
            <p className="welcome-text">Welcome to Tixe</p>

            <form onSubmit={handleSubmit}>
              <label>Email *</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>Password *</label>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="options">
                <label>
                  <input type="checkbox" /> Remember Me
                </label>
                <Link to="#">Forget Password?</Link>
              </div>

              {/* lightweight error text */}
              {error && <div className="form-error" style={{ color: "#d33", marginTop: 6 }}>{error}</div>}

              <button type="submit" className="signin-btn" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="divider">OR</div>

            <div className="social-login">
              {/* <button className="social-btn">f</button> */}
              <div id="google-button-signin" style={{ display: 'inline-block' }}>
                <button 
                  type="button" 
                  className="social-btn" 
                  onClick={handleGoogleManualClickSignin}
                  title="Sign in with Google"
                >
                  G
                </button>
              </div>
            </div>

            <p className="create-account">
              Do not have an account? <Link to="/signUp">Create Account</Link>
            </p>
          </div>

          {/* Right - Image */}
          <div className="signin-image">
            <img src="assets/img/Login/1.png" alt="Sign in" />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
