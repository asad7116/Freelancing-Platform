import React from "react";
import { Link } from "react-router-dom";
import "../styles/AuthChoice.css";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function AuthChoice() {
  const { t } = useLanguage();

  return (
    <div className="auth-choice-wrapper">
      {/* Back Button */}
      <Link to="/" className="back-button">
        <ArrowLeft size={20} />
        <span>{t('auth.backToHome')}</span>
      </Link>

      <div className="auth-choice-container">
        {/* Background Gradient */}
        <div className="gradient-bg"></div>

        {/* Content */}
        <div className="auth-choice-content">
          {/* Logo/Brand */}
          <Link to="/" className="brand-section" style={{ textDecoration: 'none' }}>
            <img src="/assets/logo/logo.png" alt="Tixe Logo" className="auth-logo" />
            <h1 className="auth-title">{t('auth.welcomeToTixe')}</h1>
            <p className="auth-subtitle">{t('auth.aiPoweredPlatform')}</p>
          </Link>

          {/* Main Message */}
          <div className="auth-message">
            <h2 className="welcome-heading">{t('auth.letsGetStarted')}</h2>
            <p className="welcome-text">
              {t('auth.chooseHowToContinue')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="auth-buttons-container">
            <Link to="/signin" className="auth-choice-btn signin-choice-btn">
              <span className="btn-text">{t('auth.signIn')}</span>
              <span className="btn-arrow">→</span>
            </Link>

            <Link to="/signup" className="auth-choice-btn signup-choice-btn">
              <span className="btn-text">{t('auth.signUp')}</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>

          {/* Bottom hint */}
          <div className="auth-hint">
            <p>{t('auth.clickToContinue')}</p>
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
