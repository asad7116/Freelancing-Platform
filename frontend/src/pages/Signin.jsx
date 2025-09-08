// src/pages/SignIn.jsx
import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import "../styles/Signin.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
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
                <a href="#">Forget Password?</a>
              </div>

              <button type="submit" className="signin-btn">
                Sign In
              </button>
            </form>

            <div className="divider">OR</div>

            <div className="social-login">
              <button className="social-btn">f</button>
              <button className="social-btn">G</button>
            </div>

            <p className="create-account">
              Do not have an account? <a href="/signUp">Create Account</a>
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
