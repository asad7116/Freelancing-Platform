import React from "react";
import "../styles/exploreSection.css";
import { ArrowRight, Users, CheckCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function ExploreSection() {
  return (
    <section className="explore">
      <div className="explore-container">
        {/* Left Side: Text */}
        <div className="explore-content">
          <h4 className="explore-subtitle">Explore New Life</h4>
          <h2 className="explore-title">
            Don't just find. Be found - put your CV in front of great employers
          </h2>
          <p className="explore-text">
            Connect with top employers and showcase your skills. Get discovered
            by companies looking for talented professionals like you.
          </p>

          <Link to="/signup?role=client" className="explore-btn">
            <span>Job Post Now</span>
            <ArrowRight size={18} />
          </Link>

          {/* Stats */}
          <div className="explore-stats">
            <div className="explore-stat">
              <Users size={24} className="stat-icon" />
              <h3>950M+</h3>
              <p>Total Freelancers</p>
            </div>
            <div className="explore-stat">
              <CheckCircle size={24} className="stat-icon" />
              <h3>32M+</h3>
              <p>Projects Completed</p>
            </div>
            <div className="explore-stat">
              <TrendingUp size={24} className="stat-icon" />
              <h3>120M+</h3>
              <p>Success Rate</p>
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