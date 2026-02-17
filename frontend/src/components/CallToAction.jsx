import React from "react";
import "../styles/CallToAction.css";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function CallToAction() {
  const { t } = useLanguage();

  return (
    <section className="cta-section">
      <div className="cta-container">
        {/* Left Side Content */}
        <div className="cta-content">
          <h2 className="cta-title">
            {t('cta.title')}
          </h2>
          <p className="cta-subtitle">
            {t('cta.subtitle')}
          </p>
          <Link to="/signup?role=freelancer" className="cta-btn">
            <span>{t('cta.getStarted')}</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Right Side Image */}
        <div className="cta-image">
          <img src="/assets/homepage/men-women.png" alt="Business Team" />
        </div>
      </div>
    </section>
  );
}