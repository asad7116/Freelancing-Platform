import React from "react";
import "../styles/Hero.css";

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
                  <button className="hero-form-btn">
                    <svg
                      width="19"
                      height="18"
                      viewBox="0 0 19 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15Z"
                        stroke="#F2F2F2"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18 17L14 13"
                        stroke="#F2F2F2"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="far fa-star"></i>
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
