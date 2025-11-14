// src/pages/signUp.jsx
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import ToggleButtons from "../components/Login_Toggle"; // import toggle
import "../styles/Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function SignUp() {
  // IMPORTANT: start as empty so you NOTICE if toggle never sets it
  const [role, setRole] = useState(""); // "Buyer" | "Seller"/"Freelancer"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleMode, setIsGoogleMode] = useState(false); // New flag

  const navigate = useNavigate();

  // Check if we're in Google auth mode
  useEffect(() => {
    const googleAuthMode = localStorage.getItem('googleAuthNewUser') === 'true';
    console.log('🔍 Checking Google auth mode:', googleAuthMode);
    if (googleAuthMode) {
      setIsGoogleMode(true);
      console.log('✅ In Google auth mode - showing role selection only');
      // Clear the flag immediately so if user comes back to signup page normally, they see full form
      localStorage.removeItem('googleAuthNewUser');
    } else {
      setIsGoogleMode(false);
    }
  }, []);

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
          const btn = document.getElementById('google-button');
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
  const handleGoogleManualClick = () => {
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
        
        // If new user has no role yet, show role selection on signup page
        if (user.isNewUser && !user.role) {
          console.log('📋 New user - showing role selection');
          // Set a flag so form shows role selection
          localStorage.setItem('googleAuthNewUser', 'true');
          setIsGoogleMode(true); // Immediately show Google mode UI
          setRole(''); // Reset form to show role selection
          setError('Please select your role (Buyer or Seller)');
          setLoading(false); // Don't stay in loading state
        } else {
          // Existing user or already has role
          localStorage.setItem('role', user.role);
          console.log('✅ Redirecting to dashboard with role:', user.role);
          const dest = user.role === 'client' ? '/client/overview' : '/freelancer/overview';
          navigate(dest, { replace: true });
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

  // UI label -> backend value
  function normalizeRole(label) {
    const v = String(label || "").trim().toLowerCase();
    if (["buyer", "client"].includes(v)) return "client";
    if (["seller", "freelancer", "provider"].includes(v)) return "freelancer";
    return ""; // return empty so we can block submit if toggle didn't work
  }

  // this is what we will send to backend
  const backendRole = normalizeRole(role);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!backendRole) {
      setError("Please choose Buyer or Seller before continuing.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      // Check if this is a Google auth user setting their role
      const isGoogleAuthNewUser = localStorage.getItem('googleAuthNewUser') === 'true';
      console.log('🔍 isGoogleAuthNewUser:', isGoogleAuthNewUser);
      
      if (isGoogleAuthNewUser) {
        // Call set-role endpoint
        console.log("📝 Setting role for Google auth user:", backendRole);
        const response = await api.put("/api/auth/set-role", { role: backendRole });
        console.log('📥 PUT /api/auth/set-role response:', response);
        
        const { user } = response;
        console.log('👤 User from response:', user);
        console.log('👤 user.role:', user?.role);
        
        // Clear Google auth flag first
        localStorage.removeItem('googleAuthNewUser');
        
        // Set role in localStorage BEFORE navigating
        if (user.role) {
          localStorage.setItem('role', user.role);
          console.log('✅ Role saved to localStorage:', user.role);
        } else {
          console.error('❌ user.role is missing or null:', user);
          throw new Error('Failed to update role - server response missing role field');
        }
        
        // Set Google mode to false so next time page loads normally
        setIsGoogleMode(false);
        
        const dest = user.role === 'client' ? '/client' : '/freelancer';
        console.log('🎯 Destination:', dest);
        console.log('🚀 About to navigate to:', dest);
        
        // Use window.location to force a full page reload
        window.location.href = dest;
      } else {
        // Regular sign-up flow
        console.log("UI role:", role, "=> backend role:", backendRole);
        const { user } = await api.post("/api/auth/signup", {
          name,
          email,
          password,
          role: backendRole,
        });

        // TEMP: keep your current guard working
        localStorage.setItem("role", user.role);

        const dest = user.role === "client" ? "/client/overview" : "/freelancer/overview";
        navigate(dest, { replace: true });
      }
    } catch (err) {
      console.error('❌ handleSubmit error:', err);
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <PageHeader title="Sign Up" />
      <div className="signup-container">
        <div className="signup-box">
          {/* Left - Form */}
          <div className="signup-form">
            <h2>Sign Up</h2>
            <p className="welcome-text">Welcome to Tixe</p>

            {isGoogleMode ? (
              // Simplified form for Google auth users - just role selection
              <>
                <h3 style={{ marginTop: 20, marginBottom: 10 }}>Complete Your Profile</h3>
                <p style={{ color: '#666', marginBottom: 20 }}>Select whether you want to be a Buyer or Seller</p>
                
                {/* Toggle: pass BOTH selected + onSelect so it's controlled */}
                <ToggleButtons
                  selected={role}
                  onSelect={(r) => {
                    setRole(r);
                    console.log("Toggle selected:", r);
                  }}
                />

                <form onSubmit={handleSubmit} className="signup-form-inner">
                  {/* Show what the UI thinks is selected (debug text, no CSS change) */}
                  <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
                    Selected role: <strong>{role || "— nothing selected —"}</strong>
                  </div>

                  {/* Hidden input keeps normalized value for inspection/devtools */}
                  <input type="hidden" name="role" value={backendRole} />

                  {error && (
                    <div className="form-error" style={{ color: "#d33", marginTop: 6 }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="signup-btn" disabled={loading || !backendRole}>
                    {loading ? "Completing..." : "Complete Sign Up"}
                  </button>
                </form>
              </>
            ) : (
              // Full signup form
              <>
                {/* Toggle: pass BOTH selected + onSelect so it's controlled */}
                <ToggleButtons
                  selected={role}
                  onSelect={(r) => {
                    setRole(r);
                    console.log("Toggle selected:", r);
                  }}
                />

                {/* SignUp Form */}
                <form onSubmit={handleSubmit} className="signup-form-inner">
                  {/* Show what the UI thinks is selected (debug text, no CSS change) */}
                  <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
                    Selected role: <strong>{role || "— nothing selected —"}</strong>
                  </div>

                  {/* Hidden input keeps normalized value for inspection/devtools */}
                  <input type="hidden" name="role" value={backendRole} />

                  <label>Name *</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

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

                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  {error && (
                    <div className="form-error" style={{ color: "#d33", marginTop: 6 }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="signup-btn" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                  </button>
                </form>

                <div className="divider">OR</div>

                <div className="social-login">
                  {/* <button className="social-btn">f</button> */}
                  <div id="google-button" style={{ display: 'inline-block' }}>
                    <button 
                      type="button" 
                      className="social-btn" 
                      onClick={handleGoogleManualClick}
                      title="Sign up with Google"
                    >
                      G
                    </button>
                  </div>
                </div>

                <p className="already-account">
                  Already have an account? <Link to="/signin">Sign In</Link>
                </p>
              </>
            )}
          </div>

          {/* Right - Image */}
          <div className="signup-image">
            <img src="assets/img/Login/1.png" alt="Sign up" />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
