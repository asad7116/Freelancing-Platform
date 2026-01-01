import React from "react";
import { Link } from "react-router-dom";
import "../styles/AuthChoice.css";

export default function AuthChoice() {
  return (
    <div className="auth-choice-wrapper">
      <div className="auth-choice-container">
        {/* Background Gradient */}
        <div className="gradient-bg"></div>
        
        {/* Content */}
        <div className="auth-choice-content">
          {/* Logo/Brand */}
          <div className="brand-section">
            <img src="/assets/logo/logo.png" alt="WorkZone Logo" className="auth-logo" />
            <h1 className="auth-title">Welcome to WorkZone</h1>
            <p className="auth-subtitle">Your AI-Powered Freelancing Platform</p>
          </div>

          {/* Main Message */}
          <div className="auth-message">
            <h2 className="welcome-heading">Let's get started</h2>
            <p className="welcome-text">
              Choose how you'd like to continue your journey with us
            </p>
          </div>

          {/* Action Buttons */}
          <div className="auth-buttons-container">
            <Link to="/signin" className="auth-choice-btn signin-choice-btn">
              <span className="btn-text">Sign In</span>
              <span className="btn-arrow">→</span>
            </Link>

            <Link to="/signup" className="auth-choice-btn signup-choice-btn">
              <span className="btn-text">Sign Up</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>

          {/* Bottom hint */}
          <div className="auth-hint">
            <p>Click a button to continue</p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="decorative-circle circle-1"></div>
        <div className="decorative-circle circle-2"></div>
        <div className="decorative-circle circle-3"></div>
      </div>
    </div>
  );
}
