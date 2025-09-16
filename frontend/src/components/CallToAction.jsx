import React from "react";
import "../styles/CallToAction.css";

export default function CallToAction() {
  return (
    <section className="cta-section">
      <div className="cta-container">
        {/* Left Side Content */}
        <div className="cta-content">
          <h2 className="cta-title">
            Find the talent needed to get <br /> your business growing.
          </h2>
          <p className="cta-subtitle">
            There are many variations of passages of Lorem Ipsum available,
            but the majority have suffered alteration in some form,
            by injected humour.
          </p>
          <button className="cta-btn">Get Started →</button>
        </div>

        {/* Right Side Image */}
        <div className="cta-image">
          <img src="/assets/homepage/men-women.png" alt="Business Team" />
        </div>
      </div>
    </section>
  );
}
