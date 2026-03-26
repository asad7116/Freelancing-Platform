import React, { useState, useEffect, useCallback, useRef } from "react";
import "../styles/AuthPage.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import ToggleButtons from "../components/Login_Toggle";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { t } = useLanguage();
  const { setRole: setAuthRole, setUser: setAuthUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial mode from URL search params (e.g. /auth?mode=signup)
  const searchParams = new URLSearchParams(location.search);
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  const [mode, setMode] = useState(initialMode);

  // ========== Shared state ==========
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // ========== Sign In state ==========
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siShowPassword, setSiShowPassword] = useState(false);

  // ========== Sign Up state ==========
  const [role, setRole] = useState("");
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirmPassword, setSuConfirmPassword] = useState("");
  const [suShowPassword, setSuShowPassword] = useState(false);
  const [isGoogleMode, setIsGoogleMode] = useState(false);

  // Refs for callbacks
  const navigateRef = useRef(navigate);
  const locationRef = useRef(location);

  useEffect(() => {
    navigateRef.current = navigate;
    locationRef.current = location;
  }, [navigate, location]);

  // Clear error when mode switches
  useEffect(() => {
    setError("");
  }, [mode]);

  // Sync mode with URL search params when they change (e.g., navigating with ?mode=signup)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlMode = params.get("mode") === "signup" ? "signup" : "signin";
    setMode(urlMode);
  }, [location.search]);

  // ========== Mouse tracking ==========
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ========== Google Mode check for signup ==========
  useEffect(() => {
    const googleAuthMode = localStorage.getItem("googleAuthNewUser") === "true";
    if (googleAuthMode) {
      setIsGoogleMode(true);
      setMode("signup");
      localStorage.removeItem("googleAuthNewUser");
    } else {
      setIsGoogleMode(false);
    }
  }, []);

  // ========== Google OAuth ==========
  const handleGoogleResponse = useCallback(async (response) => {
    try {
      setLoading(true);
      setError("");
      const id_token = response?.credential;
      if (!id_token) throw new Error("No id_token received from Google");

      const data = await api.post("/api/auth/google", { id_token });
      const user = data.user;
      if (user) {
        if (user.isNewUser && !user.role) {
          localStorage.setItem("googleAuthNewUser", "true");
          setIsGoogleMode(true);
          setMode("signup");
          setRole("");
          setError("Please select your role (Buyer or Freelancer)");
          setLoading(false);
        } else {
          setAuthRole(user.role);
          setAuthUser(user);
          const backTo =
            locationRef.current.state?.from?.pathname ||
            (user.role === "client"
              ? "/client/overview"
              : "/freelancer/overview");
          navigateRef.current(backTo, { replace: true });
        }
      } else {
        throw new Error("Google sign-in failed");
      }
    } catch (err) {
      console.error("Google auth error:", err);
      setError(err.message || "Google authentication failed");
      setLoading(false);
    }
  }, []);

  const initializeGoogleButton = useCallback(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleResponse,
      use_fedcm_for_prompt: false,
    });

    // Render the right button based on current mode
    const buttonId = mode === "signup" ? "google-button-signup" : "google-button-signin";
    const buttonText = mode === "signup" ? "signup_with" : "signin_with";
    const btn = document.getElementById(buttonId);
    if (btn) {
      btn.innerHTML = "";
      window.google.accounts.id.renderButton(btn, {
        theme: "outline",
        size: "large",
        width: 280,
        text: buttonText,
      });
    }
  }, [handleGoogleResponse, mode]);

  // Load Google Identity Services script
  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("REACT_APP_GOOGLE_CLIENT_ID not set - Google Sign-In disabled");
      return;
    }

    const existing = document.getElementById("google-identity-script");
    if (existing) {
      if (window.google?.accounts?.id) {
        setGoogleLoaded(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = "google-identity-script";
    script.onload = () => setGoogleLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Initialize Google button when loaded or mode changes
  useEffect(() => {
    if (googleLoaded && !isGoogleMode) {
      const timer = setTimeout(initializeGoogleButton, 100);
      return () => clearTimeout(timer);
    }
  }, [googleLoaded, isGoogleMode, initializeGoogleButton, mode]);

  // Re-initialize if script already loaded
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setGoogleLoaded(true);
    }
  }, []);

  // ========== Sign In Submit ==========
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/signin", {
        email: siEmail,
        password: siPassword,
      });

      if (!response || !response.user) {
        throw new Error("Invalid response from server");
      }

      const { user } = response;
      setAuthRole(user.role);
      setAuthUser(user);

      const backTo =
        location.state?.from?.pathname ||
        (user.role === "client" ? "/client/overview" : "/freelancer/overview");

      navigate(backTo, { replace: true });
    } catch (err) {
      const msg = err.message || "Sign-in failed. Try again.";
      if (msg.toLowerCase().includes("verify your email")) {
        navigate(`/verify-email?email=${encodeURIComponent(siEmail)}`);
        return;
      }
      setError(msg);
      setLoading(false);
    }
  };

  // ========== Sign Up Submit ==========
  function normalizeRole(label) {
    const v = String(label || "").trim().toLowerCase();
    if (["buyer", "client"].includes(v)) return "client";
    if (["seller", "freelancer", "provider"].includes(v)) return "freelancer";
    return "";
  }

  const backendRole = normalizeRole(role);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (!backendRole) {
      setError("Please choose Buyer or Freelancer before continuing.");
      return;
    }

    if (!isGoogleMode && suPassword !== suConfirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const isGoogleAuthNewUser =
        localStorage.getItem("googleAuthNewUser") === "true";

      if (isGoogleAuthNewUser) {
        const response = await api.put("/api/auth/set-role", {
          role: backendRole,
        });
        const { user } = response;

        localStorage.removeItem("googleAuthNewUser");
        if (user.role) {
          setAuthRole(user.role);
          setAuthUser(user);
        } else {
          throw new Error(
            "Failed to update role - server response missing role field"
          );
        }

        setIsGoogleMode(false);
        const dest =
          user.role === "client" ? "/client/overview" : "/freelancer/overview";
        window.location.href = dest;
      } else {
        const data = await api.post("/api/auth/signup", {
          name: suName,
          email: suEmail,
          password: suPassword,
          role: backendRole,
        });

        if (data.needsVerification) {
          navigate(
            `/verify-email?email=${encodeURIComponent(data.email || suEmail)}`,
            { replace: true }
          );
          return;
        }

        if (data.user) {
          setAuthRole(data.user.role);
          setAuthUser(data.user);
          const dest =
            data.user.role === "client"
              ? "/client/overview"
              : "/freelancer/overview";
          navigate(dest, { replace: true });
        }
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.error || err.message || "Sign-up failed. Try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // ========== Mode switch handler ==========
  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    // Update URL without full navigation
    const newUrl = newMode === "signup" ? "/auth?mode=signup" : "/auth";
    window.history.replaceState(null, "", newUrl);
  };

  // ========== Render ==========
  return (
    <div className="auth-page-split">
      {/* Back Button */}
      <Link to="/" className="auth-back-button">
        <ArrowLeft size={20} />
        <span>{t("auth.backToHome")}</span>
      </Link>

      {/* ===== LEFT PANEL - Branding ===== */}
      <div className="auth-left-panel">
        {/* Animated gradient background */}
        <div className="gradient-bg"></div>

        {/* Decorative circles */}
        <div
          className="decorative-circle circle-1"
          style={{
            transform: `translate(${mousePosition.x / 20}px, ${mousePosition.y / 20}px)`,
          }}
        ></div>
        <div
          className="decorative-circle circle-2"
          style={{
            transform: `translate(${-mousePosition.x / 15}px, ${mousePosition.y / 15}px)`,
          }}
        ></div>
        <div
          className="decorative-circle circle-3"
          style={{
            transform: `translate(${mousePosition.x / 10}px, ${-mousePosition.y / 10}px)`,
          }}
        ></div>

        {/* Branding content */}
        <div className="auth-left-content">
          <Link to="/" className="brand-section" style={{ textDecoration: "none" }}>
            <img
              src="/assets/logo/logo.png"
              alt="Tixe Logo"
              className="auth-brand-logo"
            />
            <h1 className="auth-brand-title">{t("auth.welcomeToTixe")}</h1>
            <p className="auth-brand-subtitle">{t("auth.aiPoweredPlatform")}</p>
          </Link>

          <div className="auth-left-message">
            <h2 className="auth-left-heading">{t("auth.letsGetStarted")}</h2>
            <p className="auth-left-text">{t("auth.chooseHowToContinue")}</p>
          </div>

          {/* Toggle buttons */}
          <div className="auth-mode-buttons">
            <button
              className={`auth-mode-btn ${mode === "signin" ? "active" : ""}`}
              onClick={() => switchMode("signin")}
            >
              <span className="btn-text">{t("auth.signIn")}</span>
              <span className="btn-arrow">→</span>
            </button>

            <button
              className={`auth-mode-btn ${mode === "signup" ? "active" : ""}`}
              onClick={() => switchMode("signup")}
            >
              <span className="btn-text">{t("auth.signUp")}</span>
              <span className="btn-arrow">→</span>
            </button>
          </div>

          <div className="auth-left-hint">
            <p>{t("auth.clickToContinue")}</p>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL - Form ===== */}
      <div className="auth-right-panel">
        <div className="auth-form-card">
          {/* ---- SIGN IN FORM ---- */}
          {mode === "signin" && (
            <div className="auth-form-content" key="signin">
              <div className="auth-card-header">
                <Link to="/">
                  <img
                    src="/assets/logo/logo.png"
                    alt="Tixe"
                    className="auth-form-logo"
                  />
                </Link>
                <h1 className="auth-form-title">{t("auth.welcomeBack")}</h1>
                <p className="auth-form-subtitle">{t("auth.signInSubtitle")}</p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <form className="auth-form" onSubmit={handleSignIn}>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder={t("auth.email")}
                    value={siEmail}
                    onChange={(e) => setSiEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <input
                    type={siShowPassword ? "text" : "password"}
                    placeholder={t("auth.password")}
                    value={siPassword}
                    onChange={(e) => setSiPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="form-input"
                  />
                </div>

                <div className="form-group show-password-group">
                  <label className="show-password-label">
                    <input
                      type="checkbox"
                      checked={siShowPassword}
                      onChange={(e) => setSiShowPassword(e.target.checked)}
                    />
                    <span>{t("auth.showPassword")}</span>
                  </label>
                </div>

                <div className="form-options">
                  <label className="remember-me">
                    <input type="checkbox" />
                    <span>{t("auth.rememberMe")}</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-link">
                    {t("auth.forgotPassword")}
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="auth-submit-btn"
                >
                  {loading ? t("auth.signingIn") : t("auth.signIn")}
                </button>
              </form>

              <div className="divider">
                <span>{t("auth.or")}</span>
              </div>

              <div className="social-signin">
                <div
                  id="google-button-signin"
                  className="google-signin-wrapper"
                ></div>
              </div>

              <div className="auth-footer">
                <p>
                  {t("auth.noAccount")}{" "}
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => switchMode("signup")}
                  >
                    {t("auth.createAccount")}
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ---- SIGN UP FORM ---- */}
          {mode === "signup" && (
            <div className="auth-form-content" key="signup">
              <div className="auth-card-header">
                <Link to="/">
                  <img
                    src="/assets/logo/logo.png"
                    alt="Tixe"
                    className="auth-form-logo"
                  />
                </Link>
                <h1 className="auth-form-title">{t("auth.createAccount")}</h1>
                <p className="auth-form-subtitle">{t("auth.joinPlatform")}</p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <form className="auth-form" onSubmit={handleSignUp}>
                {/* Role Selection */}
                <div className="form-group">
                  <ToggleButtons selected={role} onSelect={setRole} />
                </div>

                {/* Full signup fields (hidden in Google mode) */}
                {!isGoogleMode && (
                  <>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder={t("auth.fullName")}
                        value={suName}
                        onChange={(e) => setSuName(e.target.value)}
                        required
                        disabled={loading}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <input
                        type="email"
                        placeholder={t("auth.emailAddress")}
                        value={suEmail}
                        onChange={(e) => setSuEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <input
                        type={suShowPassword ? "text" : "password"}
                        placeholder={t("auth.password")}
                        value={suPassword}
                        onChange={(e) => setSuPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="form-input"
                      />
                      <PasswordStrengthIndicator 
                        password={suPassword} 
                        showRequirements={true}
                      />
                    </div>

                    <div className="form-group">
                      <input
                        type={suShowPassword ? "text" : "password"}
                        placeholder={t("auth.confirmPassword")}
                        value={suConfirmPassword}
                        onChange={(e) => setSuConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group show-password-group">
                      <label className="show-password-label">
                        <input
                          type="checkbox"
                          checked={suShowPassword}
                          onChange={(e) => setSuShowPassword(e.target.checked)}
                        />
                        <span>{t("auth.showPassword")}</span>
                      </label>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="auth-submit-btn"
                >
                  {loading
                    ? t("auth.creatingAccount")
                    : isGoogleMode
                    ? t("auth.continue")
                    : t("auth.signUp")}
                </button>
              </form>

              {!isGoogleMode && (
                <>
                  <div className="divider">
                    <span>{t("auth.or")}</span>
                  </div>

                  <div className="social-signin">
                    <div
                      id="google-button-signup"
                      className="google-signin-wrapper"
                    ></div>
                  </div>
                </>
              )}

              <div className="auth-footer">
                <p>
                  {t("auth.alreadyHaveAccount")}{" "}
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => switchMode("signin")}
                  >
                    {t("auth.signIn")}
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
