// src/pages/signUp.jsx
import React, { useState } from "react";
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

  const navigate = useNavigate();

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
    } catch (err) {
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
              <button className="social-btn">f</button>
              <button className="social-btn">G</button>
            </div>

            <p className="already-account">
              Already have an account? <Link to="/signin">Sign In</Link>
            </p>
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
