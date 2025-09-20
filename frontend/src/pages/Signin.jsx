import React, { useState } from "react";
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
              <button className="social-btn">f</button>
              <button className="social-btn">G</button>
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
