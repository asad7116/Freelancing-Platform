import React from "react";
import "../styles/exploreSection.css";

export default function ExploreSection() {
  return (
    <section className="explore">
      <div className="explore-container">
        {/* Left Side: Text */}
        <div className="explore-content">
          <h4 className="explore-subtitle">Explore New Life</h4>
          <h2 className="explore-title">
            Don’t just find. Be found put your CV in front of great employers
          </h2>
          <p className="explore-text">
            There are many variations of passages of Lorem Ipsum available,
            but the majority have suffered alteration in some form, by injected
            humour, or randomised words.
          </p>

          <button className="explore-btn">Job Post Now →</button>

          {/* Stats */}
          <div className="explore-stats">
            <div className="explore-stat">
              <h3>950M+</h3>
              <p>Total Freelancers</p>
            </div>
            <div className="explore-stat">
              <h3>32M+</h3>
              <p>Total Freelancers</p>
            </div>
            <div className="explore-stat">
              <h3>120M+</h3>
              <p>Total Freelancers</p>
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
