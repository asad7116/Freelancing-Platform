import React from "react";
import "../styles/Hero.css";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="hero-one">
      <div className="hero-container row">
        
        {/* Left Column */}
        <div className="left-col">
          <h1
            className="hero-one-title"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-easing="linear"
          >
            Find Your Perfect <span>Freelancer</span> Quick and Easy
          </h1>

          {/* Auth Buttons */}
          <div className="hero-auth-buttons">
            <Link to="/auth" className="hero-btn hero-login-btn">
              Login
            </Link>
            <Link to="/auth" className="hero-btn hero-signup-btn">
              Sign Up
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stats">
              <img
                src="/assets/hero/group-img.png"
                className="hero-group-img"
                alt="Customers"
              />
              <div>
                <h3 className="hero-counter-title">35M+</h3>
                <p>Happy Customers</p>
              </div>
            </div>

            <div className="rating">
              <p>4.9</p>
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-col">
          <img
            src="/assets/hero/ill-1.png"
            className="hero-one-img"
            alt="Freelancer Illustration"
          />
        </div>
      </div>
    </section>
  );
}