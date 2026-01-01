import React from "react";
import "../styles/CallToAction.css";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CallToAction() {
  return (
    <section className="cta-section">
      <div className="cta-container">
        {/* Left Side Content */}
        <div className="cta-content">
          <h2 className="cta-title">
            Find the talent needed to get your business growing.
          </h2>
          <p className="cta-subtitle">
            Connect with skilled professionals and build the perfect team for
            your projects. Scale your business with vetted talent from around
            the world.
          </p>
          <Link to="/signup?role=freelancer" className="cta-btn">
            <span>Get Started</span>
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