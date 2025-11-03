import React from "react";
import "../styles/Hero.css";
import { Search, Star } from "lucide-react";

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

          {/* Search Form */}
          <div className="hero-search-form">
            <form className="form" action="/services">
              <div className="hero-form-wrapper">
                <select className="form-select" name="category">
                  <option value="">All Categories</option>
                  <option value="marketing">Marketing</option>
                  <option value="architecture">Architecture</option>
                  <option value="web-design">Web Design</option>
                  <option value="ai-services">AI Services</option>
                  <option value="business-style">Business Style</option>
                  <option value="development-it">Development & IT</option>
                  <option value="photography">Photography</option>
                  <option value="design-creative">Design & Creative</option>
                  <option value="programming">Programming</option>
                  <option value="animation">Animation</option>
                  <option value="digital-marketing">Digital Marketing</option>
                  <option value="graphics-design">Graphics & Design</option>
                </select>

                <div className="hero-search-bar">
                  <input
                    type="text"
                    className="form-search-input"
                    placeholder="Search for any service"
                    name="search"
                  />
                  <button className="hero-form-btn" type="submit">
                    <Search size={19} />
                    Search
                  </button>
                </div>
              </div>
            </form>
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