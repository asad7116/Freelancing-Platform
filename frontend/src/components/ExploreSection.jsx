import React from "react";
import "../styles/exploreSection.css";
import { ArrowRight, Users, CheckCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function ExploreSection() {
  const { t } = useLanguage();

  return (
    <section className="explore">
      <div className="explore-container">
        {/* Left Side: Text */}
        <div className="explore-content">
          <h4 className="explore-subtitle">{t('explore.subtitle')}</h4>
          <h2 className="explore-title">
            {t('explore.title')}
          </h2>
          <p className="explore-text">
            {t('explore.description')}
          </p>

          <Link to="/signup?role=client" className="explore-btn">
            <span>{t('explore.postJobNow')}</span>
            <ArrowRight size={18} />
          </Link>

          {/* Stats */}
          <div className="explore-stats">
            <div className="explore-stat">
              <Users size={24} className="stat-icon" />
              <h3>950M+</h3>
              <p>{t('explore.totalFreelancers')}</p>
            </div>
            <div className="explore-stat">
              <CheckCircle size={24} className="stat-icon" />
              <h3>32M+</h3>
              <p>{t('explore.projectsCompleted')}</p>
            </div>
            <div className="explore-stat">
              <TrendingUp size={24} className="stat-icon" />
              <h3>120M+</h3>
              <p>{t('explore.successRate')}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="explore-image">
          <img src="/assets/homepage/Explore.png" alt="Team working" />
        </div>
      </div>
    </section>
  );
}